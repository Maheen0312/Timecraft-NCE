import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { Timetable, ValidationResult, TimetableStatus, Subject, Room, TimetableEntry, TimetableChangeLog, ExtractedTimetableImageResult, TimetableStats } from '@/types/timetable';
import { getAllStaff } from './staffService';
import { getAllSubjects } from './subjectService';
import { getAllLabs } from './labService';
import { getAllRooms } from './roomService';
import { getAllTimeSlots, defaultMasterTimeSlots } from './timeSlotService';
import { getAllSpecialSessions } from './specialSessionService';
import { getSchedulingRules } from './rulesService';
import { TimetableScheduler } from '@/scheduler/scheduler';
import { TimetableValidator } from '@/scheduler/validator';
import { ScheduleOptimizer } from '@/scheduler/optimizer';
import { createVersionSnapshot } from './versionService';
import { getCurrentEngineeringAcademicYear, resolveTimetableAcademicYear } from '@/utils/dateUtils';

const TIMETABLES_COLLECTION = 'timetables';

export interface GenerateOptions {
  department: string;
  year: string;
  semester: string;
  createdBy?: string;
  seed?: number;
  consistentMode?: boolean;
}

export const normalizeDept = (d?: any): string => {
  if (!d) return '';
  const lower = d.toString().toLowerCase();
  if (lower.includes('cse') || lower.includes('computer')) return 'cse';
  if (lower.includes('it') || lower.includes('information')) return 'it';
  if (lower.includes('ece') || lower.includes('electronics')) return 'ece';
  if (lower.includes('mech') || lower.includes('mechanical')) return 'mech';
  return lower.trim();
};

export const generateTimetable = async (options: GenerateOptions): Promise<{
  success: boolean;
  timetable?: Timetable;
  errors?: string[];
  suggestions?: string[];
}> => {
  try {
    const [staff, subjects, labs, rooms, timeSlots, specialSessions, rules] = await Promise.all([
      getAllStaff(),
      getAllSubjects(),
      getAllLabs(),
      getAllRooms(),
      getAllTimeSlots(),
      getAllSpecialSessions(),
      getSchedulingRules(),
    ]);

    // Deduplicate
    const uniqueSubjectsMap = new Map<string, typeof subjects[0]>();
    subjects.forEach(s => {
      if (s.subjectCode && (!uniqueSubjectsMap.has(s.subjectCode) || s.active)) {
        uniqueSubjectsMap.set(s.subjectCode, s);
      }
    });
    const uniqueSubjects = Array.from(uniqueSubjectsMap.values());

    const uniqueStaffMap = new Map<string, typeof staff[0]>();
    staff.forEach(st => {
      if (st.staffCode && (!uniqueStaffMap.has(st.staffCode) || st.active)) {
        uniqueStaffMap.set(st.staffCode, st);
      }
    });
    const uniqueStaff = Array.from(uniqueStaffMap.values());

    const uniqueRoomsMap = new Map<string, typeof rooms[0]>();
    rooms.forEach(r => {
      if (r.roomNumber && (!uniqueRoomsMap.has(r.roomNumber) || r.active)) {
        uniqueRoomsMap.set(r.roomNumber, r);
      }
    });
    const uniqueRooms = Array.from(uniqueRoomsMap.values());

    const uniqueLabsMap = new Map<string, typeof labs[0]>();
    labs.forEach(l => {
      if (l.labCode && (!uniqueLabsMap.has(l.labCode) || l.active)) {
        uniqueLabsMap.set(l.labCode, l);
      }
    });
    const uniqueLabs = Array.from(uniqueLabsMap.values());

    const targetDept = normalizeDept(options.department);

    const deptSubjects = uniqueSubjects.filter(s => {
      if (!s.active) return false;
      const subDept = normalizeDept(s.department);
      const matchDept = !targetDept || !subDept || subDept === targetDept || subDept.includes(targetDept) || targetDept.includes(subDept);
      const matchYear = !options.year || !s.year || s.year.toUpperCase() === options.year.toUpperCase();
      const matchSem = !options.semester || !s.semester || s.semester === options.semester;
      return matchDept && (matchYear || matchSem);
    });

    const activeSubjectsToSchedule = deptSubjects.length > 0 ? deptSubjects : uniqueSubjects.filter(s => s.active);

    const result = TimetableScheduler.generate({
      department: options.department || 'Computer Science & Engineering',
      year: options.year || 'III',
      semester: options.semester || '5',
      staff: uniqueStaff,
      subjects: activeSubjectsToSchedule,
      labs: uniqueLabs,
      rooms: uniqueRooms,
      timeSlots,
      specialSessions,
      rules,
      seed: options.seed !== undefined ? options.seed : Math.floor(Math.random() * 9000000) + 100000,
      consistentMode: options.consistentMode === true && options.seed !== undefined,
    });

    if (!result.success || !result.timetable) {
      return {
        success: false,
        errors: result.errors || ['Automatic generation failed due to constraint violations.'],
        suggestions: result.suggestions || ['Review resource allocations and availability.'],
      };
    }

    const timetablesRef = collection(db, TIMETABLES_COLLECTION);
    const existingSnap = await getDocs(query(timetablesRef, where('department', '==', result.timetable.department)));
    const versionNumber = existingSnap.size + 1;

    const newTimetableDoc = {
      name: result.timetable.name,
      department: result.timetable.department,
      year: result.timetable.year,
      semester: result.timetable.semester,
      academicYear: getCurrentEngineeringAcademicYear(),
      status: 'DRAFT' as TimetableStatus,
      version: versionNumber,
      createdBy: options.createdBy || 'Administrator',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      qualityScore: result.timetable.qualityScore,
      entries: result.timetable.entries,
      validation: result.timetable.validation,
      stats: result.timetable.stats,
      isGenerated: true,
    };

    const docRef = await addDoc(timetablesRef, newTimetableDoc);

    const createdTimetable: Timetable = {
      id: docRef.id,
      ...newTimetableDoc,
    } as Timetable;

    // Snapshot version
    try {
      await createVersionSnapshot({
        timetable: createdTimetable,
        status: 'DRAFT',
        summary: `Initial automated generation with Quality Score ${result.timetable.qualityScore}%`,
        createdBy: options.createdBy || 'Administrator'
      });
    } catch (vErr) {
      console.warn('Could not record initial version snapshot:', vErr);
    }

    return {
      success: true,
      timetable: createdTimetable,
    };
  } catch (error: any) {
    console.error('Error generating timetable:', error);
    return {
      success: false,
      errors: [error.message || 'An unexpected error occurred during generation.'],
    };
  }
};

const enrichTimetableWithStaff = (timetable: Timetable, staffMap: Map<string, string>): Timetable => {
  if (!timetable || !Array.isArray(timetable.entries)) return timetable;
  const enrichedEntries = timetable.entries.map(entry => {
    if (entry.staffCode) {
      const liveName = staffMap.get(entry.staffCode.toUpperCase());
      if (liveName) {
        return {
          ...entry,
          staffName: liveName,
        };
      }
    }
    return entry;
  });
  return {
    ...timetable,
    entries: enrichedEntries,
  };
};

export const getAllTimetables = async (): Promise<Timetable[]> => {
  try {
    const [timetablesSnap, staffList] = await Promise.all([
      getDocs(collection(db, TIMETABLES_COLLECTION)),
      getAllStaff(),
    ]);

    const staffMap = new Map<string, string>();
    staffList.forEach(s => staffMap.set(s.staffCode.toUpperCase(), s.name));

    return timetablesSnap.docs.map(doc => {
      const data = { id: doc.id, ...doc.data() } as Timetable;
      return enrichTimetableWithStaff(data, staffMap);
    });
  } catch (error) {
    console.error('Error fetching timetables:', error);
    return [];
  }
};

export const getTimetableById = async (id: string): Promise<Timetable | null> => {
  try {
    const docRef = doc(db, TIMETABLES_COLLECTION, id);
    const [docSnap, staffList] = await Promise.all([
      getDoc(docRef),
      getAllStaff(),
    ]);

    if (docSnap.exists()) {
      const staffMap = new Map<string, string>();
      staffList.forEach(s => staffMap.set(s.staffCode.toUpperCase(), s.name));
      const raw = { id: docSnap.id, ...docSnap.data() } as Timetable;
      return enrichTimetableWithStaff(raw, staffMap);
    }
    return null;
  } catch (error) {
    console.error('Error fetching timetable by ID:', error);
    return null;
  }
};

export const getPublishedTimetable = async (department?: string): Promise<Timetable | null> => {
  try {
    const timetablesRef = collection(db, TIMETABLES_COLLECTION);
    const q = query(timetablesRef, where('status', '==', 'PUBLISHED'));
    
    const snapshot = await getDocs(q);
    
    let staffList: StaffProfile[] = [];
    try {
      staffList = await getAllStaff();
    } catch (err) {
      console.warn('Could not fetch all staff for enrichment (expected for non-admins)');
    }
    
    const staffMap = new Map<string, string>();
    staffList.forEach(s => staffMap.set(s.staffCode.toUpperCase(), s.name));

    if (!snapshot.empty) {
      const allPublished = snapshot.docs.map(d => {
        const raw = { id: d.id, ...d.data() } as Timetable;
        return enrichTimetableWithStaff(raw, staffMap);
      });

      if (department) {
        const normTarget = normalizeDept(department);
        const matching = allPublished.find(t => normalizeDept(t.department) === normTarget || t.department.toLowerCase().includes(department.toLowerCase()));
        if (matching) return matching;
      }
      return allPublished[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching published timetable:', error);
    return null;
  }
};

export const saveTimetableDraft = async (timetable: Timetable): Promise<void> => {
  if (!timetable.id) {
    const timetablesRef = collection(db, TIMETABLES_COLLECTION);
    await addDoc(timetablesRef, {
      ...timetable,
      status: timetable.status || 'DRAFT',
      updatedAt: serverTimestamp()
    });
    return;
  }

  const docRef = doc(db, TIMETABLES_COLLECTION, timetable.id);
  await updateDoc(docRef, {
    entries: timetable.entries,
    qualityScore: timetable.qualityScore || 90,
    validation: timetable.validation || null,
    stats: timetable.stats || null,
    updatedAt: serverTimestamp()
  });
};

export const updateTimetableStatus = async (id: string, status: TimetableStatus): Promise<void> => {
  const docRef = doc(db, TIMETABLES_COLLECTION, id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
  
  if (status === 'PUBLISHED') {
    const t = await getTimetableById(id);
    if (t) await syncStaffPublishedTimetables(t);
  } else {
    await archiveStaffPublishedTimetables();
  }
};

export const publishTimetable = async (id: string, isPublished: boolean = true): Promise<void> => {
  const status: TimetableStatus = isPublished ? 'PUBLISHED' : 'DRAFT';
  const docRef = doc(db, TIMETABLES_COLLECTION, id);
  await updateDoc(docRef, {
    status,
    ...(isPublished ? { publishedAt: serverTimestamp() } : {}),
    updatedAt: serverTimestamp(),
  });
  if (isPublished) {
    const t = await getTimetableById(id);
    if (t) await syncStaffPublishedTimetables(t);
  } else {
    await archiveStaffPublishedTimetables();
  }
};

/**
 * Synchronizes personal published timetable slices for each staff member into
 * /staff/{staffId}/timetable/published
 * This ensures that Firestore security rules enforce that each staff member
 * can only read their own timetable, and only when published.
 */
export const syncStaffPublishedTimetables = async (timetable: Timetable): Promise<void> => {
  try {
    const staffList = await getAllStaff();
    for (const staff of staffList) {
      if (!staff.id || !staff.staffCode) continue;
      const staffCodeUpper = staff.staffCode.trim().toUpperCase();
      
      // Filter entries strictly for this staff member (plus institutional locked sessions like Naan Mudhalvan)
      const staffEntries = timetable.entries.filter(
        e => (e.staffCode && e.staffCode.trim().toUpperCase() === staffCodeUpper) || e.type === 'SPECIAL'
      );

      const staffTimetableDocRef = doc(db, 'staff', staff.id, 'timetable', 'published');
      await setDoc(staffTimetableDocRef, {
        timetableId: timetable.id,
        name: timetable.name,
        department: timetable.department,
        year: timetable.year,
        semester: timetable.semester,
        academicYear: resolveTimetableAcademicYear(timetable.academicYear),
        status: 'PUBLISHED',
        publishedAt: serverTimestamp(),
        staffCode: staff.staffCode,
        staffName: staff.name,
        entries: staffEntries,
        stats: {
          totalClasses: staffEntries.length,
          theoryHours: staffEntries.filter(e => e.type === 'THEORY').length,
          labHours: staffEntries.filter(e => e.type === 'LAB').length,
          specialHours: staffEntries.filter(e => e.type === 'SPECIAL').length,
        },
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error synchronizing staff published timetables:', error);
  }
};

/**
 * Archives all staff published timetables so staff users immediately see the
 * unpublished state when the admin withdraws or archives a timetable.
 */
export const archiveStaffPublishedTimetables = async (): Promise<void> => {
  try {
    const staffList = await getAllStaff();
    for (const staff of staffList) {
      if (!staff.id) continue;
      try {
        const staffTimetableDocRef = doc(db, 'staff', staff.id, 'timetable', 'published');
        await deleteDoc(staffTimetableDocRef);
      } catch (err) {
        // Ignore single doc failure
      }
    }
  } catch (error) {
    console.error('Error archiving staff published timetables:', error);
  }
};

/**
 * Retrieves the published timetable for a specific staff member from their private
 * subcollection `/staff/{staffId}/timetable/published`.
 * Returns null if no published timetable exists or if it has not been published yet.
 */
export const getMyStaffTimetable = async (staffId: string): Promise<Timetable | null> => {
  if (!staffId) return null;
  try {
    const docRef = doc(db, 'staff', staffId, 'timetable', 'published');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Timetable;
      if (data.status === 'PUBLISHED') {
        return {
          id: docSnap.id,
          ...data,
        };
      }
    }
    return null;
  } catch (err) {
    console.error('Error fetching staff timetable from Firestore:', err);
    return null;
  }
};

export const subscribeToMyStaffTimetable = (
  staffId: string,
  onUpdate: (timetable: Timetable | null) => void
): (() => void) => {
  if (!staffId) {
    onUpdate(null);
    return () => {};
  }
  
  const docRef = doc(db, 'staff', staffId, 'timetable', 'published');
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Timetable;
        if (data.status === 'PUBLISHED') {
          onUpdate({
            id: docSnap.id,
            ...data,
          });
          return;
        }
      }
      onUpdate(null);
    },
    (err) => {
      console.error('Error subscribing to staff timetable:', err);
      onUpdate(null);
    }
  );
};

export const publishTimetableSafely = async (
  timetable: Timetable,
  publisherName: string = 'Administrator'
): Promise<{ success: boolean; message: string; validation?: ValidationResult }> => {
  if (!timetable.id) return { success: false, message: 'Invalid timetable ID.' };

  // 1. Run live validation
  const validation = await validateExistingTimetable(timetable.id);
  if (!validation || !validation.valid || (validation.conflicts && validation.conflicts.length > 0)) {
    return {
      success: false,
      message: `Cannot publish timetable with active conflicts (${validation?.conflicts?.length || 0} issues). Please resolve before publishing.`,
      validation: validation || undefined
    };
  }

  // 2. Archive any previously published timetable in same department
  const timetablesRef = collection(db, TIMETABLES_COLLECTION);
  const q = query(
    timetablesRef, 
    where('department', '==', timetable.department), 
    where('status', '==', 'PUBLISHED')
  );
  const prevPublishedSnap = await getDocs(q);
  for (const prevDoc of prevPublishedSnap.docs) {
    if (prevDoc.id !== timetable.id) {
      await updateDoc(doc(db, TIMETABLES_COLLECTION, prevDoc.id), {
        status: 'ARCHIVED',
        updatedAt: serverTimestamp()
      });
    }
  }

  // 3. Mark current as PUBLISHED
  const docRef = doc(db, TIMETABLES_COLLECTION, timetable.id);
  await updateDoc(docRef, {
    status: 'PUBLISHED',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 3.5. Synchronize each staff member's isolated published timetable
  await syncStaffPublishedTimetables({ ...timetable, status: 'PUBLISHED' });

  // 4. Create Version Snapshot
  await createVersionSnapshot({
    timetable: { ...timetable, status: 'PUBLISHED' },
    status: 'PUBLISHED',
    summary: `Official publication by ${publisherName} with 0 conflicts & Quality Score ${timetable.qualityScore || 95}%`,
    createdBy: publisherName
  });

  return {
    success: true,
    message: `Timetable for ${timetable.department} has been officially published. It is now live for all faculty and staff members.`
  };
};

export const deleteTimetable = async (id: string): Promise<void> => {
  const t = await getTimetableById(id);
  const docRef = doc(db, TIMETABLES_COLLECTION, id);
  await deleteDoc(docRef);
  if (t?.status === 'PUBLISHED') {
    await archiveStaffPublishedTimetables();
  }
};

export const deleteMultipleTimetables = async (ids: string[]): Promise<void> => {
  let hasPublished = false;
  for (const id of ids) {
    const t = await getTimetableById(id);
    if (t?.status === 'PUBLISHED') {
      hasPublished = true;
    }
    await deleteDoc(doc(db, TIMETABLES_COLLECTION, id));
  }
  if (hasPublished) {
    await archiveStaffPublishedTimetables();
  }
};

export const validateExistingTimetable = async (id: string): Promise<ValidationResult | null> => {
  const timetable = await getTimetableById(id);
  if (!timetable) return null;

  const [subjects, timeSlots] = await Promise.all([
    getAllSubjects(),
    getAllTimeSlots(),
  ]);

  const periodSlots = timeSlots.map(s => ({
    id: s.id || `${s.day}_${s.order}`,
    day: s.day,
    slotIndex: s.order,
    startTime: s.startTime,
    endTime: s.endTime,
    type: s.type as any,
    isMorning: s.order < 5,
    isAfternoon: s.order >= 5,
  }));

  const validation = TimetableValidator.validate(timetable.entries, subjects, periodSlots);
  const quality = ScheduleOptimizer.calculateQuality(timetable.entries, subjects, periodSlots);
  validation.qualityScore = quality.score;
  validation.qualityMetrics = quality.metrics;

  return validation;
};

// API Call Wrappers
export const moveClassApi = async (params: {
  timetable: Timetable;
  entryId: string;
  targetDay: string;
  targetSlotIndex: number;
  subjects: Subject[];
  rooms: Room[];
}) => {
  const res = await fetch('/api/timetable/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
};

export const regenerateSubjectApi = async (params: {
  timetable: Timetable;
  subjectCode: string;
  subjects: Subject[];
  rooms: Room[];
}) => {
  const res = await fetch('/api/timetable/regenerate-subject', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
};

export const autoFixConflictsApi = async (params: {
  timetable: Timetable;
  subjects: Subject[];
  rooms: Room[];
}) => {
  const res = await fetch('/api/timetable/auto-fix', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return await res.json();
};

export const createExtractedTimetable = async (
  extracted: ExtractedTimetableImageResult,
  createdBy: string = 'Gemini AI Vision'
): Promise<Timetable> => {
  const [subjects, rooms] = await Promise.all([
    getAllSubjects(),
    getAllRooms(),
  ]);

  const entries: TimetableEntry[] = extracted.gridEntries.map((grid, idx) => {
    const matchedSubject = subjects.find(s => s.subjectCode === grid.subjectCode);
    const assignedStaff = matchedSubject?.assignedStaff?.[0] || '';
    return {
      id: `entry_img_${Date.now()}_${idx}`,
      day: grid.day,
      slotIndex: grid.slotIndex,
      startTime: grid.startTime,
      endTime: grid.endTime,
      subjectCode: grid.subjectCode,
      subjectName: grid.subjectName,
      staffCode: grid.staffCode || assignedStaff || '',
      staffName: grid.staffName || 'Faculty',
      roomNumber: grid.roomNumber || '304',
      type: grid.type === 'LAB' ? 'LAB' : grid.type === 'SPECIAL' ? 'SPECIAL' : 'THEORY',
      source: 'AI_SUGGESTED',
    };
  });

  const theoryHours = entries.filter((e) => e.type === 'THEORY').length;
  const labHours = entries.filter((e) => e.type === 'LAB').length;
  const specialHours = entries.filter((e) => e.type === 'SPECIAL').length;

  const stats: TimetableStats = {
    totalClasses: entries.length,
    theoryHours,
    labHours,
    specialHours,
  };

  const periodSlots = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].flatMap((day) =>
    defaultMasterTimeSlots.map((s) => ({
      id: `${day}_${s.order}`,
      day,
      slotIndex: s.order,
      order: s.order,
      startTime: s.startTime,
      endTime: s.endTime,
      type: s.type as any,
      isMorning: s.order < 5,
      isAfternoon: s.order >= 5,
    }))
  );

  const validation = TimetableValidator.validate(entries, subjects, periodSlots);
  const quality = ScheduleOptimizer.calculateQuality(entries, subjects, periodSlots);
  validation.qualityScore = quality.score || extracted.confidenceScore || 90;
  validation.qualityMetrics = quality.metrics;

  const timetablesRef = collection(db, TIMETABLES_COLLECTION);
  const existingSnap = await getDocs(
    query(timetablesRef, where('department', '==', extracted.department))
  );
  const versionNumber = existingSnap.size + 1;

  const newDoc = {
    name: extracted.timetableName || `${extracted.department} Sem ${extracted.semester} (Image Extracted)`,
    department: extracted.department,
    year: extracted.year,
    semester: extracted.semester,
    academicYear: resolveTimetableAcademicYear(extracted.academicYear),
    status: 'DRAFT' as TimetableStatus,
    version: versionNumber,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    qualityScore: validation.qualityScore,
    entries,
    validation,
    stats,
    isGenerated: true,
  };

  const docRef = await addDoc(timetablesRef, newDoc);

  const created: Timetable = {
    id: docRef.id,
    ...newDoc,
  } as Timetable;

  try {
    await createVersionSnapshot({
      timetable: created,
      status: 'DRAFT',
      summary: `Imported from timetable image via Gemini Vision. Confidence: ${extracted.confidenceScore || 90}%`,
      createdBy,
    });
  } catch (vErr) {
    console.warn('Could not record initial version snapshot:', vErr);
  }

  return created;
};

export const getLatestTimetable = async (): Promise<Timetable | null> => {
  try {
    const list = await getAllTimetables();
    return list.length > 0 ? list[0] : null;
  } catch (error) {
    console.error('Error fetching latest timetable:', error);
    return null;
  }
};


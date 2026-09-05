import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { Timetable, TimetableVersion, TimetableStatus } from '@/types/timetable';

const VERSIONS_COLLECTION = 'timetableVersions';

export async function createVersionSnapshot(params: {
  timetable: Timetable;
  status: TimetableStatus;
  summary: string;
  createdBy: string;
}): Promise<string> {
  const { timetable, status, summary, createdBy } = params;

  try {
    const versionsRef = collection(db, VERSIONS_COLLECTION);
    const scheduledHours = timetable.entries.filter(e => e.type === 'THEORY' || e.type === 'LAB').length;

    const docRef = await addDoc(versionsRef, {
      timetableId: timetable.id || 'current',
      version: timetable.version || 1,
      name: timetable.name,
      department: timetable.department,
      year: timetable.year,
      semester: timetable.semester,
      status,
      qualityScore: timetable.qualityScore || 90,
      conflictCount: timetable.validation?.conflicts?.length || 0,
      scheduledHours,
      createdBy,
      createdAt: serverTimestamp(),
      publishedAt: status === 'PUBLISHED' ? serverTimestamp() : null,
      summary,
      entriesSnapshot: timetable.entries || [],
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating version snapshot:', error);
    throw error;
  }
}

export async function getTimetableVersions(timetableId?: string): Promise<TimetableVersion[]> {
  try {
    const versionsRef = collection(db, VERSIONS_COLLECTION);
    let q = query(versionsRef, orderBy('createdAt', 'desc'));
    
    if (timetableId) {
      q = query(versionsRef, where('timetableId', '==', timetableId), orderBy('createdAt', 'desc'));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TimetableVersion));
  } catch (error: any) {
    if (error.code !== 'failed-precondition') {
      console.error('Error fetching timetable versions:', error);
    }
    // Fallback without composite index if order error
    try {
      const snapshot = await getDocs(collection(db, VERSIONS_COLLECTION));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TimetableVersion)).sort((a, b) => (b.version || 0) - (a.version || 0));
    } catch (e2) {
      return [];
    }
  }
}

export async function restoreVersionAsDraft(version: TimetableVersion, restoredBy: string = 'Administrator'): Promise<Timetable> {
  const timetablesRef = collection(db, 'timetables');
  
  // Calculate next version number
  const existingSnap = await getDocs(query(timetablesRef, where('department', '==', version.department)));
  const nextVersionNum = existingSnap.size + 1;

  const newDraftDoc = {
    name: `${version.name} (Restored from v${version.version})`,
    department: version.department,
    year: version.year,
    semester: version.semester,
    status: 'DRAFT' as const,
    version: nextVersionNum,
    createdBy: restoredBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    qualityScore: version.qualityScore,
    entries: version.entriesSnapshot || [],
    stats: {
      totalClasses: version.scheduledHours,
      theoryHours: version.entriesSnapshot.filter(e => e.type === 'THEORY').length,
      labHours: version.entriesSnapshot.filter(e => e.type === 'LAB').length,
      specialHours: version.entriesSnapshot.filter(e => e.type === 'SPECIAL' || e.type === 'LOCKED').length,
    }
  };

  const docRef = await addDoc(timetablesRef, newDraftDoc);

  // Snapshot restoration event
  await createVersionSnapshot({
    timetable: {
      id: docRef.id,
      ...newDraftDoc,
    } as Timetable,
    status: 'DRAFT',
    summary: `Restored state from historical Version ${version.version}`,
    createdBy: restoredBy
  });

  return {
    id: docRef.id,
    ...newDraftDoc
  } as Timetable;
}

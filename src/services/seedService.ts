import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { defaultRules } from './rulesService';
import { 
  MASTER_STAFF, 
  MASTER_THEORY_SUBJECTS, 
  MASTER_LABS, 
  MASTER_ROOMS, 
  NAAN_MUTHALVAN_CONFIG 
} from '@/config/timetableConfig';

export const seedInitialDataset = async (force: boolean = false): Promise<{ message: string; seeded: boolean }> => {
  try {
    // Check existing data
    const [existingStaff, existingSubjects, existingLabs, existingRooms] = await Promise.all([
      getDocs(collection(db, 'staff')),
      getDocs(collection(db, 'subjects')),
      getDocs(collection(db, 'labs')),
      getDocs(collection(db, 'rooms')),
    ]);

    if (!force && !existingStaff.empty && !existingSubjects.empty) {
      return { message: 'Database already initialized. Click "Reset Section 48 Dataset" to refresh.', seeded: false };
    }

    // Clean up duplicate or old documents to ensure no overlapping duplicates
    const deleteBatch = writeBatch(db);
    let deleteCount = 0;
    
    existingStaff.docs.forEach(d => {
      deleteBatch.delete(d.ref);
      deleteCount++;
    });
    existingSubjects.docs.forEach(d => {
      deleteBatch.delete(d.ref);
      deleteCount++;
    });
    existingLabs.docs.forEach(d => {
      deleteBatch.delete(d.ref);
      deleteCount++;
    });
    existingRooms.docs.forEach(d => {
      deleteBatch.delete(d.ref);
      deleteCount++;
    });

    if (deleteCount > 0) {
      await deleteBatch.commit();
    }

    const batch = writeBatch(db);

    // 1. Seed 7 Distinct Staff Members from Centralized Configuration
    MASTER_STAFF.forEach(s => {
      const docRef = doc(db, 'staff', `staff_${s.staffCode}`);
      batch.set(docRef, {
        staffCode: s.staffCode,
        name: s.name,
        email: s.email,
        department: s.department,
        designation: s.designation,
        active: true,
        userId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // 2. Seed 7 Theory Subjects + 4 Laboratory Subjects
    MASTER_THEORY_SUBJECTS.forEach(sub => {
      const docRef = doc(db, 'subjects', `sub_${sub.subjectCode}`);
      batch.set(docRef, {
        subjectCode: sub.subjectCode,
        subjectName: sub.subjectName,
        type: sub.type,
        weeklyHours: sub.weeklyHours,
        assignedStaff: [sub.assignedStaffCode],
        department: sub.department,
        year: sub.year,
        semester: sub.semester,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    MASTER_LABS.forEach(lab => {
      const docRef = doc(db, 'subjects', `sub_${lab.subjectCode}`);
      batch.set(docRef, {
        subjectCode: lab.subjectCode,
        subjectName: lab.labName,
        type: 'LAB',
        weeklyHours: lab.duration,
        assignedStaff: [lab.staffCode],
        department: 'Computer Science & Engineering',
        year: 'III',
        semester: '5',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // 3. Seed 4 Labs catalog
    MASTER_LABS.forEach(l => {
      const docRef = doc(db, 'labs', `lab_${l.labCode}`);
      batch.set(docRef, {
        labCode: l.labCode,
        labName: l.labName,
        capacity: l.capacity,
        duration: l.duration,
        preferredPeriod: 'Period 6 + 7',
        department: 'Computer Science & Engineering',
        active: true,
      });
    });

    // 4. Seed Rooms
    MASTER_ROOMS.forEach(r => {
      const docRef = doc(db, 'rooms', `room_${r.roomNumber}`);
      batch.set(docRef, r);
    });

    // 5. Seed Special Session (Naan Muthalvan Locked on Wednesday Afternoon)
    const nmRef = doc(db, 'specialSessions', 'naan_muthalvan_wed');
    batch.set(nmRef, {
      name: NAAN_MUTHALVAN_CONFIG.name,
      day: NAAN_MUTHALVAN_CONFIG.day,
      period: 'AFTERNOON',
      type: 'SPECIAL',
      locked: true,
      description: NAAN_MUTHALVAN_CONFIG.description,
    });

    // 6. Seed Scheduling Rules
    const rulesRef = doc(db, 'schedulingRules', 'default');
    batch.set(rulesRef, {
      ...defaultRules,
      updatedAt: serverTimestamp(),
    });

    // 7. Seed Initial Administrator User Account
    const adminRef = doc(db, 'users', 'admin_nce_bootstrap');
    batch.set(adminRef, {
      uid: 'admin_nce_bootstrap',
      name: 'System Administrator',
      email: 'admin@nce.edu',
      role: 'admin',
      staffCode: 'ADMIN',
      staffId: null,
      active: true,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    }, { merge: true });

    await batch.commit();

    return { message: 'NCE Timecraft clean dataset initialized successfully!', seeded: true };
  } catch (error) {
    console.error('Error seeding dataset:', error);
    throw error;
  }
};

import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { db } from '@/firebase/firestore';
import { SpecialSession } from '@/types/timetable';

const SESSIONS_COLLECTION = 'specialSessions';

export const defaultNaanMudhalvanSession: SpecialSession = {
  name: 'Naan Mudhalvan',
  day: 'Wednesday',
  period: 'AFTERNOON',
  type: 'SPECIAL',
  locked: true,
  description: 'Mandatory Tamil Nadu State Skill Initiative - Wednesday Afternoon Locked Session',
};

export const getAllSpecialSessions = async (): Promise<SpecialSession[]> => {
  try {
    const sessionsRef = collection(db, SESSIONS_COLLECTION);
    const querySnapshot = await getDocs(sessionsRef);
    const sessions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SpecialSession));

    if (sessions.length === 0) {
      return [{ id: 'naan_mudhalvan_default', ...defaultNaanMudhalvanSession }];
    }

    return sessions;
  } catch (error) {
    console.error('Error fetching special sessions:', error);
    return [{ id: 'naan_mudhalvan_default', ...defaultNaanMudhalvanSession }];
  }
};

export const createSpecialSession = async (data: Omit<SpecialSession, 'id'>): Promise<string> => {
  const sessionsRef = collection(db, SESSIONS_COLLECTION);
  const docRef = await addDoc(sessionsRef, {
    ...data,
    type: 'SPECIAL',
    locked: data.locked !== undefined ? data.locked : true,
  });
  return docRef.id;
};

export const updateSpecialSession = async (id: string, data: Partial<SpecialSession>): Promise<void> => {
  const docRef = doc(db, SESSIONS_COLLECTION, id);
  await updateDoc(docRef, data);
};

export const deleteSpecialSession = async (id: string): Promise<void> => {
  const docRef = doc(db, SESSIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

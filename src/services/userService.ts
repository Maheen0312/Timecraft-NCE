import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'unauthorized' | 'unrecognized';
  staffCode: string | null;
  staffId?: string | null;
  active: boolean;
  createdAt: any;
  lastLogin: any;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const updateLastLogin = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    lastLogin: serverTimestamp()
  });
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data()
  } as UserProfile));
};

export const deleteUser = async (uid: string): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await deleteDoc(docRef);
};

export const deleteMultipleUsers = async (uids: string[]): Promise<void> => {
  await Promise.all(uids.map(uid => deleteDoc(doc(db, 'users', uid))));
};

export const updateUserRole = async (uid: string, role: 'admin' | 'staff'): Promise<void> => {
  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp()
  });
};


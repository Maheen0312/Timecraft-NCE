import { getFirestore } from 'firebase/firestore';
import { app } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';

const dbId = (firebaseConfig as any).firestoreDatabaseId;
export const db = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);



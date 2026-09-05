import { initializeApp, getApps, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase using the provisioned config
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);


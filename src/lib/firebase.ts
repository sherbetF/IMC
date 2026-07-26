import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Determine the correct database ID (prefer custom database ID from config or env over default)
const envDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
const configDbId = firebaseConfigJson.firestoreDatabaseId;

const databaseId = (envDbId && envDbId !== '(default)') 
  ? envDbId 
  : (configDbId || undefined);

// Initialize Firestore with custom database ID if specified
export const db = (databaseId && databaseId !== '(default)')
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Initialize Firebase Storage with explicit bucket URL
const bucketName = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket || 'outsource-f1e0f.firebasestorage.app').trim();
const bucketUrl = bucketName.startsWith('gs://') ? bucketName : `gs://${bucketName}`;

export const storage = getStorage(app, bucketUrl);

export default app;

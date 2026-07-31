import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Bulletproof fallback values from current configuration to ensure it works on GitHub
const FALLBACK_CONFIG = {
  apiKey: "AIzaSyBo6yD2gE8M7HASjDlvrDrMPpLRRd31wyE",
  authDomain: "outsource-f1e0f.firebaseapp.com",
  projectId: "outsource-f1e0f",
  storageBucket: "outsource-f1e0f.firebasestorage.app",
  messagingSenderId: "428092829658",
  appId: "1:428092829658:web:1110780e827afb11dd9ae3",
  firestoreDatabaseId: "ai-studio-outsourcedatabas-932d6106-b948-4503-a6fd-7143b5e143ff"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfigJson?.apiKey || FALLBACK_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson?.authDomain || FALLBACK_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfigJson?.projectId || FALLBACK_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson?.storageBucket || FALLBACK_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson?.messagingSenderId || FALLBACK_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfigJson?.appId || FALLBACK_CONFIG.appId,
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Determine the correct database ID (prefer custom database ID from config, env or fallback)
const envDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
const configDbId = firebaseConfigJson?.firestoreDatabaseId;

const databaseId = (envDbId && envDbId !== '(default)') 
  ? envDbId 
  : (configDbId || FALLBACK_CONFIG.firestoreDatabaseId || undefined);

// Initialize Firestore with custom database ID if specified and enable long polling to bypass proxy/iframe connection limits
export const db = (databaseId && databaseId !== '(default)')
  ? initializeFirestore(app, { experimentalForceLongPolling: true }, databaseId)
  : initializeFirestore(app, { experimentalForceLongPolling: true });

// Initialize Firebase Storage
const bucketName = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson?.storageBucket || FALLBACK_CONFIG.storageBucket).trim();
const bucketUrl = bucketName.startsWith('gs://') ? bucketName : `gs://${bucketName}`;

export const storage = getStorage(app, bucketUrl);

export default app;

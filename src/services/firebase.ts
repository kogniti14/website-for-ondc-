import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env as any)[key] || '';
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
  } catch {}
  return '';
};

const envApiKey = getEnvVar('VITE_FIREBASE_API_KEY');
const envAuthDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN');
const envProjectId = getEnvVar('VITE_FIREBASE_PROJECT_ID');
const envStorageBucket = getEnvVar('VITE_FIREBASE_STORAGE_BUCKET');
const envMessagingSenderId = getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID');
const envAppId = getEnvVar('VITE_FIREBASE_APP_ID');

/**
 * Checks if actual live Firebase configuration has been provided
 * (i.e. not default dummy placeholder keys)
 */
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    envApiKey &&
    envProjectId &&
    !envApiKey.includes('ExampleKey') &&
    envApiKey.length > 15
  );
};

// Safe Firebase config with fallback
const firebaseConfig = {
  apiKey: envApiKey || 'AIzaSyExampleKey1234567890abcdef',
  authDomain: envAuthDomain || 'kogniti-minds.firebaseapp.com',
  projectId: envProjectId || 'kogniti-minds',
  storageBucket: envStorageBucket || 'kogniti-minds.appspot.com',
  messagingSenderId: envMessagingSenderId || '123456789012',
  appId: envAppId || '1:123456789012:web:abcdef1234567890',
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  try {
    db = getFirestore(app);
  } catch (dbErr) {
    console.warn('Firestore initialization notice:', dbErr);
  }
  try {
    storage = getStorage(app);
  } catch (storageErr) {
    console.warn('Firebase Storage initialization notice:', storageErr);
  }
} catch (error) {
  console.warn('Firebase initialization notice: Running in integrated fallback mode.', error);
  // Re-attempt with minimum safe app
  app = getApps().length ? getApp() : initializeApp(firebaseConfig, 'kogniti-minds-app');
  auth = getAuth(app);
  try {
    db = getFirestore(app);
  } catch {}
  try {
    storage = getStorage(app);
  } catch {}
}

export { app, auth, db, storage, googleProvider };

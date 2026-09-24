import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

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
const envMeasurementId = getEnvVar('VITE_FIREBASE_MEASUREMENT_ID');
const envDatabaseUrl = getEnvVar('VITE_FIREBASE_DATABASE_URL');

// Production Firebase Configuration for Kogniti Minds Private Limited
export const firebaseConfig = {
  apiKey: envApiKey || 'AIzaSyAOVn0vnb7ZMmyW7D5XOqBEDskPMNnuY5I',
  authDomain: envAuthDomain || 'kognitiminds-ondc.firebaseapp.com',
  projectId: envProjectId || 'kognitiminds-ondc',
  storageBucket: envStorageBucket || 'kognitiminds-ondc.firebasestorage.app',
  messagingSenderId: envMessagingSenderId || '585231773951',
  appId: envAppId || '1:585231773951:web:1a71e21a858b5db71adcca',
  measurementId: envMeasurementId || 'G-LHW5GZQCCS',
  databaseURL: envDatabaseUrl || 'https://kognitiminds-ondc-default-rtdb.firebaseio.com',
};

/**
 * Checks if actual live Firebase configuration has been provided
 */
export const isFirebaseConfigured = (): boolean => {
  const activeKey = firebaseConfig.apiKey;
  const activeProjectId = firebaseConfig.projectId;
  return Boolean(
    activeKey &&
    activeProjectId &&
    !activeKey.includes('ExampleKey') &&
    activeKey.length > 15
  );
};

let app: FirebaseApp;
let auth: Auth;
let db: Database;
let storage: FirebaseStorage;
let analytics: Analytics | undefined;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getDatabase(app);
  storage = getStorage(app);

  if (typeof window !== 'undefined') {
    isSupported()
      .then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
        }
      })
      .catch((err) => {
        // Analytics failure must never break the application
      });
  }
} catch (error) {
  console.warn('Firebase initialization notice: Running in integrated fallback mode.', error);
  app = getApps().length ? getApp() : initializeApp(firebaseConfig, 'kogniti-minds-app');
  auth = getAuth(app);
  try {
    db = getDatabase(app);
  } catch {}
  try {
    storage = getStorage(app);
  } catch {}
}

export { app, auth, db, storage, googleProvider, analytics };
export default app;

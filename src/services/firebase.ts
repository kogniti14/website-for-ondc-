import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from 'firebase/auth';

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
const envAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '';
const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || '';
const envStorageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '';
const envMessagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID || '';

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
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase initialization notice: Running in integrated fallback mode.', error);
  // Re-attempt with minimum safe app
  app = getApps().length ? getApp() : initializeApp(firebaseConfig, 'kogniti-minds-app');
  auth = getAuth(app);
}

export { app, auth, googleProvider };

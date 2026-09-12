import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from './firebase';

export interface FirebaseAuthResult {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  isLive: boolean;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
  isLive: boolean;
}

const mapFirebaseError = (error: any): string => {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No registered account found with this email address. Please register first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials or sign in via Email OTP.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completion.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in window is already active.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is not enabled in the Firebase Console. Please enable Email/Password or Google in Firebase Console.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Please try again later or reset your password.';
    case 'auth/network-request-failed':
      return 'Network error communicating with Firebase. Please check your internet connection.';
    default:
      return error?.message || 'Authentication encountered an error. Please try again.';
  }
};

export const firebaseAuthService = {
  isLiveConfig: isFirebaseConfigured,

  /**
   * Listen to Firebase auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get currently logged-in Firebase user
   */
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  /**
   * Sign in with Email and Password
   * Strict Production Standard: Authenticates directly against Firebase Cloud Auth
   */
  async loginWithEmail(email: string, password: string): Promise<FirebaseAuthResult> {
    const isLive = isFirebaseConfigured();
    if (!isLive) {
      return {
        success: false,
        error: 'Firebase Authentication is not configured. Please supply your live VITE_FIREBASE_API_KEY and credentials in .env.',
        isLive: false,
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      return {
        success: true,
        user: userCredential.user,
        isLive: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: mapFirebaseError(err),
        isLive: true,
      };
    }
  },

  /**
   * Register a new user with Email and Password
   */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string
  ): Promise<FirebaseAuthResult> {
    const isLive = isFirebaseConfigured();
    if (!isLive) {
      return {
        success: false,
        error: 'Firebase Authentication is not configured. Please supply your live VITE_FIREBASE_API_KEY and credentials in .env.',
        isLive: false,
      };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && userCredential.user) {
        try {
          await updateProfile(userCredential.user, { displayName });
        } catch {
          // Non-blocking profile name update
        }
      }
      return {
        success: true,
        user: userCredential.user,
        isLive: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: mapFirebaseError(err),
        isLive: true,
      };
    }
  },

  /**
   * Sign in or Register using Google Popup
   */
  async signInWithGoogle(): Promise<FirebaseAuthResult> {
    const isLive = isFirebaseConfigured();
    if (!isLive) {
      return {
        success: false,
        error: 'Firebase Authentication is not configured. Please supply your live VITE_FIREBASE_API_KEY in .env.',
        isLive: false,
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return {
        success: true,
        user: result.user,
        isLive: true,
      };
    } catch (err: any) {
      return {
        success: false,
        error: mapFirebaseError(err),
        isLive: true,
      };
    }
  },

  /**
   * Send Password Reset Email via Firebase
   */
  async sendPasswordReset(email: string): Promise<PasswordResetResult> {
    const isLive = isFirebaseConfigured();
    if (!isLive) {
      return {
        success: false,
        message: 'Firebase Authentication is not configured. Please supply your live VITE_FIREBASE_API_KEY in .env.',
        isLive: false,
      };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return {
        success: true,
        message: `Password reset link sent to ${email}! Please check your inbox and follow instructions.`,
        isLive: true,
      };
    } catch (err: any) {
      return {
        success: false,
        message: mapFirebaseError(err),
        isLive: true,
      };
    }
  },

  /**
   * Send Email Verification Link via Firebase
   */
  async sendVerification(user: FirebaseUser): Promise<{ success: boolean; error?: string }> {
    try {
      await sendEmailVerification(user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: mapFirebaseError(err) };
    }
  },

  /**
   * Sign Out from Firebase
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign-out notice:', err);
    }
  },
};

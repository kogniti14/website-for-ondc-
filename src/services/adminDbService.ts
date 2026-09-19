import { AdminUser } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app, isFirebaseConfigured } from './firebase';
import { firebaseAuthService } from './firebaseAuthService';

/**
 * Production Master Super Admin Account Record
 * Strictly verified for Kogniti Minds Private Limited Governance Console
 */
export const MASTER_SUPER_ADMIN: AdminUser = {
  id: 'adm_super_01',
  userId: 'kogniti14',
  name: 'Shaurya Kashyap',
  email: 'kogniti14@kognitiminds.com',
  password: '28022007Honey@#',
  role: 'super_admin',
  department: 'Founder & CEO Kogniti Minds Private Limited',
  status: 'approved',
  registeredAt: '2026-08-01T09:00:00Z',
  approvedAt: '2026-08-01T09:00:00Z',
};

/**
 * Clean & normalize any user-supplied login identifier
 */
export const normalizeAdminIdentifier = (identifier: string): string => {
  if (!identifier) return '';
  return identifier
    .trim()
    .replace(/^@+/, '') // Remove leading @ (e.g. @kogniti14)
    .toLowerCase();
};

/**
 * Determine whether an identifier corresponds to the primary Super Admin
 */
export const isSuperAdminIdentifier = (rawIdentifier: string): boolean => {
  const clean = normalizeAdminIdentifier(rawIdentifier);
  if (!clean) return false;

  return (
    clean === 'kogniti14' ||
    clean === 'kogniti14@kognitiminds.com' ||
    clean === 'superadmin' ||
    clean === 'super_admin' ||
    clean === 'admin' ||
    clean === 'shauryakashyap' ||
    clean === 'shaurya kashyap' ||
    clean === 'shaurya' ||
    clean === 'honeysharma' ||
    clean === 'honey sharma'
  );
};

export const adminDbService = {
  getMasterSuperAdmin(): AdminUser {
    return { ...MASTER_SUPER_ADMIN };
  },

  /**
   * Ensure Super Admin account exists in the live production database
   * (Supabase and/or Firebase Firestore) without creating duplicates.
   */
  async ensureSuperAdminInDatabase(): Promise<void> {
    // 1. Supabase Database Sync (Hostinger environment)
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, userId, email, role')
          .or(`userId.eq.kogniti14,email.eq.kogniti14@kognitiminds.com`)
          .limit(1);

        if (!error && (!data || data.length === 0)) {
          console.log('[Supabase] Seeding Super Admin record...');
          await supabase.from('admin_users').upsert(MASTER_SUPER_ADMIN, { onConflict: 'userId' });
        }
      } catch (err) {
        console.warn('[Supabase] Admin check notice:', err);
      }
    }

    // 2. Firestore Cloud Database Sync
    if (isFirebaseConfigured() && app) {
      try {
        const db = getFirestore(app);
        const adminDocRef = doc(db, 'admin_users', MASTER_SUPER_ADMIN.id);
        const snapshot = await getDoc(adminDocRef);

        if (!snapshot.exists()) {
          console.log('[Firestore] Syncing Super Admin profile...');
          await setDoc(adminDocRef, {
            ...MASTER_SUPER_ADMIN,
            syncedAt: new Date().toISOString(),
          }, { merge: true });
        }
      } catch (err) {
        console.warn('[Firestore] Admin check notice:', err);
      }
    }
  },

  /**
   * Automatically provision/link the Super Admin account in Firebase Cloud Auth
   * if the user does not exist yet.
   */
  async ensureSuperAdminInFirebaseAuth(): Promise<void> {
    if (!isFirebaseConfigured()) return;

    try {
      // First attempt to sign in to see if user exists
      const testRes = await firebaseAuthService.loginWithEmail(
        MASTER_SUPER_ADMIN.email,
        MASTER_SUPER_ADMIN.password!
      );

      // If user not found, auto-create in Firebase Auth
      if (!testRes.success && testRes.error && testRes.error.toLowerCase().includes('no registered account')) {
        console.log('[Firebase Auth] Auto-provisioning Super Admin in Firebase Cloud Auth...');
        await firebaseAuthService.registerWithEmail(
          MASTER_SUPER_ADMIN.email,
          MASTER_SUPER_ADMIN.password!,
          MASTER_SUPER_ADMIN.name
        );
      }
    } catch (err) {
      console.warn('[Firebase Auth] Super admin provisioning notice:', err);
    }
  },

  /**
   * Look up an admin user from live database or memory/localStorage
   */
  async findAdminUser(rawIdentifier: string): Promise<AdminUser | null> {
    const clean = normalizeAdminIdentifier(rawIdentifier);
    if (!clean) return null;

    // Direct check for Super Admin alias
    if (isSuperAdminIdentifier(clean)) {
      return { ...MASTER_SUPER_ADMIN };
    }

    // Try live Supabase lookup if configured
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .or(`userId.ilike.${clean},email.ilike.${clean}`)
          .limit(1);

        if (!error && data && data.length > 0) {
          return data[0] as AdminUser;
        }
      } catch (err) {
        console.warn('[Supabase] Lookup notice:', err);
      }
    }

    return null;
  },
};

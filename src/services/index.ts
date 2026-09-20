/**
 * KOGNITI MINDS - Services Module Barrel Export
 *
 * Centralizes all service layer exports for clean, predictable imports.
 *
 * Example Usage:
 *   import { emailOtpService, storageService, razorpayService } from '@/services';
 */

export { emailOtpService } from './emailOtpService';
export { storageService } from './storageService';
export { razorpayService } from './razorpayService';
export { certificationService } from './certificationService';
export { galleryService } from './galleryService';
export { policyNotificationService } from './policyNotificationService';
export { adminDbService, MASTER_SUPER_ADMIN, normalizeAdminIdentifier } from './adminDbService';
export { firebaseAuthService } from './firebaseAuthService';
export { supabase, isSupabaseConfigured } from './supabaseClient';
export { app as firebaseApp, auth as firebaseAuth, db as firestoreDb, isFirebaseConfigured } from './firebase';

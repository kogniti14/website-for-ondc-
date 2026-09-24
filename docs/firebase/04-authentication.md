# Authentication Migration Strategy (Supabase → Firebase Auth)
# Kogniti Minds Private Limited

## 1. Overview & Objective

The migration of user identities must ensure:
1. **Zero Accidental Account Deletions:** No registered B2C customer or B2B business will lose access to their profile, orders, or documents.
2. **Password Security:** Supabase hashes passwords with bcrypt/Argon2. Plaintext passwords cannot be exported.
3. **Seamless Multi-Method Support:**
   - Email + Password login.
   - Google Single Sign-On (SSO).
   - Email OTP login / registration via Resend.

## 2. User Migration Workflow

```
Existing Supabase / Local User
            │
            ▼
Does Firebase Auth account exist?
       ├── YES ──► Sign in directly via Firebase Auth
       └── NO  ──► Dual-Registration / Account Linking Flow:
                     1. User logs in with Email/Password or Email OTP.
                     2. System auto-provisions user in Firebase Auth.
                     3. Stores `firebaseUid` in Firestore document `b2c_users/{id}` or `b2b_businesses/{id}`.
                     4. User continues without disruption.
```

## 3. Role Management & Claims

Firebase Auth custom claims map user permissions:
- `super_admin`: Full access to the Governance Console, KYC moderation, and global configuration.
- `admin`: Scoped staff administration (Operations, Catalog, Finance).
- `b2b`: Corporate account access with wholesale pricing and RFQ capabilities.
- `b2c`: Retail shopper profile.

## 4. Master Super Admin Provisioning

The Master Super Admin (`kogniti14`, Shaurya Kashyap) is automatically ensured in Firebase Cloud Auth on boot via `adminDbService.ensureSuperAdminInFirebaseAuth()`.

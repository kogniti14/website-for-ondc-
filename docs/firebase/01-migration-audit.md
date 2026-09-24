# 01 - Firebase Migration Audit
# Kogniti Minds Private Limited

## Reference
The complete and unabridged technical audit document is maintained at:
[`docs/FIREBASE_MIGRATION_AUDIT.md`](../FIREBASE_MIGRATION_AUDIT.md)

---

## Executive Overview
Kogniti Minds Private Limited is migrating its live digital commerce platform ([kognitiminds.com](https://kognitiminds.com)) from legacy Supabase stores to Google Firebase.

### Current System Summary
1. **Frontend**: React 18.3.1 SPA with Vite 5.4.x and Tailwind CSS.
2. **Backend**: Dual-engine runtime:
   - Hostinger LiteSpeed Web Server with native PHP endpoints (`/api/data.php`, `/api/upload.php`, `/api/send-email.php`).
   - Node.js Express 5.2.1 server (`server.js`) handling ONDC Beckn v1.2.0 RETeB2B protocol transactions and cryptographic request signing.
3. **Database Footprint**:
   - Supabase was historically used for `admin_users` and auxiliary user records.
   - Authoritative JSON stores exist at `data/storage/*.json`.
   - Firebase (`kognitiminds-ondc`) is already integrated for Auth, Gallery, and Certifications.
4. **Target State**:
   - Cloud Firestore as the authoritative, globally synchronized real-time database.
   - Firebase Storage for product media, gallery, certificates, reviews, and secure B2B KYC documents.
   - Firebase Authentication with custom claims for RBAC (Super Admin, Admin, B2B, B2C).
   - Local JSON files and PHP endpoints maintained as high-speed caching & failover fallback.

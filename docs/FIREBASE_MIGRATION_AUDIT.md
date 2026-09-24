# KOGNITI MINDS PRIVATE LIMITED
# Complete Technical Audit: Supabase to Firebase Live Production Migration

**Audit Timestamp:** 2026-09-25T00:30:00+05:30  
**Website:** [https://kognitiminds.com](https://kognitiminds.com)  
**Project:** Kogniti Minds Private Limited  
**Author:** Senior Firebase Architect & Database Migration Engineer  
**Status:** Complete Architectural Audit (Read-Only Phase)  

---

## 1. Executive Summary

Kogniti Minds Private Limited operates a digital commerce platform serving both **B2C retail consumers** and **B2B wholesale / institutional enterprises**, while actively participating in India's **ONDC (Open Network for Digital Commerce) RETeB2B network**.

This audit inspects the complete codebase, data persistence layers, authentication flows, file storage mechanisms, security boundaries, and hosting infrastructure. The objective is to design and execute a seamless, zero-downtime, zero-data-loss migration from **Supabase** to **Firebase** (Cloud Firestore, Firebase Authentication, Firebase Storage, and Admin SDK), making Firebase the primary authoritative database and backend service.

---

## 2. Infrastructure & Runtime Environment

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 18.3.1 | Single-Page Application (SPA) with TypeScript 5.6.2 |
| **Bundler & Build Tool** | Vite 5.4.10 / 5.4.21 | `tsc -b && vite build` generating static production assets in `dist/` |
| **Primary Production Host** | Hostinger Cloud Hosting | LiteSpeed Web Server (LSWS) / Apache with mod_rewrite, PHP 8.3 |
| **Server Runtime** | Node.js (Express 5.2.1) | `server.js` (port 3000) for ONDC Beckn protocol, payments, data router |
| **CI/CD Pipeline** | GitHub Webhook to Hostinger | Every push to `origin/main` automatically triggers build and live deployment |
| **Domain & DNS** | `kognitiminds.com` | SSL/TLS enforced via `.htaccess` (Let's Encrypt / Hostinger SSL) |
| **Email Gateway** | Resend API | Transactional emails for OTPs, invoices, policy notifications |
| **Payment Gateway** | Razorpay | Standard Checkout & Server-Side Webhooks |
| **ONDC Protocol** | ONDC:RETeB2B v1.2.0 | Cryptographic Ed25519 request signing and Beckn action dispatchers |

---

## 3. Current Database & Persistence Architecture

The existing system operates a hybrid multi-tier persistence model:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER (Browser)                         │
│  - React 18 Contexts (AuthContext, CartContext, WishlistContext)       │
│  - In-memory cache + localStorage (km_products_v2, km_b2c_orders_v2...)│
│  - Event Synchronization Bus (dataSyncBus.ts)                         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   HOSTINGER PRODUCTION SERVER LAYER                    │
│  1. LiteSpeed Native PHP Endpoints (Zero Proxy Overhead):              │
│     - public/api/data.php (CRUD for 22 storage collections)            │
│     - public/api/upload.php (File upload dispatcher: certificates, etc)│
│     - public/api/send-email.php & health.php                           │
│  2. Server Atomic Storage Mirror: data/storage/<collection>.json       │
│  3. Node.js Express Router: server/routes/dataRouter.js & server.js    │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────┐
│        SUPABASE (LEGACY / TARGET)    │  │       FIREBASE (TARGET / LIVE) │
│ - Client: src/services/supabaseClient│  │ - Config: src/services/firebase│
│ - Legacy Script: db.js               │  │ - Project: kognitiminds-ondc   │
│ - Tables: admin_users, users         │  │ - Services: Auth, Firestore,   │
│ - Env: VITE_SUPABASE_URL             │  │   Storage, Analytics           │
└──────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 4. Current Supabase Inventory & Footprint

### 4.1 Configuration & Client
- **Configuration File:** `src/services/supabaseClient.ts`
- **Dependency:** `@supabase/supabase-js` (^2.0.0) in `package.json`
- **Environment Variables Referenced:**
  - `VITE_SUPABASE_URL`, `SUPABASE_URL` (fallback: `https://placeholder.supabase.co`)
  - `VITE_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_KEY`, `SUPABASE_KEY` (fallback: `placeholder-key`)
- **Vite Config Integration:** `vite.config.ts` exposes `SUPABASE_URL` and `SUPABASE_ANON_KEY` to client define rules.

### 4.2 Code Locations Using Supabase
1. **`src/services/supabaseClient.ts`**: Client factory using `createClient(supabaseUrl, supabaseAnonKey)`.
2. **`db.js`**: Node script attempting connection check to table `admin_users` and fallback to `users`, seeding `MASTER_SUPER_ADMIN`.
3. **`src/services/adminDbService.ts`**:
   - `ensureSuperAdminInDatabase()`: Queries `supabase.from('admin_users')` to upsert `MASTER_SUPER_ADMIN`.
   - `loginAdminWithCredentials()`: Queries `supabase.from('admin_users').select('*')` for credentials lookup.
4. **`server/ondc/orderManager.js`**: Comment reference to Supabase sync.
5. **`.env.example`**: Example variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

### 4.3 Supabase Database Tables Identified
Based on database checks and types in the codebase:
- `admin_users`: Super Admin, Operations Admin, Catalog Manager, Finance Admin credentials and roles.
- `users`: Legacy B2C user records.
- Note: There are no Supabase Edge Functions, Supabase Storage buckets actively in production, or complex stored RPC procedures deployed. Supabase has primarily functioned as an auxiliary sync store alongside the Hostinger atomic JSON database and Firebase.

---

## 5. Existing Firebase Footprint

Firebase is already partially configured and installed in the project:
- **Dependency:** `firebase` (^12.19.0) in `package.json`.
- **Config file:** `src/services/firebase.ts` with live configuration:
  - Project ID: `kognitiminds-ondc`
  - Auth Domain: `kognitiminds-ondc.firebaseapp.com`
  - Storage Bucket: `kognitiminds-ondc.firebasestorage.app`
  - Messaging Sender ID: `585231773951`
  - App ID: `1:585231773951:web:1a71e21a858b5db71adcca`
  - Measurement ID: `G-LHW5GZQCCS`
- **Firebase Auth Service:** `src/services/firebaseAuthService.ts` implementing:
  - `loginWithEmail`, `registerWithEmail`, `loginWithGoogle`, `sendPasswordReset`, `onAuthStateChanged`.
- **AuthContext Integration:** `src/context/AuthContext.tsx` handles Firebase user sync for B2C and B2B accounts.
- **Firestore Partial Usage:**
  - `src/services/certificationService.ts`: Firestore calls for `company_certifications` and `certification_categories`.
  - `src/services/galleryService.ts`: Firestore calls for `gallery_stories` and `gallery_categories`.
  - `src/services/adminDbService.ts`: Firestore document `admin_users/adm_super_01`.
- **Firebase Storage Partial Usage:**
  - `src/services/certificationService.ts`: Storage reference under `certifications/{id}`.
  - `src/services/galleryService.ts`: Storage reference under `gallery/{id}`.

---

## 6. Business Entities & Data Collections Audit

The application manages 22 business data collections that currently persist across `data/storage/*.json`, `public/api/data.php`, `server/routes/dataRouter.js`, and local cache:

| Collection Name | Entity Type | Description | Current Records / Seed |
|---|---|---|---|
| `products` | `Product` | Sustainable tree-free paper & stationery catalog | 12 active products (49 slabs, specs) |
| `categories` | `Category` | Catalog product categories | 6 core categories |
| `b2c_users` | `B2CUser` | Retail customer profiles, addresses | Production customer records |
| `b2b_businesses` | `B2BBusiness` | Corporate accounts, GSTIN, PAN, credit limit | Enterprise business records |
| `b2c_orders` | `B2COrder` | B2C customer orders, Razorpay txns, timeline | Active & historical retail orders |
| `b2b_orders` | `B2BOrder` | B2B wholesale orders, terms, ledger | Active & historical wholesale orders |
| `b2b_quotations` | `B2BQuotation` | Institutional RFQs, counter-revisions | Formal quotations & revision history |
| `admin_users` | `AdminUser` | Admin console accounts, roles, permissions | Master Super Admin + staff admins |
| `coupons` | `Coupon` | Promotional coupon codes, discounts | Standard discount coupons |
| `certifications` | `CompanyCertification` | Official statutory company certificates (MSME, ISO) | 4 official corporate certificates |
| `certification_categories`| `CertificationCategory`| Certificate classification tags | 13 statutory categories |
| `stories` | `GalleryStory` | Success stories, farmer impact cases | Verified case studies & impact stories |
| `gallery_categories` | `GalleryCategory` | Categories for media & success stories | 10 story categories |
| `testimonials` | `Testimonial` | Client Trust carousel reviews & ratings | 5 corporate client testimonials |
| `reviews` | `ProductReview` | Verified customer reviews (photos/videos) | Verified customer reviews & ratings |
| `review_audit_logs` | `ReviewAuditLog` | Super admin moderation audit records | Moderation audit log |
| `policies` | `LegalPolicy` | Terms, Privacy, Refund, Shipping legal text | 4 legal policies with full clauses |
| `policy_records` | `PolicyUpdateRecord`| Policy update audit log & email dispatch state | Audit logs of legal policy revisions |
| `policy_versions` | `Record<string, string>`| Current active versions for legal policies | Version tracking (e.g. 1.0.0) |
| `site_media` | `SiteMedia` | Banners, logos, assurance images | Hero, GeM, ONDC logo URLs |
| `settings` | `Record<string, any>` | Global store settings, notifications | Store contact, tax, dispatch settings |
| `reset_otps` | `PasswordResetOtp` | Password reset temporary OTP tokens | Ephemeral verification tokens |

---

## 7. Storage & Document Uploads Audit

The platform processes binary documents and media across several sensitive domains:

1. **B2B Statutory Verification Documents (KYC):**
   - GST Registration Certificate (`gst_certificate`)
   - MSME / Udyam Certificate (`msme_certificate` / `msme_udyam`)
   - Memorandum of Association (`moa`)
   - Articles of Association (`aoa`)
   - Certificate of Incorporation (`coi`)
   - Stored in: `uploads/certificates/` and dispatched via `public/api/upload.php`.
   - Security rule: Must remain **private** to Super Admin and the owner business account. Never publicly indexable.
2. **Company Certifications & Recognitions:**
   - Official ISO, MSME, Green Clean Tech certificates (PDF & Images).
   - Stored in `uploads/certificates/` or Firebase Storage `certifications/`.
   - Security rule: Publicly downloadable if `allowDownload: true`.
3. **Product Media & Review Media:**
   - Product imagery: WebP / PNG / JPG.
   - Customer Review Photos & Videos: JPG/PNG (<=5MB), MP4/WEBM (<=25MB).
   - Stored in `uploads/reviews/` or Firebase Storage `reviews/`.
   - Security rule: Unapproved/pending review media must remain hidden until Super Admin approval.
4. **Gallery & Success Story Media:**
   - Story banner photos, case study PDFs.
   - Stored in `uploads/gallery/` or Firebase Storage `gallery/`.

---

## 8. Authentication & Authorization Audit

### 8.1 User Roles
- `guest`: Anonymous visitor browsing products, certifications, legal policies, testimonials.
- `b2c`: Registered individual customer (Email/Password, Google OAuth, Email OTP).
- `b2b`: Registered corporate client (Verified GSTIN, PAN, KYC documents, status: `pending` | `under_review` | `approved` | `rejected`).
- `admin`: Operations Admin, Catalog Manager, Finance Admin with scoped permissions.
- `super_admin`: Master governance role (`kogniti14`, Shaurya Kashyap). Full access to all modules, moderation, approvals, settings.

### 8.2 Authentication Methods
- **Firebase Email & Password Auth:** Primary cloud authentication.
- **Firebase Google OAuth Popup:** Integrated for B2C and B2B accounts.
- **Transactional Email OTP:** Managed via Resend API (`/api/auth/send-otp` -> `public/api/send-email.php`), verified in memory with cooldown.
- **Session Persistence:** `km_user_session_v1`, `km_active_role`, `km_active_entity_id`, `km_active_admin_id`.

---

## 9. API & Backend Route Audit

### 9.1 Native PHP Endpoints (`public/api/` & `api/`)
- `GET/POST/PUT/DELETE /api/data.php?collection=<name>&id=<id>`: Persistence dispatcher handling the 22 JSON collections with atomic file locking (`LOCK_EX`) and role-based inventory/review sanitization.
- `POST /api/upload.php`: File upload handler supporting base64 and multipart uploads for PDFs, images, and review videos up to 25MB.
- `POST /api/send-email.php` (aliased to `/api/auth/send-otp` & `/api/resend`): Server-side transactional email sender via Resend REST API.
- `GET /api/health.php`: Diagnostic health check returning status of persistence, Resend, Razorpay, and storage mirrors.

### 9.2 Express Node.js Server (`server.js` on port 3000)
- `GET /api/health`: Node service health status.
- `POST /api/upload` & `POST /api/upload.php`: Mirrors file upload handler for Node environment.
- `USE /api/data`: Mounts `server/routes/dataRouter.js` for REST persistence.
- `USE /api/payment`: Mounts `server/routes/paymentRouter.js` for Razorpay order creation and webhook verification.
- `USE /`: Mounts `server/ondc/ondcRouter.js` for ONDC Beckn protocol actions:
  - `/search`, `/on_search`
  - `/select`, `/on_select`
  - `/init`, `/on_init`
  - `/confirm`, `/on_confirm`
  - `/status`, `/on_status`
  - `/track`, `/on_track`
  - `/cancel`, `/on_cancel`
  - `/update`, `/on_update`
  - `/rating`, `/on_rating`
  - `/support`, `/on_support`

---

## 10. Deployment & CI/CD Audit

- **Repository Remotes:**
  - `origin`: `git@github.com:KognitiMindsPrivateLimited/website-for-ondc-.git`
  - `backup`: `git@github.com:kogniti14/website-for-ondc-.git`
- **Hostinger Production Sync:**
  - Automated webhook deploys every commit pushed to branch `main`.
  - Vite build outputs to `dist/`.
  - `.htaccess` directs public web requests to `dist/index.html` with direct exceptions for PHP endpoints (`/api/*.php`), static uploads (`/uploads/*`), and ONDC proxy rules.
- **Git Ignored Persistent Directories:**
  - `data/storage/` (Hostinger server atomic JSON persistence mirror)
  - `uploads/` (Uploaded files)
  - `.env` (Secret production keys)

---

## 11. Migration Pre-Requisites & Non-Negotiables

1. **Zero Downtime:** The website must remain operational during the migration.
2. **Zero Data Loss:** All existing products, categories, orders, user accounts, quotations, certifications, and reviews must be safely transferred.
3. **No Breaking Changes to ONDC:** The ONDC Beckn protocol router and cryptographic signature engine must remain untouched.
4. **Security First:** Firebase Admin SDK private service accounts must never be placed in frontend code or committed to Git.
5. **Preserve Fallbacks:** Retain existing Hostinger LiteSpeed persistence as an offline/redundancy fallback until Firebase is 100% verified in production.

---

*End of Audit. Proceeding to Document 2: `docs/SUPABASE_TO_FIREBASE_MAPPING.md`.*

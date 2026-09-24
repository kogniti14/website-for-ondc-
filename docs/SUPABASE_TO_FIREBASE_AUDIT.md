# KOGNITI MINDS PRIVATE LIMITED
# Complete Technical Audit: Supabase to Firebase Realtime Database Live Production Migration

**Audit Timestamp:** 2026-09-25T00:46:00+05:30  
**Website:** [https://kognitiminds.com](https://kognitiminds.com)  
**Company:** KOGNITI MINDS PRIVATE LIMITED  
**Author:** Senior Firebase Architect & Database Migration Engineer  
**Status:** Complete Architectural Audit (Read-Only Phase)  

---

## 1. Executive Summary

Kogniti Minds Private Limited operates a live commercial e-commerce platform serving retail B2C consumers, enterprise B2B institutions, and active participants on India's ONDC (Open Network for Digital Commerce) network.

This audit evaluates the current architecture, identifies all Supabase dependencies, maps the existing persistence layer, and provides the blueprint for migrating the PRIMARY database to **Firebase Realtime Database** under the designated production project:
- **Project ID:** `kognitiminds-ondc`
- **Primary Database Service:** Firebase Realtime Database (`firebase/database`)
- **Primary Object Store:** Firebase Storage (`firebase/storage`)
- **Primary Auth Engine:** Firebase Authentication (`firebase/auth`)

---

## 2. Infrastructure & Runtime Environment

| Layer | Component | Specification |
|---|---|---|
| **Frontend Framework** | React 18.3.1 | Single-Page Application (SPA) with TypeScript 5.6.2 and Vite 5.4.x |
| **Styling** | Tailwind CSS / Vanilla CSS | Embedded responsive stylesheets in `dist/assets/` |
| **Production Hosting** | Hostinger Cloud Hosting | LiteSpeed Web Server (LSWS) with PHP 8.3 & Apache mod_rewrite |
| **Server Daemon** | Node.js (Express 5.2.1) | `server.js` running on port 3000 handling ONDC Beckn v1.2.5 RETeB2B protocol |
| **CI/CD Pipeline** | GitHub Webhook | Pushes to `origin/main` automatically build and deploy live to Hostinger |
| **Domain & SSL** | `kognitiminds.com` | Let's Encrypt / Hostinger SSL enforced via `.htaccess` |
| **Email Gateway** | Resend API | Transactional OTPs, invoices, B2B registrations, policy notifications |
| **Payment Gateway** | Razorpay / Cashfree | Secure server-side verification and webhooks |
| **ONDC RETeB2B Engine** | ONDC Beckn Protocol | Ed25519 cryptographic signing, catalogue mapping, and reverse fulfillment |

---

## 3. Current Supabase Footprint & Dependency Analysis

Comprehensive code inspection was conducted across all source and server directories:

```
Search Patterns:
- supabase.from
- supabase.auth
- supabase.storage
- supabase.rpc
- supabase.channel
- supabase.functions
```

### Audit Findings:
1. **`src/services/supabaseClient.ts`**:
   - Initializes Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Uses placeholder URLs (`https://placeholder.supabase.co`) if environment variables are unset.
   - Provides helper `isSupabaseConfigured()`.
2. **`src/services/adminDbService.ts`**:
   - Queries `admin_users` table as a legacy auxiliary check for Super Admin account.
3. **`db.js`**:
   - Auxiliary Node script verifying connection to `admin_users` and `users`. (Not imported by production runtime).
4. **Supabase Storage**:
   - Zero active buckets in use. Files are uploaded via Hostinger `/api/upload.php` to local `/uploads/`.
5. **Supabase Edge Functions / RPC**:
   - Zero RPC procedures, zero Supabase edge functions, and zero Supabase Realtime channels in production.
6. **Verdict**:
   - Supabase dependencies are lightweight and safely decoupled.
   - Transitioning to **Firebase Realtime Database** as the authoritative primary database can be executed with zero downtime and zero data loss.

---

## 4. Current Persistence & Data Layer

Authoritative production datasets reside in two coordinated tiers:
1. **Client Tier:** React 18 state, Context APIs (`AuthContext`, `CartContext`, `WishlistContext`), and `localStorage` caches.
2. **Server Tier:** Hostinger LiteSpeed native PHP dispatcher (`/api/data.php`) managing atomic JSON files under `data/storage/`.

### Verified Authoritative Entities in `data/storage/`:
| Entity Name | Source File | Records | Classification |
|---|---|---|---|
| `admin_users` | `admin_users.json` | 1 | Super Admin credentials & permissions |
| `products` | `products.json` | 13 | Master eco-paper & stationery catalogue |
| `categories` | `categories.json` | 5 | Product taxonomy & navigation slugs |
| `reviews` | `reviews.json` | 4 | Moderated customer reviews with media |
| `review_audit_logs` | `review_audit_logs.json` | 2 | Administrative audit logs for moderation |
| `testimonials` | `testimonials.json` | 5 | Client trust testimonials and ratings |
| `b2b_businesses` | `b2b_businesses.json` | 0 | Registered B2B corporate entities |
| `b2c_users` | `b2c_users.json` | 0 | Retail consumer profiles |
| `b2c_orders` | `b2c_orders.json` | 0 | Retail customer orders |
| `b2b_orders` | `b2b_orders.json` | 0 | Wholesale purchase orders |
| `b2b_quotations` | `b2b_quotations.json` | 1 | Institutional RFQ quotations |
| `certifications` | `certifications.json` | Pre-seeded | Government recognitions & compliance certs |
| `certification_categories` | `certification_categories.json` | Pre-seeded | 13 official compliance categories |
| `stories` | `stories.json` | Pre-seeded | Client impact case studies |
| `settings` | `settings.json` | 1 | Global website configuration & announcements |
| `policy_versions` | `policy_versions.json` | 1 | Compliance policy audit records |

---

## 5. Security & Secret Exposure Audit

- `.gitignore` properly includes `.env`, `.env.*`, `data/storage/`, and `uploads/`.
- No server-side secrets (`RESEND_API_KEY`, `RAZORPAY_KEY_SECRET`, ONDC Ed25519 private keys) are exposed in the client-side bundle or committed to Git.
- Realtime Database Security Rules (`database.rules.json`) and Storage Rules (`storage.rules`) will be established to enforce strict Role-Based Access Control (RBAC).

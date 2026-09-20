# Kogniti Minds - Code Ownership & Governance Map

This document establishes engineering domain ownership, code review responsibilities, and escalation paths for the **Kogniti Minds** platform.

---

## 1. Domain Ownership Matrix

| Domain | Scope & Directories | Primary Responsibility | Reviewers / Team |
|---|---|---|---|
| **Core Architecture & Config** | `src/config/`, `src/types/`, `vite.config.ts`, `tsconfig.json` | Design patterns, global constants, configuration | Principal Architect / Tech Lead |
| **Frontend UI & Components** | `src/components/`, `src/pages/`, `src/context/`, `src/index.css` | React state, responsive UI, component reusability, styling | Senior Frontend Engineer |
| **Authentication & OTP** | `src/services/emailOtpService.ts`, `src/components/auth/`, `public/api/send-email.php` | OTP generation, 10s cooldown timer, Resend dispatch, auth modals | Auth & Security Engineer |
| **Payment Gateway** | `src/services/razorpayService.ts`, `src/components/payment/` | Razorpay checkout flow, HMAC signature verification, order reconciliation | Payment Systems Engineer |
| **B2B Wholesale & RFQ** | `src/services/b2bService.ts`, `src/components/b2b/`, `src/pages/b2b/` | Tiered pricing, MOQ calculation, quotation requests | B2B Domain Lead |
| **B2C Retail & Catalog** | `src/services/productService.ts`, `src/services/cartService.ts`, `src/pages/` | Product browsing, shopping cart, retail checkout, order status | Retail Product Engineer |
| **ONDC Protocol Engine** | `server.js`, `server/routes/ondcRoutes.js`, `test-ondc.js` | Beckn v1.2.0 compliance, Ed25519 signatures, 51/51 automated tests | ONDC Protocol Engineer |
| **Data Persistence & Storage** | `src/services/storageService.ts`, `public/api/data.php`, `data/storage/` | Dual-tier storage (localStorage + atomic PHP JSON), file locks | Backend Platform Engineer |
| **DevOps & Infrastructure** | `.htaccess`, `public/api/`, Hostinger Git CI/CD, DNS, SSL | Web server configuration, zero-downtime deploys, uptime | Senior DevOps Engineer |

---

## 2. Pull Request Review Rules

1. **At Least One Domain Owner Approval**: Every pull request modifying a specific domain must be reviewed and approved by the corresponding domain owner.
2. **Mandatory Build & Test Pass**:
   - `npm run build` must succeed with zero TypeScript or bundle warnings.
   - `npm run test:ondc` must pass with 51/51 tests (100% success rate) if backend/ONDC routes are touched.
3. **No Secrets in Commits**: Never stage `.env` files, production API keys, or private SSH keys.
4. **Immediate Production Sync**: Pushing to `origin main` automatically deploys live to Hostinger. Only push fully tested, verified code.

---

## 3. Production Escalation Protocol

If an incident occurs in production (`https://kognitiminds.com`):

```
Level 1: Triage & Rollback
├── Check /api/health.php
├── Review server error logs in Hostinger hPanel
└── If breaking error, git revert HEAD and push to origin main (deploys in <60s)

Level 2: Domain Lead Notification
├── Email / OTP failure: Contact Auth & Security Engineer
├── Checkout failure: Contact Payment Systems Engineer
└── ONDC network issue: Contact ONDC Protocol Engineer

Level 3: Infrastructure & DNS
└── Contact Senior DevOps Engineer for SSL renewal, DNS propagation, or server configuration
```

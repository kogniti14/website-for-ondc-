# KOGNITI MINDS PRIVATE LIMITED
### Sustainable Agri-Waste Paper Products & ONDC B2B/B2C E-Commerce Platform

**Official Production Website:** [https://kognitiminds.com](https://kognitiminds.com)  
**Corporate Headquarters:** New Delhi, India  
**Platform Architecture:** React 18 + Vite + TypeScript (Frontend) | LiteSpeed PHP 8.3 & Node.js Express (Backend) | Hostinger CI/CD

---

## 1. Project Overview
Kogniti Minds Private Limited is an innovative Indian enterprise dedicated to producing premium, eco-friendly paper and stationery products manufactured directly from agricultural residue (crop straw, wheat husk, and agro-waste) rather than forest timber. 

This repository contains the complete unified web platform:
- **B2C E-Commerce Marketplace:** Retail catalog, shopping cart, checkout, live order tracking, and customer dashboards.
- **B2B Wholesale Portal:** Tiered bulk pricing slabs, Request for Quotation (RFQ) engine, GST invoicing, and corporate account management.
- **ONDC eB2B Seller Node:** Full protocol implementation (`ONDC:RETeB2B` v1.2.0) allowing commercial buyer applications across India to discover, select, order, track, and return Kogniti Minds goods on the open network.
- **Administrative Governance Console:** Secure staff management, inventory control, certification publishing, gallery curation, and policy administration.

---

## 2. Business Purpose
Traditional paper manufacturing accounts for significant global deforestation and water depletion. Simultaneously, agricultural crop residue burning creates catastrophic seasonal air pollution across North India. Kogniti Minds bridges this ecological gap:
1. **Raw Material:** 100% agricultural waste cellulose fibers.
2. **Environmental Impact:** Saves trees, eliminates stubble burning, reduces chemical usage, and conserves water.
3. **Product Line:** 75/80/85 GSM copier papers, premium corporate notebooks, diary sets, packaging boxes, and institutional pallets.

---

## 3. Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend SPA** | React 18.3, TypeScript 5.6, Vite 5.4 | Ultra-fast client-side reactive rendering and modern UI |
| **Styling & Icons** | Vanilla Modern CSS (Tokens, CSS Variables), Lucide React | Clean, custom responsive design without heavy utility frameworks |
| **Production Web Server** | LiteSpeed / Apache (Hostinger Cloud), PHP 8.3.33 | High-concurrency native request handling, static asset caching |
| **ONDC & Protocol Daemon** | Node.js Express 5.2, Ed25519 & X25519 Cryptography | Open Network protocol endpoints (`/search`, `/select`, `/init`, etc.) |
| **Persistence Engine** | Dual-Tier: Browser Cache + Atomic JSON Files (`data/storage/`) | Zero-latency instant hydration with persistent server-side records |
| **Email & Transactional** | Resend REST API (`security@kognitiminds.com`) | DKIM/SPF verified transactional email and OTP dispatch |
| **Payment Gateway** | Razorpay Official SDK (Cards, UPI, Netbanking, Wallets) | PCI-DSS compliant checkout with server-side HMAC signature verification |

---

## 4. High-Level Architecture

```mermaid
graph TD
    User([End User / Corporate Buyer]) --> CDN[Hostinger CDN / Edge Cache]
    CDN --> WebServer[LiteSpeed / Apache Web Server]
    
    subgraph Hostinger Native Hosting
        WebServer --> SPA[React Single Page Application]
        WebServer --> HealthAPI[GET /api/health.php]
        WebServer --> EmailAPI[POST /api/send-email.php]
        WebServer --> DataAPI[GET/POST /api/data.php]
        EmailAPI --> ResendAPI[Resend Transactional API]
        DataAPI --> JSONStorage[(Persistent JSON Store: data/storage/)]
    end

    subgraph ONDC Daemon / Optional Node Layer
        WebServer -->|Port 3000| NodeServer[server.js - Express 5]
        NodeServer --> ONDCRouter[/search, /select, /init, /confirm, /status, /update]
        NodeServer --> PaymentRouter[/api/payment/create-order, /verify]
    end

    PaymentRouter --> RazorpayGateway[Razorpay Financial Gateway]
```

---

## 5. Directory Structure & Organization

```
/
├── .htaccess                 # Root Apache rewrite rules (Direct native routing, zero 503 proxy timeouts)
├── AGENTS.md                 # Mandatory deployment guidelines for AI agents & engineers
├── package.json              # Project dependencies & build scripts
├── server.js                 # Express server for ONDC protocol & optional backend APIs
├── test-ondc.js              # Automated 51-point ONDC protocol test suite
│
├── api/                      # Backend API dispatchers
│   ├── health.php            # Native production health check endpoint
│   ├── send-email.php        # Server-side Resend email & OTP dispatcher
│   ├── data.php              # Server-side JSON persistence dispatcher
│   └── resend.js             # Node.js Resend handler
│
├── public/                   # Static assets & web root files
│   ├── .htaccess             # Production Apache configuration
│   ├── favicon.svg           # Application brand icon
│   └── api/                  # Mirror of PHP endpoints for web root direct access
│
├── server/                   # Backend Node.js modules
│   ├── ondc/                 # ONDC B2B protocol engine (crypto, router, catalog mapper, state)
│   ├── routes/               # dataRouter.js, paymentRouter.js
│   ├── storage/              # persistentStore.js
│   └── logger.js             # Structured application logger
│
├── src/                      # Client-side React Application
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root view router & global state orchestrator
│   ├── config/               # Centralized configuration (appConfig.ts, bankConfig.ts)
│   ├── context/              # React context providers (AuthContext, CartContext, WishlistContext)
│   ├── data/                 # Seed data & static legal policies (mockProducts, legalPolicies)
│   ├── types/                # TypeScript interface definitions (index.ts)
│   ├── services/             # Core business logic services (emailOtp, storage, razorpay)
│   ├── components/           # Reusable UI components organized by domain
│   │   ├── admin/            # Governance, catalog, certification & gallery managers
│   │   ├── auth/             # B2C, B2B, and Admin authentication modals
│   │   ├── b2b/              # B2B invoice modal and quotation views
│   │   ├── common/           # Shared modals, image upload, WhatsApp floating button
│   │   ├── layout/           # Navbar, B2BNavbar, Footer
│   │   ├── payment/          # Razorpay checkout modal
│   │   └── products/         # Product cards and product detail modal
│   └── pages/                # Top-level application views
│       ├── admin/            # AdminDashboardPage.tsx
│       ├── b2b/              # B2B home, catalog, cart, RFQ, and dashboard pages
│       ├── b2c/              # B2C home, product listing, cart, checkout, orders, dashboard
│       └── legal/            # LegalPolicyPage.tsx (Privacy, Terms, Shipping, Refund)
│
└── docs/                     # Architectural blueprints & engineering guides
    ├── intern-development-guide.md # Zero-to-hero onboarding for interns
    ├── where-to-change.md          # Feature lookup table
    ├── architecture-rules.md       # Engineering principles & constraints
    ├── architecture.md             # Full architecture document with Mermaid diagrams
    ├── api.md                      # REST & ONDC API specification
    └── ...                         # Specialized feature guides
```

---

## 6. Authentication & Role Separation
The platform enforces strict logical separation between three operational roles:
1. **B2C Customer (`role: 'b2c'`):**
   - Individual retail buyers.
   - Access to retail pricing, shopping cart, checkout, personal orders, and address book.
2. **B2B Corporate Account (`role: 'b2b'`):**
   - Verified enterprises and institutions.
   - Access to tiered wholesale discounts, GST invoicing, custom RFQs, and purchase orders.
3. **Administrative Personnel (`role: 'admin'`, `isAdmin: true`):**
   - Staff and Super Admin governance console.
   - Access to product catalog editing, order status changes, certification uploads, and system health checks.

---

## 7. OTP Verification System
- **Security:** Cryptographically random 6-digit numeric tokens generated via `crypto.getRandomValues()`.
- **Real-Time Countdown:** The resend countdown ticks down second-by-second in real time (`10s` ➔ `9s` ... ➔ `Resend Code`).
- **Cooldown Window:** Exactly **10 seconds** between resend requests.
- **Validity:** OTP expires in **10 minutes**.
- **Brute-Force Guard:** Maximum 5 failed verification attempts before invalidation.
- **Server Dispatcher:** Dispatched securely from the server via Resend using `RESEND_API_KEY`. The client browser never touches or receives secret keys.

---

## 8. Payment Gateway Integration
- **Provider:** Razorpay Official Gateway.
- **Flow:**
  1. Frontend invokes `/api/payment/create-order` (or initializes client options).
  2. Razorpay Checkout Modal opens with customer prefill.
  3. Customer completes payment via UPI, Credit/Debit Card, Netbanking, or Wallet.
  4. Response is cryptographically verified via HMAC-SHA256 signature verification (`/api/payment/verify`).
  5. Transaction is recorded in the internal accounting ledger and order status is marked as `PAID`.

---

## 9. Dual-Tier Database & Storage Engine
- **Tier 1 (Client-Side Memory & LocalStorage):** Provides instant page loads, instant cart updates, and offline resilience.
- **Tier 2 (Server-Side Atomic JSON):** Handled natively by [public/api/data.php](file:///Users/utkarshojha/KOGNITI%20MINDS%20WEBSITE%20ONDC/public/api/data.php) and [server/storage/persistentStore.js](file:///Users/utkarshojha/KOGNITI%20MINDS%20WEBSITE%20ONDC/server/storage/persistentStore.js). Writes to `.tmp` files and executes atomic renames to prevent corruption.
- **Safe Deployments:** Directory `data/storage/` is gitignored so Git pulls never delete or overwrite production data.

---

## 10. B2C E-Commerce Flow
1. User browses sustainable paper products with dynamic category filters.
2. Items added to B2C Cart with instant subtotal and tax calculation.
3. Checkout requires customer details, delivery address, and policy acceptance.
4. Payment executed via Razorpay or Cash on Delivery.
5. Automated GST invoice generated and stored in customer order history.

---

## 11. B2B Wholesale & RFQ Engine
1. Corporate clients view wholesale rates with Minimum Order Quantities (MOQ).
2. Tiered bulk discounts dynamically calculate based on quantity ordered:
   - Tier 1 (10–24 reams): Base wholesale price
   - Tier 2 (25–49 reams): 5% bulk discount
   - Tier 3 (50–99 reams): 8% bulk discount
   - Tier 4 (100+ reams): 12% bulk discount
3. Clients can submit custom RFQs (Requests for Quotation) with custom GSM, sizes, and branding requirements.
4. Administrators review RFQs in the Admin Console, generate official quotations, and convert them to orders.

---

## 12. Administrative Governance Console
- **Access Route:** Navigational role switcher or Admin Login modal.
- **Capabilities:**
  - Product catalog CRUD (Pricing, inventory, GSM, certifications, images).
  - Order management (Status transitions: `PENDING` ➔ `CONFIRMED` ➔ `SHIPPED` ➔ `DELIVERED`).
  - Company certification management (Upload and display ISO, FSC, and eco-certifications).
  - Impact gallery management (Publish farmer partnerships and sustainability stories).
  - System diagnostics (`/api/health`).

---

## 13. ONDC B2B Protocol Engine
- **Network Domain:** `ONDC:RETeB2B` (Version 1.2.0).
- **Compliance:** Full implementation of Beckn protocol callbacks:
  - `on_search`: Real-time catalog broadcast with HSN codes and tiered wholesale slabs.
  - `on_select`: Quote calculation with itemized GST (CGST/SGST or IGST).
  - `on_init`: Billing and delivery terms initialization.
  - `on_confirm`: Order creation and synchronization.
  - `on_status`: Fulfillment and tracking queries.
  - `on_update`: Buyer-initiated returns (Full & Partial order returns).
  - `on_cancel`: Order cancellation handling with policy validation.
- **Automated Test Suite:** Complete 51-point verification suite executable via `npm run test:ondc`.

---

## 14. Logistics & Shipping Policy
- Shipping handled across all major Indian pin codes via integrated courier partners (BlueDart, Delhivery, DTDC).
- B2C standard shipping: Flat ₹49 (Free shipping on orders above ₹500).
- B2B logistics: Pallet freight calculated based on weight and destination state.

---

## 15. Resend Transactional Email Pipeline
- **Verified Domain:** `kognitiminds.com` (ap-northeast-1 region with active DKIM and SPF records).
- **Sender Address:** `Kogniti Minds Security <security@kognitiminds.com>`.
- **Server Dispatcher:** Strictly server-side execution via [public/api/send-email.php](file:///Users/utkarshojha/KOGNITI%20MINDS%20WEBSITE%20ONDC/public/api/send-email.php).

---

## 16. Environment Variables Guide
Refer to [.env.example](file:///Users/utkarshojha/KOGNITI%20MINDS%20WEBSITE%20ONDC/.env.example) for the full variable specification.
- **Client Variables (Vite):** `VITE_FIREBASE_*`, `VITE_RAZORPAY_KEY_ID`, `VITE_EMAIL_FROM`.
- **Server Variables (Hostinger):** `RESEND_API_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

---

## 17. Local Development Setup
```bash
# 1. Clone the repository
git clone git@github.com:KognitiMindsPrivateLimited/website-for-ondc-.git
cd website-for-ondc-

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open http://localhost:5173 in your browser
```

---

## 18. Hostinger Production Deployment & CI/CD
- **Automated Sync:** Every commit pushed to `origin main` automatically triggers Hostinger CI/CD and deploys directly to the live website.
- **Mandatory Pre-Push Verification:**
  ```bash
  npm run build
  npm run test:ondc
  git push origin main
  ```

---

## 19. Testing & Quality Assurance
```bash
# Run full ONDC Protocol test suite (51/51 tests)
npm run test:ondc

# Run TypeScript compilation and Vite production build check
npm run build

# Run ESLint validation
npm run lint
```

---

## 20. Troubleshooting & Common Production Issues
- **HTTP 503 Errors:** Resolved. Apache `.htaccess` routes directly to native PHP handlers.
- **SSL Certificate Warning:** Ensure root `@` DNS A-record points to Hostinger IP (`91.108.106.166` / `89.117.157.18`), never third-party email host IPs.
- **Resend Email Not Sending:** Check that `RESEND_API_KEY` is present in Hostinger File Manager `.env` or `.htaccess`. Test via `curl -s https://kognitiminds.com/api/health`.

---

## 21. Security & Compliance Protocol
- Never commit `.env` files or secret keys to GitHub.
- Never log passwords, OTP tokens, or secret credentials.
- All payment signatures verified using server-side HMAC-SHA256.

---

## 22. Contribution & Code Standards
Please read the following guides before submitting code:
- [docs/intern-development-guide.md](docs/intern-development-guide.md)
- [docs/architecture-rules.md](docs/architecture-rules.md)
- [docs/where-to-change.md](docs/where-to-change.md)
- [docs/code-ownership.md](docs/code-ownership.md)

# Kogniti Minds - Intern & Junior Developer Onboarding Guide

Welcome to the **Kogniti Minds Private Limited** engineering team!

This guide is written specifically so that you can understand the codebase, know where every feature lives, understand what you can safely change, and know what you must **NEVER** modify without senior review.

---

## 1. Fast Orientation: What is this project?
Kogniti Minds manufactures paper from **agricultural crop waste** instead of cutting down forest trees. 
Our web platform is a unified system that contains:
1. **B2C Marketplace:** Retail customers buy eco-friendly paper, diaries, notebooks.
2. **B2B Wholesale Portal:** Businesses buy in bulk with tiered volume discounts and Request for Quotations (RFQs).
3. **ONDC Integration:** Connects our inventory to the Government of India's Open Network for Digital Commerce (`ONDC:RETeB2B`).
4. **Admin Dashboard:** Company executives manage orders, products, certifications, and policies.

---

## 2. Where Code Lives (The Mental Map)

| What you want to find | Where it lives |
| :--- | :--- |
| **Frontend Pages (B2C, B2B, Admin)** | `src/pages/` |
| **Reusable UI Components (Buttons, Modals, Cards)** | `src/components/` |
| **Business Logic & API Calls (Email, Payment, Storage)** | `src/services/` |
| **Global State (User Login, Shopping Cart, Wishlist)** | `src/context/` |
| **Default Products & Static Policies** | `src/data/` |
| **TypeScript Models & Interfaces** | `src/types/index.ts` |
| **Central Configuration & Timing** | `src/config/appConfig.ts` |
| **Backend ONDC Protocol Engine** | `server/ondc/` |
| **Hostinger Production PHP Endpoints** | `public/api/` and `api/` |
| **Web Server Routing & Apache Configuration** | `.htaccess` and `public/.htaccess` |

---

## 3. How to Run the Project Locally

```bash
# 1. Open Terminal and navigate to the project directory
cd "KOGNITI MINDS WEBSITE ONDC"

# 2. Install dependencies (Node.js 18+ required)
npm install

# 3. Start local development server
npm run dev

# 4. Open http://localhost:5173 in Google Chrome
```

---

## 4. How to Safely Make Changes (Step-by-Step)

### Scenario A: "I need to add or edit a product"
1. Open `src/data/mockProducts.ts`.
2. Find `MOCK_PRODUCTS` array.
3. Add or update product properties: `sku`, `name`, `b2cPrice`, `b2bWholesalePrice`, `b2bMoq`, `b2bDiscountSlabs`, `hsn`.
4. Run `npm run build` to verify types.

### Scenario B: "I need to add a new UI Component"
1. Create your component in `src/components/<domain>/MyComponent.tsx`.
2. Use CSS variables defined in `src/index.css` (e.g. `var(--primary)`, `var(--slate-800)`).
3. Export it through `src/components/index.ts`.

### Scenario C: "I need to modify an email template"
1. Open `src/services/emailOtpService.ts`.
2. Find `generateEmailHtml()`.
3. Keep email HTML inline-styled so it renders cleanly across Outlook, Gmail, and Apple Mail.

---

## 5. What an Intern Must NEVER Do Without Senior Approval

> [!CAUTION]
> ### Strictly Prohibited Actions:
> 1. **NEVER commit `.env` files to GitHub.** Git must never track secrets.
> 2. **NEVER put secret keys in `VITE_` variables.** Any variable starting with `VITE_` is visible in the user's browser console!
> 3. **NEVER bypass OTP verification.** Do not hardcode test OTPs (`123456`) or create fake success messages.
> 4. **NEVER delete files inside `data/storage/`.** That directory holds live persistent customer and order records.
> 5. **NEVER modify `.htaccess` without senior DevOps review.** A single bad rewrite rule can cause HTTP 500 or 503 errors across the whole website.
> 6. **NEVER push broken builds.** Always run `npm run build` and `npm run test:ondc` before pushing to `origin main`.

---

## 6. How Production Deployment Works

Hostinger uses **Automated Git CI/CD**:
```
You commit code ➔ git push origin main ➔ Hostinger pulls commit ➔ Website deploys live automatically
```
Because of this automatic sync:
- Never leave untested experiments on the `main` branch.
- If you push a broken build, the live website (`kognitiminds.com`) will break immediately!

### Golden Pre-Push Checklist:
1. `npm run build` (Must complete with 0 errors)
2. `npm run test:ondc` (Must report 51/51 PASSED)
3. `git status` (Check what files you modified)
4. `git commit -m "feat/fix: clear explanation of change"`
5. `git push origin main`

---

## 7. Who to Contact
- **Architecture & Lead Developer:** Core Platform Team (`security@kognitiminds.com`)
- **Founder & CEO:** Shaurya Kashyap (`kogniti14@kognitiminds.com`)

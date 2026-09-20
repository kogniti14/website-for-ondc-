# Kogniti Minds - Platform Architecture Rules & Engineering Standards

These rules are non-negotiable for all developers, engineers, and contributors working on the **Kogniti Minds** codebase.

---

## 1. Separation of Concerns
- **UI Components (`src/components/`, `src/pages/`)** must only handle layout, rendering, user interaction, and form inputs.
- **Business Logic** must live in dedicated service modules (`src/services/`) or context providers (`src/context/`).
- Never make direct `fetch()` calls inside a JSX button click handler if a service method exists or can be created.

---

## 2. Zero Client-Side Secret Leakage
- **Never expose secrets to the browser.**
- Environment variables starting with `VITE_` are inlined into the client JavaScript bundle during build and can be read by anyone opening Chrome DevTools.
- Private keys, Resend secret keys (`RESEND_API_KEY`), Razorpay key secrets (`RAZORPAY_KEY_SECRET`), and backend JWT secrets must reside **exclusively on the server**.

---

## 3. Safe Dual-Tier Persistence
- All customer accounts, orders, quotations, and products must be stored safely.
- Never write destructive migrations that drop tables or wipe JSON storage collections.
- `data/storage/` must remain gitignored to guarantee that Git deployments on Hostinger never erase production customer data.

---

## 4. No Fake Success Responses or Mock Bypasses
- Never replace a real error with a fake success message (e.g. telling a customer "OTP Sent" when email dispatch failed).
- Never hardcode test OTP codes (`123456`, `000000`) in production code.
- If a service fails, log the technical reason safely and present a friendly, helpful error message to the customer.

---

## 5. Single Responsibility Principle
- Each file must have one clear primary job.
- Do not create catch-all files (`utils.js`, `helpers.js`, `everything.ts`) containing dozens of unrelated functions.
- If a component grows beyond 400 lines, break sub-sections into focused sub-components.

---

## 6. Real-Time Timing Guarantees
- OTP countdown timers must use real-time interval tracking (`setInterval` or timestamp delta), not recursive timeout loops that drift or freeze when the user switches browser tabs.
- Resend OTP cooldown is fixed at **10 seconds** across all authentication flows.

---

## 7. Professional Naming Conventions
- React components and pages: **PascalCase** (`ProductCard.tsx`, `HomePage.tsx`).
- Services, utilities, and configs: **camelCase** (`emailOtpService.ts`, `razorpayService.ts`, `appConfig.ts`).
- Server routers and daemons: **camelCase** (`ondcRouter.js`, `paymentRouter.js`).
- Never create temporary or throwaway names (`test2.js`, `newFile.ts`, `final.js`).

---

## 8. Cryptographic & Security Integrity
- All OTP tokens must be generated using cryptographically secure random number generators (`crypto.getRandomValues()`), never `Math.random()`.
- Payment signatures must be validated using server-side HMAC-SHA256.
- ONDC protocol messages must be verified using Ed25519 signature headers.

---

## 9. Defensive Error Handling & Safe Logging
- Always catch network errors and API timeouts.
- Never log passwords, raw OTP values, credit card numbers, or secret API keys in `console.log()` or server logs.
- Use safe presence checks (e.g. `resendConfigured: boolean`) for diagnostic checks.

---

## 10. Native Web Server Compatibility (Hostinger LiteSpeed)
- Hostinger web hosting executes requests natively via LiteSpeed / Apache PHP 8.3.
- Core public APIs (`/api/auth/send-otp`, `/api/health`, `/api/data/*`) must route natively to high-speed PHP dispatchers, avoiding reverse-proxy 503 timeouts.
- Node.js reverse proxies are scoped exclusively to ONDC daemon routes (`/search`, `/select`, etc.).

---

## 11. Mandatory Automated Verification Before Push
- Before pushing ANY commit to `origin main`:
  1. Run `npm run build` (Must succeed with 0 type errors).
  2. Run `npm run test:ondc` (Must succeed with 51/51 tests passing).
- Never push untested code to `origin main`, because Hostinger deploys every commit to production automatically.

---

## 12. Backward Compatibility & Feature Preservation
- Refactoring must improve readability, organization, and documentation without altering existing business logic.
- Never delete an existing feature (B2C, B2B, RFQ, Cart, Admin, ONDC) without written architectural approval.

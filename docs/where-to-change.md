# Where Do I Change This? (Feature Lookup Table)

When you need to make a change, use this table to find the exact file immediately without searching blindly.

---

## Quick Lookup Index

| If You Need To... | Open This File | Notes |
| :--- | :--- | :--- |
| **Change Homepage Banner / Hero Section** | `src/pages/b2c/HomePage.tsx` | Contains hero text, mission, stats, and feature highlights |
| **Change B2B Homepage Content** | `src/pages/b2b/B2BHomePage.tsx` | Corporate messaging, MOQ benefits, and wholesale CTA |
| **Add / Edit Product Information** | `src/data/mockProducts.ts` | Master product definitions, pricing, specs, and bulk tiers |
| **Change Product Card Appearance** | `src/components/products/ProductCard.tsx` | UI rendering of retail and B2B product cards |
| **Change Product Details Modal** | `src/components/products/ProductDetailModal.tsx` | Pop-up displaying full specs, certifications, and gallery |
| **Change B2C Cart Logic / Design** | `src/pages/b2c/CartPage.tsx` | Item quantity, line totals, and coupon application |
| **Change B2C Checkout Flow** | `src/pages/b2c/CheckoutPage.tsx` | Address form, delivery method, and payment initiation |
| **Change Payment Gateway Integration** | `src/services/razorpayService.ts` | Razorpay script loader, options, and HMAC verification |
| **Change Payment Modal UI** | `src/components/payment/RazorpayCheckoutModal.tsx` | Fallback payment method selector and bank details |
| **Change OTP Logic & Cooldown Time** | `src/services/emailOtpService.ts` | 6-digit generation, 10s cooldown, Resend dispatching |
| **Change Login / Register Modal** | `src/components/auth/AuthModal.tsx` | B2C authentication modal with email OTP and password |
| **Change B2B Registration & Login Modal**| `src/components/auth/B2BAuthModal.tsx` | Corporate authentication with GSTIN, company details |
| **Change Admin Login Modal** | `src/components/auth/AdminAuthModal.tsx` | Admin staff credentials and Super Admin login |
| **Change Admin Dashboard & Tools** | `src/pages/admin/AdminDashboardPage.tsx` | Product management, orders, users, and settings |
| **Change Terms, Privacy, Refund Policy** | `src/data/legalPolicies.ts` | Official legal text approved by Kogniti Minds legal counsel |
| **Change Legal Policy Full Page** | `src/pages/legal/LegalPolicyPage.tsx` | Full-page policy renderer with tabs |
| **Change Customer Order History Page** | `src/pages/b2c/OrdersPage.tsx` | Customer order list, tracking status, and invoice modal |
| **Change B2B Order / RFQ Dashboard** | `src/pages/b2b/B2BDashboardPage.tsx` | Corporate orders, quotation statuses, and downloads |
| **Change B2B RFQ Submission Form** | `src/pages/b2b/B2BRFQPage.tsx` | Custom paper specification request form |
| **Change GST Invoice Template (B2C)** | `src/components/common/OrderInvoiceModal.tsx` | Tax invoice print view with CGST/SGST/IGST breakdown |
| **Change GST Invoice Template (B2B)** | `src/components/b2b/B2BInvoiceModal.tsx` | B2B commercial invoice with purchase order reference |
| **Change WhatsApp Support Button** | `src/components/common/WhatsAppFloatingButton.tsx` | Floating contact button and pre-filled message |
| **Change WhatsApp Number / Config** | `src/config/whatsappConfig.ts` | Phone number, sales representative contacts |
| **Change Bank Account Details** | `src/config/bankConfig.ts` | NEFT / RTGS account number, IFSC code, beneficiary name |
| **Change Global Styles & Color Palette** | `src/index.css` | CSS root variables (`--primary`, `--slate-*`, fonts) |
| **Change Navigation Bar (B2C)** | `src/components/layout/Navbar.tsx` | Header navigation, category links, search, cart icon |
| **Change Navigation Bar (B2B)** | `src/components/layout/B2BNavbar.tsx` | Wholesale portal header, RFQ link, role switcher |
| **Change Footer Content & Links** | `src/components/layout/Footer.tsx` | Company address, email, social links, legal disclaimers |
| **Change ONDC Protocol Routing** | `server/ondc/ondcRouter.js` | Beckn protocol handlers (`/search`, `/select`, `/init`, etc.) |
| **Change ONDC Catalog Mapping** | `server/ondc/catalogMapper.js` | Maps internal products to ONDC Beckn catalog format |
| **Change ONDC Cryptographic Signatures** | `server/ondc/crypto.js` | Ed25519 request signing and signature verification |
| **Change Server-Side PHP Email Dispatcher** | `public/api/send-email.php` | LiteSpeed PHP cURL caller to Resend REST API |
| **Change Server-Side Data Persistence** | `public/api/data.php` | Atomic JSON CRUD engine under `data/storage/` |
| **Change Production Health Endpoint** | `public/api/health.php` | Health check reporting service statuses |
| **Change Apache URL Rewrite Rules** | `.htaccess` and `public/.htaccess` | Direct API rewrites and ONDC proxy rules |
| **Change Build or Dependency Settings** | `package.json` and `vite.config.ts` | NPM scripts, Vite build options, plugins |

---

## Rules to Remember:
1. If you edit a file under `src/services/`, make sure you check if callers in `src/context/` or `src/components/` expect specific return types.
2. If you change a data structure in `src/types/index.ts`, run `npm run build` immediately to catch any type discrepancies.
3. If you change any file in `server/ondc/`, run `npm run test:ondc` immediately to verify the 51-point compliance suite.

# Kogniti Minds - Payment Gateway Architecture & Integration

## 1. Overview
Payment processing is handled via **Razorpay Official Gateway**, providing instant compliance with Reserve Bank of India (RBI) regulations, PCI-DSS compliance, and support for UPI, RuPay, Visa, Mastercard, Netbanking, and Wallets.

---

## 2. Security Architecture
- **Client Side (`src/services/razorpayService.ts`):**
  - Accesses ONLY `VITE_RAZORPAY_KEY_ID` (public key identifier).
  - Never accesses or handles `RAZORPAY_KEY_SECRET`.
- **Server Side (`server/routes/paymentRouter.js`):**
  - Reads `RAZORPAY_KEY_SECRET` from server environment variables.
  - Generates official Razorpay Orders (`/api/payment/create-order`).
  - Computes and verifies cryptographic SHA-256 HMAC signatures (`/api/payment/verify`).

---

## 3. Cryptographic Signature Verification
When a customer completes payment in the Razorpay Checkout Modal, Razorpay returns three parameters:
- `razorpay_payment_id`
- `razorpay_order_id`
- `razorpay_signature`

The server validates:
```javascript
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

const isAuthentic = (generatedSignature === signature);
```
Only if `isAuthentic === true` is the order marked as `PAID`.

---

## 4. Mode Switching (Test vs Live)
- **Test Mode:** Use `rzp_test_...` key in `VITE_RAZORPAY_KEY_ID`.
- **Live Production Mode:** Use `rzp_live_...` key in `VITE_RAZORPAY_KEY_ID` and live secret on Hostinger.
- The service automatically detects test vs live mode from the key prefix.

# Kogniti Minds - One-Time Password (OTP) System Specification

## 1. Core Principles
1. **Zero Mock Codes in Production:** The system strictly rejects hardcoded or dummy OTP values (`123456`, `000000`).
2. **Strict Server-Side Secret Key Isolation:** The Resend API Key is kept strictly on the server (`process.env.RESEND_API_KEY` / Hostinger server environment).
3. **Real-Time Client Countdown:** Resend countdown operates via real-time interval timers.

---

## 2. Timing Parameters

| Parameter | Value | Rationale |
| :--- | :--- | :--- |
| **Code Length** | 6 digits | Industry standard for secure user entry |
| **Expiry Duration** | 10 minutes (600s) | Sufficient time for international email delivery |
| **Resend Cooldown** | 10 seconds | Rapid retry capability while preventing spam loops |
| **Max Failed Attempts** | 5 attempts | Protects against brute-force guessing attacks |

---

## 3. Lifecycle of an OTP

### 1. Generation
- Generated on the client using the browser's cryptographic API:
  ```typescript
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  const otp = (100000 + (array[0] % 900000)).toString();
  ```

### 2. Active Registry & Persistence
- Stored in-memory in `EmailOtpService.activeOtps`.
- Mirrored to `localStorage['km_pending_email_otps']` so if the customer accidentally refreshes the browser, their active OTP verification session is preserved without needing a resend.

### 3. Server Dispatch
- Payload dispatched to `/api/auth/send-otp` (or `/api/send-email.php`).
- LiteSpeed PHP connects to `https://api.resend.com/emails` with `RESEND_API_KEY`.
- Email dispatched from `Kogniti Minds Security <security@kognitiminds.com>`.

### 4. Verification & Invalidation
- Customer enters code in modal.
- On verification:
  - Check expiration (`Date.now() < record.expiresAt`).
  - Check attempt count (`record.attempts < 5`).
  - Compare OTP string.
  - **Single-Use Invalidation:** The token is immediately deleted from both memory and `localStorage` to prevent replay attacks.

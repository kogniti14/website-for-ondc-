# Kogniti Minds - Authentication & User Session Architecture

## 1. Overview
The platform supports three distinct user personas with separate authentication workflows and data models:
1. **B2C Retail Customers**
2. **B2B Corporate Clients**
3. **Internal Administrative Personnel**

---

## 2. B2C Customer Authentication
- **Identifiers:** Email Address or Mobile Number.
- **Methods:**
  - **Email OTP (Primary):** User inputs email, receives 6-digit OTP, verifies and logs in.
  - **Password:** Standard password login.
  - **Google OAuth (Optional):** Powered by Firebase Authentication if keys are configured.
- **Context Hook:** `useAuth().loginB2C()`, `useAuth().registerB2CWithEmailOtp()`.
- **State Storage:** Saved in `localStorage` under `km_b2c_users_v1` and synced to `/api/data.php?collection=b2c_users`.

---

## 3. B2B Corporate Authentication
- **Identifiers:** Corporate Work Email and GSTIN.
- **Methods:**
  - **Work Email OTP (Primary):** Ensures verified business email domain.
  - **Corporate Password:** Authorized account access.
- **Registration Requirements:** Company Legal Name, GSTIN, Billing Address, Representative Contact.
- **Context Hook:** `useAuth().loginB2B()`, `useAuth().registerB2BWithEmailOtp()`.
- **State Storage:** Saved in `localStorage` under `km_b2b_businesses_v1` and synced to `/api/data.php?collection=b2b_businesses`.

---

## 4. Admin Authentication
- **Identifiers:** Admin User ID (`kogniti14`) or Work Email (`kogniti14@kognitiminds.com`).
- **Authorization Levels:**
  - `super_admin`: Founder & Executive Leadership (Full system access).
  - `ops_admin`: Operations & Order Fulfillment.
  - `catalog_admin`: Product & Inventory Editor.
- **Security:** Requires administrative password verification.

---

## 5. Session Hydration & Persistence
When the application mounts (`App.tsx`):
1. Reads `km_active_role` from `localStorage` (`'b2c'`, `'b2b'`, or `'admin'`).
2. Reads `km_active_entity_id` and restores the corresponding user session from the active storage store.
3. If no active session exists, the application defaults to guest mode (`role: 'b2c'`, unauthenticated).

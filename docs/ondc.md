# Kogniti Minds - ONDC eB2B Protocol Engine

## 1. Overview
Kogniti Minds operates as a certified Seller Node (BPP) on the Government of India's Open Network for Digital Commerce (ONDC) within the **`ONDC:RETeB2B`** retail wholesale domain (Beckn Protocol v1.2.0).

---

## 2. Cryptographic Security (`server/ondc/crypto.js`)
- **Keypairs:**
  - **Signing:** Ed25519 private/public keys for HTTP `Authorization` digest headers.
  - **Encryption:** X25519 Diffie-Hellman keys for payload encryption where mandated.
- **Header Generation:** Creates standard Beckn Authorization headers:
  ```
  Signature keyId="kognitiminds.com|kogniti-key-01|ed25519",algorithm="ed25519",headers="(request-target) (created) (expires) digest",signature="..."
  ```

---

## 3. Protocol Flow Implementation (`server/ondc/ondcRouter.js`)

| Inbound Action | Outbound Callback | Functional Behavior |
| :--- | :--- | :--- |
| `POST /search` | `POST /on_search` | Broadcasts 12 sustainable paper items with HSN codes, GST, and wholesale slabs |
| `POST /select` | `POST /on_select` | Returns itemized quotation with CGST/SGST or IGST tax breakdown |
| `POST /init` | `POST /on_init` | Emits payment terms, bank settlement accounts, and fulfillment parameters |
| `POST /confirm` | `POST /on_confirm` | Finalizes order lock, assigns tracking ID, and triggers fulfillment |
| `POST /status` | `POST /on_status` | Emits current fulfillment state and courier AWB details |
| `POST /update` | `POST /on_update` | Implements Buyer-Initiated Returns (Full & Partial order returns) |
| `POST /cancel` | `POST /on_cancel` | Evaluates cancellation feasibility based on fulfillment status |

---

## 4. Automated Compliance Testing
The implementation includes a 51-point compliance suite covering cryptography, catalog mapping, pricing slabs, return flows, and live HTTP callbacks.
Run tests via:
```bash
npm run test:ondc
```
Target: **51/51 PASSED (100% SUCCESS)**.

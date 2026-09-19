# ONDC eB2B (ONDC:RETeB2B) Integration Guide

### KOGNITI MINDS PRIVATE LIMITED
- **Official Domain**: [https://kognitiminds.com](https://kognitiminds.com)
- **ONDC Domain**: `ONDC:RETeB2B` (Retail B2B / Institutional Wholesale)
- **ONDC Core Version**: `1.2.0`
- **Environment**: PRE-PRODUCTION (Staging/Workbench) & PRODUCTION

---

## 1. Architecture Overview

Kogniti Minds operates a dual-layer architecture where the React Single Page Application (SPA) serves public B2C/B2B buyers, and a dedicated Node.js backend engine serves official Beckn / ONDC protocol lifecycle endpoints.

```
                         ONDC Network / Buyer App / Gateway
                                         │
                                         ▼
                            https://kognitiminds.com/
                      (Hostinger LiteSpeed / Node.js Proxy)
                                         │
          ┌──────────────────────────────┴──────────────────────────────┐
          │                                                             │
          ▼                                                             ▼
  [React SPA Web Frontend]                                    [ONDC Protocol Router]
  - Public B2C / B2B Portal                                   - Root Callbacks (/<action>)
  - Admin Dashboard                                           - BLAKE-512 Body Digest
  - Order Management UI                                       - Ed25519 Cryptographic Signatures
  - Preserved existing features                               - Asynchronous Callback Engine
                                                                        │
                                   ┌────────────────────────────────────┤
                                   │                                    │
                                   ▼                                    ▼
                         [Catalogue Service]                 [Order & Return Engine]
                         - Sustainable Paper & Copiers       - Quotation & Tax Calculator
                         - HSN (48025610), 18% GST           - B2B Bulk Slabs & MOQs
                         - B2B Discount Slabs                - Active Workbench Return Flow
```

---

## 2. Environment Variables & Security Configuration

Configure the following variables in your hosting environment (`.env` or Hostinger Application Environment Variables).

> **CRITICAL SECURITY NOTE**: Never commit `.env` or raw private keys to GitHub or public repositories. The application automatically sanitizes internal logs to ensure secrets are never leaked.

```bash
# Server Port (Hostinger default is typically assigned dynamically or 3000)
PORT=3000

# ONDC Network Environment (preprod | prod)
ONDC_ENV=preprod

# Network Participant Identifiers
ONDC_SUBSCRIBER_ID=kognitiminds.com
ONDC_SUBSCRIBER_URI=https://kognitiminds.com
ONDC_REGISTRY_DOMAIN=ONDC:RETeB2B
ONDC_CITY=std:080
ONDC_COUNTRY=IND
ONDC_CORE_VERSION=1.2.0

# Cryptographic Keys (Ed25519 Signing)
ONDC_KEY_ID=kogniti-key-01
ONDC_PRIVATE_KEY=your_base64_ed25519_private_key
ONDC_PUBLIC_KEY=your_base64_ed25519_public_key

# Encryption Keys (X25519 Diffie-Hellman)
ONDC_ENCRYPTION_PRIVATE_KEY=your_base64_x25519_private_key
ONDC_ENCRYPTION_PUBLIC_KEY=your_base64_x25519_public_key

# Registry Endpoints
ONDC_REGISTRY_URL=https://preprod.registry.ondc.org/ondc

# Seller Statutory Details
SELLER_GSTIN=07AABCK1234F1Z5
SELLER_PAN=AABCK1234F
```

---

## 3. Protocol Endpoints & Callback Mapping

All ONDC endpoints are exposed directly at the root level to match the ONDC Workbench callback base URL (`https://kognitiminds.com/<action>`):

| Inbound Endpoint | Protocol Action | Synchronous Response | Asynchronous Callback Triggered |
| :--- | :--- | :--- | :--- |
| `POST /search` | Buyer searches catalog | `ACK` (`status: "ACK"`) | `POST <bap_uri>/on_search` |
| `POST /select` | Buyer selects items | `ACK` | `POST <bap_uri>/on_select` |
| `POST /init` | Buyer initializes order | `ACK` | `POST <bap_uri>/on_init` |
| `POST /confirm` | Buyer places & confirms order | `ACK` | `POST <bap_uri>/on_confirm` |
| `POST /status` | Buyer queries order status | `ACK` | `POST <bap_uri>/on_status` |
| `POST /cancel` | Buyer cancels order | `ACK` | `POST <bap_uri>/on_cancel` |
| `POST /update` | **Buyer Initiated Return** | `ACK` | `POST <bap_uri>/on_update` |
| `POST /rating` | Buyer rates transaction | `ACK` | `POST <bap_uri>/on_rating` |
| `POST /track` | Buyer tracks consignment | `ACK` | `POST <bap_uri>/on_track` |
| `POST /support` | Buyer requests support info | `ACK` | `POST <bap_uri>/on_support` |
| `GET /ondc/health` | Service health monitor | `200 OK (JSON)` | None (Internal monitor) |

---

## 4. ONDC Request & Response Lifecycle

### A. Two-Step Interaction Model
1. **Synchronous Acknowledgment (Step 1)**:
   - When a request arrives from the Gateway or Buyer App (BAP), Kogniti Minds immediately verifies the timestamp and schema, then returns an immediate synchronous `ACK`:
     ```json
     {
       "message": {
         "ack": {
           "status": "ACK"
         }
       }
     }
     ```
2. **Asynchronous Callback (Step 2)**:
   - The backend prepares the official response (e.g. `on_search`, `on_select`, `on_update`), signs the payload using Ed25519 with BLAKE-512 digest, and dispatches a `POST` request to `<context.bap_uri>/<action>`.

### B. Cryptographic Authorization Header
Outgoing callbacks include the RFC-compliant Beckn Authorization header:
```http
Authorization: Signature keyId="kognitiminds.com|kogniti-key-01|ed25519",algorithm="ed25519",created="1726790000",expires="1726790300",headers="(created) (expires) digest",signature="<base64_signature>"
```
- **Digest**: `BLAKE-512=<base64_blake2b512_hash_of_body>`
- **Signing Algorithm**: Ed25519 over UTF-8 string:
  ```
  (created): 1726790000
  (expires): 1726790300
  digest: BLAKE-512=<digest>
  ```

---

## 5. Catalogue & B2B Pricing Structure

All products in the catalogue are mapped directly from Kogniti Minds' sustainable paper inventory:
- **HSN Codes**: `48025610` for copier papers, `48201090` for notebooks, `48191010` for organizers.
- **Tax Compliance**: 18% standard GST with CGST/SGST (intra-state) or IGST (inter-state) calculation.
- **MOQ (Minimum Order Quantity)**: Enforced per B2B standards (e.g., 10 reams for AgroPrint 75 GSM).
- **Bulk Discount Slabs**:
  - Base Wholesale: Minimum order quantity threshold.
  - Office Tier: 8% off.
  - Campus / Corporate Tier: 15% off.
  - Institutional Truckload: 22% off.
- **Tags**: Products are tagged with `bpp/item_discount`, `b2b/moq`, `origin: IND`, and serviceability.

---

## 6. Workbench Return Flow: `Buyer_Initiated_Return_(Full_Order_and_Partial_Order)`

The ONDC Workbench tests the return flow through `POST /update` and expects the seller to return `POST /on_update`.

### How the Flow Works:
1. **Inbound `/update`**:
   - `update_target`: `"fulfillment"` or `"item"`.
   - Contains item ID, returned quantity, and reason code (e.g., `001`).
2. **Full vs Partial Return Detection**:
   - **Full Order Return**: All items or full quantity of delivered line items requested for return.
   - **Partial Order Return**: A subset of items (e.g., 5 out of 20 units) requested for return.
3. **Outbound `/on_update` Payload**:
   - **Order State**: Preserved in `Completed` (or `In-progress`).
   - **Reverse Fulfillment Added**:
     - `type`: `"Return"`
     - `state`: `{ "descriptor": { "code": "Return_Approved" } }`
     - Reverse QC inspection and pickup schedule with start/end time window.
   - **Quote Trail**:
     - Includes a negative refund line item reflecting the refunded product cost and proportional GST.
   - **Settlement & Payment**:
     - Reflects `ON-FULFILLMENT` refund initiation with NEFT credit note terms.

---

## 7. Hostinger Deployment Instructions

### Option A: Hostinger Node.js Web Application (Recommended)
1. Log in to **Hostinger hPanel**.
2. Navigate to **Websites** -> Select `kognitiminds.com` -> **Node.js**.
3. Configure the Node.js application:
   - **Node.js Version**: `20.x` LTS.
   - **Application Root**: `/home/uXXXX/public_html` (or repository clone directory).
   - **Application Startup File**: `server.js`.
   - **Application Mode**: `Production`.
4. In **Environment Variables**, add the ONDC variables listed in Section 2.
5. Click **Restart Application**.

### Option B: Apache / LiteSpeed with Node.js Reverse Proxy
The repository includes a customized `public/.htaccess` rule:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy ONDC and API calls to local Node.js daemon (port 3000)
  <IfModule mod_proxy.c>
    RewriteCond %{REQUEST_URI} ^/(search|select|init|confirm|status|cancel|update|rating|track|support|ondc|api) [NC]
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
  </IfModule>

  # Serve existing static assets
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l

  # SPA fallback
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 8. Verification & Testing

### Local Automated Testing
Run the comprehensive automated test suite:
```bash
node test-ondc.js
```
This validates:
1. Ed25519 key generation, BLAKE-512 body hashing, and signature roundtrip.
2. Server health endpoint `/ondc/health`.
3. Catalog search `/search`.
4. Quote and pricing `/select`.
5. Order initialization `/init`.
6. Order confirmation `/confirm`.
7. Order status `/status`.
8. **Buyer-Initiated Return (Full Order)** via `/update`.
9. **Buyer-Initiated Return (Partial Order)** via `/update`.
10. Order cancellation `/cancel`.

### Build Check
Ensure zero TypeScript compilation errors before deploying:
```bash
npm run build
```

---

## 9. ONDC Workbench Verification Steps

1. Log in to the [ONDC Workbench Portal](https://workbench.ondc.org).
2. Select Domain: **`ONDC:RETeB2B`**.
3. Select Role: **Seller (BPP)**.
4. Set Callback Base URL: `https://kognitiminds.com`.
5. Navigate to **Flows** -> **`Buyer_Initiated_Return_(Full_Order_and_Partial_Order)`**.
6. Run the test flow sequentially:
   - Search -> Select -> Init -> Confirm -> Status -> Update (Full Return) -> Update (Partial Return).
7. View execution logs on Workbench. All actions should register successful `ACK` and valid cryptographic callbacks.

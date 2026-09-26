# 01 - ONDC RET Architecture Specification
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Domain**: ONDC Retail (`ONDC:RETeB2B` / `RET 1.2.5`)  
**Role**: Seller App (BPP - Beckn Provider Platform)  
**Primary Business**: Agri-waste paper, copier paper, notebooks, and office stationery  

---

## 1. High-Level System Architecture

The Kogniti Minds platform connects the consumer and B2B web storefronts with the decentralized ONDC network through a shared, authoritative commerce core.

```
+-------------------------------------------------------------------------+
|                         KOGNITI MINDS COMMERCE                          |
|                                                                         |
|   +-----------------------+                 +-----------------------+   |
|   |   Public Web Store    |                 |   Super Admin Portal  |   |
|   |  (React 18 SPA Vite)  |                 |  (/admin/ondc console)|   |
|   +-----------+-----------+                 +-----------+-----------+   |
|               |                                         |               |
|               +--------------------+--------------------+               |
|                                    v                                    |
|                      +---------------------------+                      |
|                      |  Node.js Express 5 Engine |                      |
|                      |        (server.js)        |                      |
|                      +-------------+-------------+                      |
|                                    |                                    |
|         +--------------------------+--------------------------+         |
|         v                                                     v         |
|   +-----------+                                         +-----------+   |
|   | Web APIs  |                                         | ONDC BPP  |   |
|   |  (Store)  |                                         |  Router   |   |
|   +-----+-----+                                         +-----+-----+   |
|         |                                                     |         |
|         +--------------------------+--------------------------+         |
|                                    v                                    |
|                     +-----------------------------+                     |
|                     | Authoritative Commerce Core |                     |
|                     | - persistentStore (JSON)    |                     |
|                     | - priceEngine (GST, Slabs)  |                     |
|                     | - inventory & stock locking |                     |
|                     | - order state machine       |                     |
|                     +-----------------------------+                     |
+------------------------------------+------------------------------------+
                                     |
                                     v
                       +---------------------------+
                       | ONDC Cryptography Layer   |
                       | - Ed25519 Request Signing |
                       | - BLAKE-512 Digests       |
                       | - Replay & Timestamp Guard|
                       +-------------+-------------+
                                     |
                       +-------------+-------------+
                       |                           |
                       v                           v
              +-----------------+         +-----------------+
              |  ONDC Gateway   |         | Buyer Apps(BAP) |
              |  (Staging/Prod) |         | (e.g. Paytm,    |
              |                 |         |  Mystore, etc.) |
              +-----------------+         +-----------------+
```

---

## 2. Component Directory Structure

```
server/
├── ondc/
│   ├── canonicalProducts.js    # Authoritative baseline catalog & category models
│   ├── catalogMapper.js        # Maps store products into ONDC RET 1.2.5 catalog schema
│   ├── catalogValidator.js     # Validates HSN, pricing, dimensions, and mandatory tags
│   ├── config.js               # Environment-aware network configuration & credentials
│   ├── crypto.js               # Backward-compatible proxy to security module
│   ├── logger.js               # Structured protocol logging with PII scrubbing
│   ├── ondcRouter.js           # Protocol API router (10 actions + 10 callbacks)
│   ├── orderManager.js         # Order lifecycle, atomic inventory deduction, and rollback
│   ├── priceEngine.js          # Shared pricing engine (B2B slabs, IGST vs CGST+SGST, freight)
│   ├── returnHandler.js        # RET 1.2.5 Buyer-Initiated Return (Full & Partial) handler
│   ├── stateManager.js         # Beckn protocol state machine & idempotency tracker
│   └── security/               # Dedicated Beckn cryptographic security module
│       ├── authorization.js    # Authorization header parser and generator
│       ├── digest.js           # BLAKE-512 body digest creation and verification
│       ├── index.js            # Central security module export
│       ├── keyManagement.js    # Ed25519 and X25519 key conversion & registry cache
│       ├── replayProtection.js # Created/Expires timestamp verification
│       ├── signing.js          # Beckn digital signing string builder
│       └── verification.js     # Incoming signature validator & registry lookup
```

---

## 3. Authoritative Core Guarantee

Per non-negotiable architectural rules:
1. **Single Source of Truth**: The ONDC layer and public website query the same `persistentStore` (`data/storage/products.json`).
2. **Zero Conflicting State**: Confirmed ONDC orders decrement the same inventory stock (`prod.stock`) displayed on the website.
3. **No Synthetic Mocking**: If an order or product does not exist, genuine protocol errors (`30004` or `30006`) are returned.

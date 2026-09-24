# Firebase Realtime Database Architecture Specification
# Kogniti Minds Private Limited

**Target Project ID:** `kognitiminds-ondc`  
**Primary Database Service:** Firebase Realtime Database (`firebase/database`)  
**Object Store:** Firebase Storage (`firebase/storage`)  
**Authentication:** Firebase Authentication (`firebase/auth`)  

---

## 1. System Topology & Dual-Tier Data Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CLIENT / APPLICATION LAYER                      │
│                                                                        │
│   Web Visitors         B2C Customers         B2B Corporate Clients     │
│   (Public Catalog)     (Cart & Checkout)     (RFQs, POs & Tax Credit)  │
│          │                   │                          │              │
│          └───────────────────┼──────────────────────────┘              │
│                              │                                         │
│                              ▼                                         │
│                    React 18 SPA (Vite)                                 │
│                              │                                         │
│          ┌───────────────────┼──────────────────────────┐              │
│          ▼                   ▼                          ▼              │
│   Firebase Auth        Realtime Database         Firebase Storage      │
│   - Email/Password     - Products (Catalog)      - B2B KYC Docs (Priv) │
│   - Google OAuth       - Orders (B2C & B2B)      - Certificates (Pub)  │
│   - Custom Claims      - Reviews & Moderation    - Review Photos/Videos│
│   - Session State      - Live Stock Counters     - Success Stories     │
│                        - RFQs (Quotations)                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Realtime Synchronization & Event Subscriptions

Firebase Realtime Database provides bidirectional websocket synchronization using `onValue`:
- **Inventory Updates:** When stock decrements during checkout, all open product browsing sessions update their stock badge in real-time.
- **Review Moderation:** When Super Admin marks a customer review as `approved`, it appears immediately on the product detail page without requiring page reload.
- **Order Tracking:** When an order's status transitions to `shipped` or `delivered` with courier AWB tracking, the customer dashboard reflects the change instantly.

---

## 3. High Availability & Failover Protocol

1. **Primary Store:** Firebase Realtime Database (`kognitiminds-ondc`).
2. **Local Caching:** In-memory state and `localStorage` keys (`km_products_v2`, `km_b2c_orders_v2`).
3. **Failover Store:** Hostinger LiteSpeed Web Server (`/api/data.php`) managing atomic file-backed JSON under `data/storage/`.

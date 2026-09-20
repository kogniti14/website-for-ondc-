# Kogniti Minds - Dual-Tier Persistence & Storage Architecture

## 1. Overview
The platform uses a **Dual-Tier High-Availability Persistence Architecture** designed to deliver instant UI hydration while ensuring persistent, atomic server-side durability on Hostinger web hosting.

---

## 2. Architecture Tiers

### Tier 1: Client-Side Cache (Instant Responsiveness)
- **Engine:** Memory Store + Browser `localStorage`.
- **Purpose:** Sub-millisecond rendering for product catalogs, cart state, user session, and checkout forms.
- **Keys:** `km_products_v2`, `km_categories_v2`, `km_b2c_users_v1`, `km_b2b_businesses_v1`, `km_b2c_orders_v2`, `km_b2b_orders_v2`, `km_b2b_quotations_v2`.

### Tier 2: Server-Side Atomic Persistence (Durability)
- **Engine:** LiteSpeed PHP dispatcher (`public/api/data.php`) & Node.js store (`server/storage/persistentStore.js`).
- **Location:** `data/storage/<collection>.json`.
- **Safety Mechanism:** Atomic file writes:
  1. Writes new payload to a temporary file (`<collection>.tmp.<timestamp>_<rand>`).
  2. Executes an atomic OS rename (`rename()`) over the target file.
  3. Eliminates any possibility of partial writes or corrupted files during concurrent requests.

---

## 3. Deployment Safety Protocol
- The `data/storage/` directory is explicitly declared in `.gitignore`.
- When Hostinger CI/CD executes a Git pull from `origin main`, existing production records (users, orders, custom products) are **never overwritten or deleted**.

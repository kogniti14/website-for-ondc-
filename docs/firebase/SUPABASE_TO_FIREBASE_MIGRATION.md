# Supabase to Firebase Realtime Database Migration Plan
# Kogniti Minds Private Limited

## 1. Migration Overview
This document specifies the migration of all historical and active data records from Supabase / Hostinger persistence to **Firebase Realtime Database** under project `kognitiminds-ondc`.

---

## 2. Ingestion & Transformation Rules

1. **Idempotence:** Every record is identified by its primary natural key (`id`). Writes to Realtime Database use `set(ref(db, path), data)` or `update(ref(db, path), data)`.
2. **Timestamp Preservation:** ISO-8601 timestamps (`createdAt`, `updatedAt`, `registeredAt`) are preserved without loss.
3. **Foreign Keys:** References between `products` and `categories`, `reviews` and `products`, and `orders` and `customers` are verified during transformation.
4. **Zero Data Loss Guarantee:** No Supabase data or local `data/storage/*.json` files are deleted during or after migration.

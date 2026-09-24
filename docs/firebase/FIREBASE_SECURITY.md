# Firebase Security Specification & Rules Architecture
# Kogniti Minds Private Limited

## 1. Security Principles
- **No Wildcard Grants:** The root path denies all read and write operations by default (`".read": false, ".write": false`).
- **Granular Ownership:** Customers and B2B accounts can only read and write their own data.
- **Admin Isolation:** Super Admin privileges are verified against custom token claims and the verified primary governance email (`kogniti14@kognitiminds.com`).
- **Production Indexing:** Queries are indexed using `.indexOn` to prevent high-latency table scans.

---

## 2. Complete Realtime Database Rules Reference
Production rules are deployed via `database.rules.json`. See [`database.rules.json`](../../database.rules.json) for the full active rule definitions.

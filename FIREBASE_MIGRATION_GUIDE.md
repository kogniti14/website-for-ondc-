# KOGNITI MINDS PRIVATE LIMITED
# Master Firebase Architecture & Migration Handbook

**Website:** [https://kognitiminds.com](https://kognitiminds.com)  
**Production Firebase Project:** `kognitiminds-ondc`  
**Region:** `asia-south1` (Mumbai, India)  
**Hosting / Web Server:** Hostinger Cloud / LiteSpeed Web Server + Node.js Daemon  
**Deployment Pipeline:** GitHub Webhook to Hostinger CI/CD (`origin/main`)  

---

## 1. Documentation Index

The complete architectural specifications, audit findings, mappings, and security policies are organized into dedicated modules:

| Document | Purpose |
|---|---|
| [`docs/firebase/01-migration-audit.md`](docs/firebase/01-migration-audit.md) | Technical audit of legacy frontend, backend, server runtime, and APIs |
| [`docs/firebase/02-supabase-to-firebase-mapping.md`](docs/firebase/02-supabase-to-firebase-mapping.md) | Schema translation from Supabase relational tables to Cloud Firestore |
| [`docs/firebase/03-firebase-architecture.md`](docs/firebase/03-firebase-architecture.md) | Service topologies, client-SDK boundaries, and server-side roles |
| [`docs/firebase/04-authentication.md`](docs/firebase/04-authentication.md) | Auth flows, custom RBAC claims, password migration, and session handling |
| [`docs/firebase/05-firestore.md`](docs/firebase/05-firestore.md) | Collections, indexing strategies, transactions, and query patterns |
| [`docs/firebase/06-storage.md`](docs/firebase/06-storage.md) | Object storage buckets, KYC privacy folders, and file migration |
| [`docs/firebase/07-security-rules.md`](docs/firebase/07-security-rules.md) | Production Firestore and Storage security rules documentation |
| [`docs/firebase/08-deployment.md`](docs/firebase/08-deployment.md) | Automated GitHub to Hostinger build pipeline and verification |
| [`docs/firebase/09-rollback.md`](docs/firebase/09-rollback.md) | Emergency recovery runbook and zero-data-loss failover procedures |
| [`docs/firebase/10-troubleshooting.md`](docs/firebase/10-troubleshooting.md) | Common errors, composite indexing, CORS troubleshooting |

---

## 2. Quick Developer Reference

### 2.1 Initializing Firebase Client SDK
All client-side interactions utilize the centralized singleton in [`src/services/firebase.ts`](src/services/firebase.ts):

```typescript
import { db, auth, storage } from '@/services/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
```

### 2.2 Security Rules
Production rules are defined in:
- [`firestore.rules`](firestore.rules) — Enforces document RBAC, public catalog reads, customer privacy, and Super Admin privileges.
- [`storage.rules`](storage.rules) — Enforces folder boundaries, confidential KYC privacy for B2B accounts, and size limits on review media.

### 2.3 Automated Live Deployment
The project adheres to continuous deployment:
```bash
# Verify build
npm run build

# Commit & Push
git add .
git commit -m "feat(firebase): description of changes"
git push origin main
```
Every commit pushed to `origin/main` automatically triggers Hostinger CI/CD, building and publishing changes to [https://kognitiminds.com](https://kognitiminds.com).

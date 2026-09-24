# 09 - Rollback Strategy & Disaster Recovery
# Kogniti Minds Private Limited

## 1. Principles of Zero-Downtime Rollback
The Kogniti Minds architecture follows the principle of **Defensive Redundancy**:
1. **No Data Deletion:** Supabase accounts and historical data files in `data/storage/*.json` are never deleted during or after migration.
2. **Dual-Tier Resilience:** If Cloud Firestore experiences network latency or service disruption, the client-side data layer (`storageService.ts`) automatically falls back to local cache and server endpoints (`/api/data.php`).
3. **Instant Git Revert:** Because Hostinger deploys directly from GitHub `main`, reverting the production site takes under 60 seconds.

---

## 2. Emergency Rollback Triggers

Initiate immediate rollback procedures if any of the following occur:
- Critical Firebase Authentication failure blocking B2C/B2B logins.
- Firestore Security Rules misconfiguration causing widespread `permission-denied` errors.
- Unhandled schema mismatch preventing order checkout or ONDC Beckn protocol acknowledgements.

---

## 3. Rollback Procedures

### Scenario A: Reverting Application Code to Previous Stable Release
If a code regression is detected on production:

```bash
# 1. Identify the last verified stable commit
git log -n 5 --oneline

# 2. Revert the problematic commit
git revert <PROBLEMATIC_COMMIT_HASH> -m "Emergency Rollback: Revert to previous stable release"

# 3. Test build locally
npm run build

# 4. Push to origin main to trigger automatic Hostinger deployment
git push origin main
```

### Scenario B: Restoring Data from Point-in-Time JSON Snapshots
All production database entities are backed up as JSON snapshots in `data/storage/`:
- `data/storage/products.json`
- `data/storage/categories.json`
- `data/storage/orders.json`
- `data/storage/b2b_applications.json`
- `data/storage/reviews.json`

To restore any collection to Firestore from snapshot:
```bash
node scripts/migrate-to-firebase.js --collection=products --force
```

### Scenario C: Switching to Legacy Supabase Sync
If Firestore becomes unreachable:
1. Set `VITE_USE_FIRESTORE=false` in environment variables.
2. The application will immediately utilize local PHP persistence and Supabase auxiliary sync without requiring client reinstall.

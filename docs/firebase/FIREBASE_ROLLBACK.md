# Production Rollback Strategy & Disaster Recovery
# Kogniti Minds Private Limited

## 1. Zero-Downtime Rollback Mechanism
- The application persistence layer maintains **dual-tier resilience**:
  - Primary: Firebase Realtime Database
  - Failover: Hostinger native PHP `/api/data.php` with atomic JSON snapshots in `data/storage/`.
- If Firebase Realtime Database experiences an unexpected outage or connection latency, the client gracefully falls back to local and server storage with zero user-facing crash.

---

## 2. Emergency Steps
1. **Revert Git Commit:**
   ```bash
   git revert HEAD -m "Emergency Rollback: Revert to previous release"
   git push origin main
   ```
2. **Hostinger Automated Pull:**
   Hostinger automatically pulls the reverted commit and serves the previous stable production bundle.

# 17 - Production Deployment & Hostinger Sync Guide
**Company**: KOGNITI MINDS PRIVATE LIMITED  
**Production Domain**: [https://kognitiminds.com](https://kognitiminds.com)  

---

## 1. Deployment Architecture

Kogniti Minds is hosted on Hostinger with automatic CI/CD from GitHub (`origin main`):

```
Developer / Git Commit
         |
         v
 GitHub: origin main
         | (Webhook trigger)
         v
 Hostinger Automated CI/CD
         |
         +--> Git Pull (data/storage/ preserved via .gitignore)
         +--> npm install
         +--> npm run build (dist/ bundle + assets)
         +--> LiteSpeed / Node.js Process Restart
         +--> Live Production at https://kognitiminds.com
```

---

## 2. Pre-Deployment Verification Protocol

Before pushing to `origin main`, execute the mandatory verification pipeline:
```bash
# 1. Run full ONDC verification suite (Unit, Cryptographic, Integration, Idempotency)
node test-ondc.js

# 2. Compile TypeScript and build production frontend bundle
npm run build

# 3. Verify clean git status and zero exposed credentials
git status
```

---

## 3. Hostinger Server Configuration

1. **Environment Secrets**: Ensure production Ed25519 signing keys and Razorpay keys are configured in environment variables or cPanel.
2. **Data Directory Persistence**: The `data/storage/` folder is explicitly listed in `.gitignore`, guaranteeing that git deployments NEVER overwrite live product catalog, orders, or inventory records.
3. **Public Protocol Endpoints**: ONDC Gateway requests to `https://kognitiminds.com/search`, `https://kognitiminds.com/select`, etc., route directly to the Node.js Express server.

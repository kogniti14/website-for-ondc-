# 08 - Production Deployment Guide
# Kogniti Minds Private Limited

## 1. Live Deployment Architecture

```
┌─────────────────┐        git push origin main         ┌────────────────────────┐
│  Developer /    │ ──────────────────────────────────> │   GitHub Repository    │
│  Antigravity IDE│                                     │   (Protected Main)     │
└─────────────────┘                                     └───────────┬────────────┘
                                                                    │
                                                            Webhook │ Trigger
                                                                    ▼
                                                        ┌────────────────────────┐
                                                        │   Hostinger Cloud /    │
                                                        │   Git Automated Deploy │
                                                        └───────────┬────────────┘
                                                                    │
                                                                    ▼
                                                        ┌────────────────────────┐
                                                        │  npm run build         │
                                                        │  (Vite Bundler)        │
                                                        └───────────┬────────────┘
                                                                    │
                                        ┌───────────────────────────┴───────────────────────────┐
                                        ▼                                                       ▼
                            ┌───────────────────────┐                               ┌───────────────────────┐
                            │  Hostinger Web Root   │                               │  Cloud Firestore /    │
                            │  (LiteSpeed / PHP)    │                               │  Firebase Auth & GCS  │
                            │  kognitiminds.com     │                               │  kognitiminds-ondc    │
                            └───────────────────────┘                               └───────────────────────┘
```

---

## 2. Pre-Deployment Validation Checklist

Before every push to `origin/main`, execute the following checks locally:

```bash
# 1. Type check and Vite production bundle verification
npm run build

# 2. Verify zero TypeScript errors and successful asset generation in dist/
ls -la dist/

# 3. Verify server integrity and ONDC protocol compliance
node -e "require('./server.js')" &
SERVER_PID=$!
sleep 2
node test-ondc.js
kill $SERVER_PID
```

---

## 3. Firebase Rules Deployment

To deploy Firestore Security Rules and Storage Security Rules to the live Firebase project:

```bash
# Login to Firebase (if not already authenticated)
firebase login

# Set active project
firebase use kognitiminds-ondc

# Deploy rules
firebase deploy --only firestore:rules,storage
```

---

## 4. Hostinger Live Webhook Verification

1. When code is pushed to `origin/main`, Hostinger's Git deployment system automatically pulls the latest commit.
2. The web root serves the contents of `dist/` and `public/`.
3. LiteSpeed Web Server routes all incoming traffic to `index.html` via `.htaccess` while preserving `/api/*` endpoints for native PHP execution and `/ondc/*` endpoints for the Node.js daemon.
4. Verify live deployment at: [https://kognitiminds.com](https://kognitiminds.com).

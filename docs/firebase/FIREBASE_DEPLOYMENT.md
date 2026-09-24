# Production Deployment Architecture
# Kogniti Minds Private Limited

## 1. CI/CD Deployment Flow

```
Developer Push (origin main)
       ↓
GitHub Repository
       ↓ (Webhook Trigger)
Hostinger Cloud Hosting
       ↓
npm run build (Vite Bundler)
       ↓
kognitiminds.com (LiteSpeed Web Server + Node.js Daemon)
       ↓
Firebase Services (Auth, Realtime Database, Storage)
```

---

## 2. Deploying Realtime Database Rules

```bash
# Set active project
firebase use kognitiminds-ondc

# Deploy Realtime Database rules and Storage rules
firebase deploy --only database,storage
```

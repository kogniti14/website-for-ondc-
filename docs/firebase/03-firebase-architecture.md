# Firebase Architecture Specification
# Kogniti Minds Private Limited

## 1. Cloud Architecture Overview

The Kogniti Minds enterprise platform integrates Firebase services to provide a highly available, globally distributed, serverless cloud backend for commercial operations.

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
│   Firebase Auth       Cloud Firestore            Firebase Storage      │
│   - Email/Password    - Products (Catalog)       - B2B KYC Docs (Priv) │
│   - Google OAuth      - Orders (B2C & B2B)       - Certificates (Pub)  │
│   - Token Claims      - RFQs (Quotations)        - Review Photos/Videos│
│   - Session State     - Reviews & Moderation     - Success Stories     │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Service Separation & Responsibilities

### 2.1 Firebase Authentication
- **User Identity:** Manages authenticated session tokens (JWT) for B2C users, B2B company representatives, and Administrators.
- **Custom Claims:** Injects user roles (`super_admin`, `admin`, `b2b`, `b2c`) into the auth token to enforce sub-millisecond client-side routing and Firestore Security Rules.
- **Google OAuth Provider:** Frictionless single-sign-on (SSO) popup for verified email addresses.

### 2.2 Cloud Firestore
- **Multi-region Document Store:** High-throughput NoSQL database with automated multi-zone replication.
- **Real-time Subscriptions:** Provides real-time event updates via `onSnapshot` when Super Admin approves reviews, changes pricing, updates stock, or verifies B2B KYC documents.
- **Atomic Operations:** Batch writes and transactions for inventory deductions upon order confirmation.

### 2.3 Firebase Storage
- **Object Storage Bucket:** `kognitiminds-ondc.firebasestorage.app`.
- **Security Boundaries:** Sensitive KYC attachments (GST, MSME, MOA, AOA, COI) are isolated in `/b2b_documents/{businessId}/` with read rules restricted to the verified account and Super Admin.

### 2.4 Server & Backend API Synchronization
- Node.js Express server (`server.js`) and Hostinger PHP endpoints work in harmony with Firestore using direct client-side reads/writes backed by strict security rules.
- Retains local atomic JSON persistence as a zero-latency failover cache.

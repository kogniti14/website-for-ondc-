# 06 - Firebase Storage Architecture & File Migration
# Kogniti Minds Private Limited

## 1. Storage Architecture Overview
All file assets, media, certificates, and confidential corporate compliance documents are hosted under Google Cloud Storage via Firebase Storage:
- **Bucket Identifier:** `kognitiminds-ondc.firebasestorage.app`
- **Location:** `asia-south1` (Mumbai) for ultra-low latency access across India.
- **CDN Integration:** Integrated with Firebase/Google Cloud CDN for caching public assets.

---

## 2. Directory Hierarchy & Access Classification

```
kognitiminds-ondc.firebasestorage.app
├── products/                     # [PUBLIC] Product catalog photography & spec sheets
│   └── {productId}_{filename}
├── categories/                   # [PUBLIC] Category banner icons & thumbnails
├── certificates/                 # [PUBLIC] Government recognitions & compliance certs (COI, MSME, ISO)
│   └── {certId}_{filename}
├── gallery/                      # [PUBLIC] Corporate event photographs, facility tours
├── stories/                      # [PUBLIC] Client case studies and success story media
├── reviews/                      # [PUBLIC READ ONLY AFTER MODERATION]
│   └── {productId}/
│       ├── images/{reviewId}_{filename}
│       └── videos/{reviewId}_{filename}
└── b2b_documents/                # [CONFIDENTIAL / RESTRICTED ACCESS]
    └── {businessId}/
        ├── gst_certificate.pdf
        ├── udyam_msme.pdf
        ├── moa.pdf
        ├── aoa.pdf
        └── coi.pdf
```

---

## 3. Storage Security Rules Enforcement

Security is enforced at the bucket level using `storage.rules`:
1. **Public Read Assets (`products/`, `categories/`, `certificates/`, `gallery/`, `stories/`)**:
   - Anyone (including unauthenticated visitors) can read/download.
   - Only authenticated users with `admin` or `super_admin` role can upload, overwrite, or delete.
2. **Review Uploads (`reviews/{productId}/...`)**:
   - Authenticated customers who purchased the product can upload images (<= 10MB) and videos (<= 50MB).
   - Only administrators can delete or modify review media.
3. **Confidential B2B KYC Documents (`b2b_documents/{businessId}/...`)**:
   - **Strict Privacy:** Public access is strictly forbidden (`allow read: false` for unauthenticated/unrelated callers).
   - Can only be read by:
     - The business owner whose UID / BusinessID matches the storage folder.
     - Authenticated Super Admin or Compliance Reviewer.
   - Upload permitted during B2B onboarding registration.
   - Max file size: 25MB per document. Formats allowed: PDF, JPEG, PNG.

---

## 4. Migration Strategy for Local & External Media
1. **Source Discovery**:
   - Scan all local uploads in `public/uploads/` and Hostinger storage.
   - Inspect media URLs stored in `data/storage/products.json`, `certificates.json`, `stories.json`, etc.
2. **Firebase Upload Script**:
   - Upload files to their respective target paths in `kognitiminds-ondc.firebasestorage.app`.
   - Retrieve public download URLs using `getDownloadURL()`.
   - Update document references in Cloud Firestore.
3. **Preservation of Existing URLs**:
   - Existing local URLs (`/uploads/...`) remain functional via Hostinger LiteSpeed Web Server, ensuring zero broken links during the transition.

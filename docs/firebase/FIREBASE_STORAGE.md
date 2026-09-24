# Firebase Storage Architecture & Document Security
# Kogniti Minds Private Limited

**Bucket Identifier:** `kognitiminds-ondc.firebasestorage.app`  

---

## 1. Directory Structure

```
kognitiminds-ondc.firebasestorage.app
├── products/               # [PUBLIC] Product photography & spec sheets
├── categories/             # [PUBLIC] Taxonomy icons & banners
├── certificates/           # [PUBLIC] Government recognitions (ISO, MSME, GeM)
├── gallery/                # [PUBLIC] Event photos & factory tour media
├── stories/                # [PUBLIC] Case study photography
├── reviews/                # [PUBLIC READ] Customer photo & video reviews (max 25MB)
└── b2b_documents/          # [CONFIDENTIAL] KYC documents (GST, MSME, MOA, AOA, COI)
    └── {businessId}/
```

---

## 2. Storage Security Rules
Enforced via `storage.rules`:
- B2B KYC documents in `/b2b_documents/{businessId}/` can **only** be accessed by the verified applicant business owner and Super Admin.
- File size restrictions: max 25MB for review videos and PDF documents, max 15MB for product photography.

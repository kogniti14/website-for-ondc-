# Cloud Firestore Design & Optimization Guide
# Kogniti Minds Private Limited

## 1. Document Architecture & Scalability

Cloud Firestore is configured as the primary NoSQL document database.

### Core Collections Structure
```
firestore/
├── products/                    # Tree-free agro paper & eco-stationery
├── categories/                  # Catalog categories
├── b2c_users/                   # B2C shoppers & delivery addresses
├── b2b_businesses/              # Corporate businesses & KYC records
├── b2c_orders/                  # Retail customer orders
├── b2b_orders/                  # Wholesale orders & payment records
├── b2b_quotations/              # RFQs & formal counter-revisions
├── admin_users/                 # Governance & staff accounts
├── certifications/              # ISO & MSME company certificates
├── certification_categories/   # Certificate classifications
├── stories/                     # Circular economy & farmer impact stories
├── gallery_categories/          # Story categories
├── testimonials/                # Client Trust testimonials
├── reviews/                     # Verified customer reviews
├── review_audit_logs/           # Super Admin review moderation logs
├── policies/                    # Statutory legal policies
├── policy_records/              # Legal policy revision history
├── coupons/                     # Active discount coupons
└── settings/                    # Global system & site media documents
    ├── global_settings
    ├── site_media
    └── policy_versions
```

## 2. Query Optimization & Cost Control

1. **Avoid Full Table Scans:** Public catalog browsing queries only `status == 'published'` and limits query sizes via pagination.
2. **Denormalized Review Stats:** `products/{id}` stores denormalized `rating` and `reviewCount` updated atomically when Super Admin approves reviews.
3. **Inventory Deductions:** Uses Firestore atomic transactions:
   ```typescript
   await runTransaction(db, async (transaction) => {
     const productDoc = await transaction.get(productRef);
     const currentStock = productDoc.data().stock;
     transaction.update(productRef, {
       stock: Math.max(0, currentStock - orderedQuantity)
     });
   });
   ```

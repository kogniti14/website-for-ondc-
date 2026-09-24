# KOGNITI MINDS PRIVATE LIMITED
# Database Mapping Specification: Supabase → Firebase (Cloud Firestore & Storage)

**Document Version:** 1.0.0 (Production Blueprint)  
**Date:** 2026-09-25T00:35:00+05:30  
**Target Project:** `kognitiminds-ondc` (Google Cloud Firebase)  
**Author:** Senior Firebase Architect & Database Migration Engineer  

---

## 1. Architectural Philosophy

Supabase is a relational database built on PostgreSQL with SQL schemas, foreign key constraints, and Row Level Security (RLS) policies.

**Cloud Firestore** is a highly scalable, distributed NoSQL document database designed for sub-100ms global read latencies, atomic document operations, real-time listeners, and granular security rules.

To execute a flawless migration:
1. **Preserve Relational Integrity:** Maintain foreign key references (`userId`, `productId`, `orderId`, `businessId`) as string ID attributes within documents.
2. **Denormalize Selectively for Performance:** Maintain computed metrics (such as `rating`, `reviewCount`, `orderTotal`, and item summaries) within parent documents to avoid high-latency multi-collection joins.
3. **Preserve Identity & Timestamps:** Convert ISO 8601 strings and SQL timestamps into Firestore `Timestamp` objects (or normalized ISO strings with `FieldValue.serverTimestamp()`).
4. **Subcollections vs. Root Collections:** Store top-level business entities in dedicated root collections for global queryability, indexing, and sorting.

---

## 2. Global Entity & Collection Mapping Overview

| Supabase / SQL Table | Firestore Target Path | Primary Key / Document ID | Access Level | Description |
|---|---|---|---|---|
| `products` | `products/{productId}` | `id` (e.g. `km-agri-a4-75`) | Public Read, Admin Write | Catalog products, pricing slabs, stock |
| `categories` | `categories/{categoryId}` | `id` (e.g. `cat_paper`) | Public Read, Admin Write | Catalog product categories |
| `users` / `b2c_users` | `b2c_users/{userId}` | `id` / `firebaseUid` | Customer Owner & Admin | Retail consumer profiles, addresses |
| `b2b_businesses` | `b2b_businesses/{businessId}` | `id` (e.g. `biz_edutech`) | Business Owner & Admin | Corporate accounts, GSTIN, PAN, KYC docs |
| `b2c_orders` | `b2c_orders/{orderId}` | `id` (e.g. `b2c_ord_101`) | Customer Owner & Admin | B2C retail orders, Razorpay txns |
| `b2b_orders` | `b2b_orders/{orderId}` | `id` (e.g. `b2b_ord_01`) | Business Owner & Admin | B2B wholesale orders, terms, ledger |
| `b2b_quotations` | `b2b_quotations/{quotationId}` | `id` (e.g. `rfq_301`) | Business Owner & Admin | Institutional RFQs, counter-revisions |
| `admin_users` | `admin_users/{adminId}` | `id` (e.g. `adm_super_01`) | Admin & Super Admin | Admin credentials, roles, permissions |
| `coupons` | `coupons/{couponId}` | `id` / `code` | Public Read (Active), Admin Write | Discount coupons, limits |
| `certifications` | `certifications/{certId}` | `id` (e.g. `cert_msme_01`) | Public Read (Published), Admin Write | Statutory company certifications |
| `certification_categories`| `certification_categories/{id}` | `id` (e.g. `cat_msme`) | Public Read, Admin Write | Certificate category classifications |
| `stories` | `stories/{storyId}` | `id` (e.g. `story_01`) | Public Read (Published), Admin Write | Success stories, farmer impact cases |
| `gallery_categories` | `gallery_categories/{id}` | `id` (e.g. `cat_success`) | Public Read, Admin Write | Image gallery categories |
| `testimonials` | `testimonials/{testimonialId}` | `id` (e.g. `test_01`) | Public Read (Published), Admin Write | Client Trust testimonial cards |
| `reviews` | `reviews/{reviewId}` | `id` (e.g. `rev_seed_001`)| Public Read (Approved), Admin All | Verified customer product reviews |
| `review_audit_logs` | `review_audit_logs/{logId}` | `id` (e.g. `log_001`) | Super Admin Only | Review moderation audit trail |
| `policies` | `policies/{policyId}` | `id` (`terms`, `privacy`...) | Public Read, Admin Write | Statutory legal policies |
| `policy_records` | `policy_records/{recordId}` | `id` (e.g. `pol_rec_01`) | Admin Only | Policy revision history & email logs |
| `policy_versions` | `settings/policy_versions` | Fixed Doc: `policy_versions` | Public Read, Admin Write | Active policy version numbers |
| `site_media` | `settings/site_media` | Fixed Doc: `site_media` | Public Read, Admin Write | Banners, logos, branding assets |
| `settings` | `settings/global_settings` | Fixed Doc: `global_settings` | Public Read, Admin Write | Store configuration, tax, contact info |
| `reset_otps` | `ephemeral_otps/{otpId}` | `id` (hash / uuid) | Server / Secure Admin | One-time password tokens |
| `ondc_orders` | `ondc_orders/{transactionId}` | `transactionId` | Server / ONDC Daemon | ONDC network B2B orders |

---

## 3. Detailed Table-to-Collection Mappings

### 3.1 `products` → `products/{productId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | Product SKU / ID (e.g. `km-agri-a4-75`) |
| `name` | `VARCHAR(255)` | `string` | No | Full commercial product name |
| `tagline` | `VARCHAR(255)` | `string` | Yes | Sustainability marketing badge |
| `sku` | `VARCHAR(50)` | `string` | No | Unique Stock Keeping Unit |
| `hsn` | `VARCHAR(20)` | `string` | No | Indian HSN Code (e.g. `48025610`) |
| `category` | `VARCHAR(100)` | `string` | No | Category name / reference |
| `categoryId` | `VARCHAR(50)` | `string` | Yes | Reference to `categories/{id}` |
| `b2cMrp` | `NUMERIC(10,2)` | `number` | No | Maximum Retail Price |
| `b2cPrice` | `NUMERIC(10,2)` | `number` | No | Retail selling price |
| `b2bWholesalePrice`| `NUMERIC(10,2)` | `number` | No | Base wholesale price |
| `b2bMoq` | `INTEGER` | `number` | No | Minimum Order Quantity |
| `b2bDiscountSlabs` | `JSONB` | `array<map>` | No | Volume pricing discount tiers |
| `gstRate` | `INTEGER` | `number` | No | Standard GST percentage (18%) |
| `stock` | `INTEGER` | `number` | No | Internal inventory quantity (Admin only) |
| `stockStatus` | `VARCHAR(30)` | `string` | No | `in_stock`, `limited_stock`, `out_of_stock` |
| `stockStatusMode` | `VARCHAR(20)` | `string` | No | `manual` or `automatic` |
| `rating` | `NUMERIC(2,1)` | `number` | No | Computed average rating (approved reviews) |
| `reviewCount` | `INTEGER` | `number` | No | Count of approved customer reviews |
| `isFeatured` | `BOOLEAN` | `boolean` | No | Homepage featured placement flag |
| `isBestSeller` | `BOOLEAN` | `boolean` | No | Top seller catalog flag |
| `isNewArrival` | `BOOLEAN` | `boolean` | No | Newly launched innovation flag |
| `images` | `TEXT[]` | `array<string>` | No | URLs of product photos in Storage |
| `shortDescription`| `TEXT` | `string` | No | Brief marketing teaser |
| `description` | `TEXT` | `string` | No | Comprehensive product specifications |
| `specifications` | `JSONB` | `map<string, string>` | No | Key-value technical spec table |
| `features` | `TEXT[]` | `array<string>` | No | Bulleted key product features |
| `dimensions` | `VARCHAR(100)` | `string` | Yes | Pack dimensions |
| `weight` | `VARCHAR(50)` | `string` | Yes | Gross weight |
| `warranty` | `VARCHAR(100)` | `string` | Yes | Warranty / guarantee term |
| `leadTimeDays` | `INTEGER` | `number` | No | Fulfillment lead time in days |
| `createdAt` | `TIMESTAMPTZ` | `string` / `Timestamp` | No | Record creation timestamp |
| `updatedAt` | `TIMESTAMPTZ` | `string` / `Timestamp` | No | Record modification timestamp |

---

### 3.2 `b2c_users` → `b2c_users/{userId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | User ID (e.g. `b2c_usr_902` or Firebase UID) |
| `firebaseUid` | `VARCHAR(128)` | `string` | Yes | Foreign key to Firebase Auth UID |
| `name` | `VARCHAR(150)` | `string` | No | Customer full legal name |
| `email` | `VARCHAR(150) UNIQUE` | `string` | No | Verified customer email address |
| `phone` | `VARCHAR(20)` | `string` | Yes | Customer mobile contact number |
| `avatarUrl` | `VARCHAR(500)` | `string` | Yes | Profile avatar URL in Storage |
| `authProvider` | `VARCHAR(30)` | `string` | No | `firebase_email`, `firebase_google`, `email_otp` |
| `addresses` | `JSONB` | `array<map>` | No | Embedded array of shipping/billing addresses |
| `policyAccepted` | `BOOLEAN` | `boolean` | No | Consent to active legal policies |
| `policyAcceptedAt`| `TIMESTAMPTZ` | `string` | Yes | Timestamp of policy agreement |
| `policyAcceptedVersion`| `VARCHAR(20)` | `string` | Yes | Version of policy agreed to |
| `createdAt` | `TIMESTAMPTZ` | `string` | No | Account registration date |

---

### 3.3 `b2b_businesses` → `b2b_businesses/{businessId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | Business ID (e.g. `biz_edutech`) |
| `firebaseUid` | `VARCHAR(128)` | `string` | Yes | Linked Firebase Auth UID |
| `companyName` | `VARCHAR(200)` | `string` | No | Trade / registered company name |
| `legalName` | `VARCHAR(200)` | `string` | Yes | Legal statutory entity name |
| `contactPerson` | `VARCHAR(150)` | `string` | No | Authorized company representative |
| `designation` | `VARCHAR(100)` | `string` | Yes | Officer designation |
| `businessEmail` | `VARCHAR(150)` | `string` | No | Enterprise domain email |
| `mobile` | `VARCHAR(20)` | `string` | No | Primary business contact number |
| `gstin` | `VARCHAR(15)` | `string` | No | 15-character statutory GSTIN |
| `pan` | `VARCHAR(10)` | `string` | No | 10-character Permanent Account Number |
| `udyamNumber` | `VARCHAR(30)` | `string` | Yes | MSME / Udyam registration ID |
| `cinNumber` | `VARCHAR(30)` | `string` | Yes | Corporate Identification Number |
| `entityType` | `VARCHAR(80)` | `string` | No | Private Limited, LLP, Sole Proprietor, etc. |
| `businessType` | `VARCHAR(80)` | `string` | No | Industry vertical (Education, Office, Reseller) |
| `status` | `VARCHAR(30)` | `string` | No | `pending`, `under_review`, `approved`, `rejected` |
| `verificationStatus`| `VARCHAR(30)` | `string` | No | KYC statutory verification state |
| `statusReason` | `TEXT` | `string` | Yes | Administrative review or rejection notes |
| `billingAddress` | `JSONB` | `map` | No | Registered corporate billing address |
| `shippingAddress`| `JSONB` | `map` | No | Default delivery warehouse address |
| `documents` | `JSONB` | `array<map>` | No | Statutory KYC document records |
| `kycDocuments` | `JSONB` | `map<string, map>` | Yes | Keyed map for GST, MSME, MOA, AOA, COI |
| `creditLimit` | `NUMERIC(12,2)` | `number` | No | Approved institutional credit limit (₹) |
| `paymentTerms` | `VARCHAR(30)` | `string` | No | `Prepaid`, `Net 15`, `Net 30` |
| `accountManager` | `JSONB` | `map` | No | Assigned Kogniti Minds relationship manager |
| `registeredAt` | `TIMESTAMPTZ` | `string` | No | Corporate onboarding timestamp |
| `approvedAt` | `TIMESTAMPTZ` | `string` | Yes | Verification approval timestamp |

---

### 3.4 `b2c_orders` → `b2c_orders/{orderId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | Order ID (e.g. `b2c_ord_101`) |
| `orderNumber` | `VARCHAR(50)` | `string` | No | Customer order number (e.g. `KM-B2C-51204`) |
| `customerName` | `VARCHAR(150)` | `string` | No | Customer full name |
| `customerEmail` | `VARCHAR(150)` | `string` | No | Customer email address |
| `customerPhone` | `VARCHAR(20)` | `string` | No | Contact phone number |
| `shippingAddress`| `JSONB` | `map` | No | Delivery address object |
| `billingAddress` | `JSONB` | `map` | No | Billing address object |
| `optionalGstin` | `VARCHAR(15)` | `string` | Yes | Customer GSTIN for B2C tax invoice |
| `items` | `JSONB` | `array<map>` | No | Line item array (`OrderItemSummary`) |
| `subtotal` | `NUMERIC(10,2)` | `number` | No | Order items subtotal before taxes |
| `discount` | `NUMERIC(10,2)` | `number` | No | Coupon or promo discount deduction |
| `gstAmount` | `NUMERIC(10,2)` | `number` | No | Calculated GST tax sum |
| `shippingFee` | `NUMERIC(10,2)` | `number` | No | Logistics shipping charge |
| `total` | `NUMERIC(10,2)` | `number` | No | Grand total settled (₹) |
| `paymentMethod` | `VARCHAR(30)` | `string` | No | `razorpay`, `upi`, `card`, `netbanking`, `cod` |
| `paymentStatus` | `VARCHAR(30)` | `string` | No | `paid`, `pending`, `failed` |
| `paymentDetails`| `JSONB` | `map` | Yes | Razorpay transaction ID and method |
| `orderStatus` | `VARCHAR(30)` | `string` | No | `placed`, `confirmed`, `shipped`, `delivered` |
| `trackingNumber`| `VARCHAR(60)` | `string` | Yes | Courier AWB tracking number |
| `courierPartner`| `VARCHAR(60)` | `string` | Yes | Delhivery, Blue Dart, Shiprocket, DTDC |
| `statusTimeline`| `JSONB` | `array<map>` | No | Chronological fulfillment milestone history |
| `createdAt` | `TIMESTAMPTZ` | `string` | No | Order placement timestamp |

---

### 3.5 `b2b_orders` → `b2b_orders/{orderId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | B2B Order ID (e.g. `b2b_ord_01`) |
| `orderNumber` | `VARCHAR(50)` | `string` | No | Enterprise order number (e.g. `KM-B2B-89421`) |
| `poNumber` | `VARCHAR(60)` | `string` | Yes | Buyer Purchase Order number |
| `businessId` | `VARCHAR(50)` | `string` | No | Reference to `b2b_businesses/{id}` |
| `businessName` | `VARCHAR(200)` | `string` | No | Corporate company name |
| `gstin` | `VARCHAR(15)` | `string` | No | Enterprise GSTIN for B2B tax credit |
| `shippingAddress`| `JSONB` | `map` | No | Corporate shipping destination |
| `billingAddress` | `JSONB` | `map` | No | Statutory billing address |
| `items` | `JSONB` | `array<map>` | No | B2B wholesale line items (`B2BOrderItemSummary`) |
| `subtotal` | `NUMERIC(12,2)` | `number` | No | Gross wholesale value |
| `bulkDiscountTotal`| `NUMERIC(12,2)`| `number` | No | Tier discount deduction |
| `taxableAmount` | `NUMERIC(12,2)` | `number` | No | Net taxable base value |
| `cgst` | `NUMERIC(10,2)` | `number` | No | Central GST (9% intra-state) |
| `sgst` | `NUMERIC(10,2)` | `number` | No | State GST (9% intra-state) |
| `igst` | `NUMERIC(10,2)` | `number` | No | Integrated GST (18% inter-state) |
| `totalGst` | `NUMERIC(12,2)` | `number` | No | Total statutory GST |
| `grandTotal` | `NUMERIC(12,2)` | `number` | No | Net enterprise payable amount |
| `paymentTerms` | `VARCHAR(30)` | `string` | No | Agreed credit term |
| `paymentStatus` | `VARCHAR(30)` | `string` | No | `paid`, `partially_paid`, `payment_due` |
| `orderStatus` | `VARCHAR(30)` | `string` | No | `placed`, `confirmed`, `packed`, `shipped`, `delivered` |
| `trackingNumber`| `VARCHAR(60)` | `string` | Yes | Freight carrier consignment number |
| `courierPartner`| `VARCHAR(60)` | `string` | Yes | Logistics partner name |
| `createdAt` | `TIMESTAMPTZ` | `string` | No | Order booking date |

---

### 3.6 `admin_users` → `admin_users/{adminId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | Admin ID (e.g. `adm_super_01`) |
| `userId` | `VARCHAR(50) UNIQUE` | `string` | No | Admin login username (`kogniti14`) |
| `name` | `VARCHAR(150)` | `string` | No | Admin official name (Shaurya Kashyap) |
| `email` | `VARCHAR(150) UNIQUE` | `string` | No | Admin email (`kogniti14@kognitiminds.com`) |
| `password` | `VARCHAR(255)` | `string` | Yes | Hashed/secure credential |
| `firebaseUid` | `VARCHAR(128)` | `string` | Yes | Linked Firebase Cloud Auth UID |
| `role` | `VARCHAR(40)` | `string` | No | `super_admin`, `operations_admin`, `catalog_manager` |
| `department` | `VARCHAR(100)` | `string` | No | Founder & CEO, Operations, etc. |
| `status` | `VARCHAR(30)` | `string` | No | `approved`, `pending`, `rejected` |
| `registeredAt` | `TIMESTAMPTZ` | `string` | No | Registration timestamp |
| `approvedAt` | `TIMESTAMPTZ` | `string` | Yes | Super Admin authorization date |

---

### 3.7 `certifications` → `certifications/{certId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | Certificate ID (e.g. `cert_msme_01`) |
| `name` | `VARCHAR(255)` | `string` | No | Title of certificate |
| `slug` | `VARCHAR(255)` | `string` | No | SEO URL slug |
| `shortDescription`| `TEXT` | `string` | No | Summary |
| `category` | `VARCHAR(100)` | `string` | No | Statutory category (e.g. `MSME / Udyam`) |
| `issuingAuthority`| `VARCHAR(200)`| `string` | No | Ministry / Audit Bureau |
| `certificateNumber`| `VARCHAR(100)`| `string` | Yes | Registration number |
| `issueDate` | `DATE` | `string` (YYYY-MM-DD) | No | Issuance date |
| `expiryDate` | `DATE` | `string` (YYYY-MM-DD) | Yes | Expiration date or null |
| `noExpiry` | `BOOLEAN` | `boolean` | No | Perpetual validity flag |
| `fileUrl` | `VARCHAR(500)` | `string` | No | Firebase Storage public download URL |
| `storagePath` | `VARCHAR(300)` | `string` | Yes | Firebase Storage relative bucket path |
| `fileType` | `VARCHAR(50)` | `string` | No | MIME type (`application/pdf`, image) |
| `visibility` | `VARCHAR(20)` | `string` | No | `both`, `b2b`, `b2c` |
| `status` | `VARCHAR(20)` | `string` | No | `published`, `draft`, `unpublished` |
| `allowDownload` | `BOOLEAN` | `boolean` | No | Public download permitted flag |
| `createdAt` | `TIMESTAMPTZ` | `string` | No | Creation date |

---

### 3.8 `reviews` → `reviews/{reviewId}`

| Field | Source Type | Target Firestore Type | Nullable | Description / Transformation |
|---|---|---|---|---|
| `id` | `VARCHAR PRIMARY KEY` | `string` (Document ID) | No | Review ID (e.g. `rev_seed_001`) |
| `productId` | `VARCHAR(50)` | `string` | No | Reference to `products/{id}` |
| `productName` | `VARCHAR(255)` | `string` | No | Denormalized product name |
| `productImage` | `VARCHAR(500)` | `string` | Yes | Denormalized product photo |
| `orderId` | `VARCHAR(50)` | `string` | No | Verified purchase order reference |
| `orderNumber` | `VARCHAR(50)` | `string` | No | Customer visible order number |
| `customerType` | `VARCHAR(10)` | `string` | No | `b2c` or `b2b` |
| `customerId` | `VARCHAR(50)` | `string` | No | Customer ID / Business ID |
| `customerName` | `VARCHAR(150)` | `string` | No | Reviewer display name |
| `companyName` | `VARCHAR(200)` | `string` | Yes | B2B enterprise corporate name |
| `rating` | `INTEGER` | `number` | No | 1 to 5 star rating |
| `title` | `VARCHAR(200)` | `string` | Yes | Review headline |
| `text` | `TEXT` | `string` | No | Review narrative |
| `media` | `JSONB` | `array<map>` | No | Uploaded photos/videos (`ReviewMedia`) |
| `status` | `VARCHAR(20)` | `string` | No | `approved`, `pending`, `rejected` (internal) |
| `isVerifiedPurchase`| `BOOLEAN`| `boolean` | No | Verified completed purchase badge |
| `createdAt` | `TIMESTAMPTZ` | `string` | No | Submission date |
| `moderatedAt` | `TIMESTAMPTZ` | `string` | Yes | Super Admin moderation timestamp |
| `moderatedBy` | `VARCHAR(100)` | `string` | Yes | Super Admin name |

---

## 4. Firebase Storage Bucket Structure

The Firebase Storage bucket `kognitiminds-ondc.firebasestorage.app` will be organized into isolated directories:

```
kognitiminds-ondc.firebasestorage.app/
├── b2b_documents/                   # SENSITIVE KYC (Admin & Account Owner ONLY)
│   └── {businessId}/
│       ├── gst_certificate_{ts}.pdf
│       ├── msme_certificate_{ts}.pdf
│       ├── moa_{ts}.pdf
│       ├── aoa_{ts}.pdf
│       └── coi_{ts}.pdf
├── certifications/                  # PUBLIC COMPANY CERTIFICATES
│   └── {certificationId}/
│       └── {slug}_{ts}.pdf
├── gallery/                         # PUBLIC SUCCESS STORIES & EXHIBITIONS
│   └── {storyId}/
│       └── {imageName}.webp
├── products/                        # PUBLIC PRODUCT CATALOG MEDIA
│   └── {productId}/
│       └── {imageName}.webp
├── reviews/                         # CUSTOMER REVIEW PHOTOS & VIDEOS
│   └── {reviewId}/
│       ├── {photoName}.jpg
│       └── {videoName}.mp4
└── site_media/                      # STORE LOGOS & BRANDING
    ├── logo.png
    ├── hero-banner.webp
    └── gem-ondc-logos.png
```

---

## 5. Firestore Indexes Required

Composite and single-field indexes needed in Cloud Firestore for high-performance querying:

1. **`products` collection:**
   - Single-field: `category` ASC
   - Composite: `isFeatured` DESC, `rating` DESC
   - Composite: `isBestSeller` DESC, `rating` DESC
   - Composite: `isNewArrival` DESC, `createdAt` DESC
2. **`reviews` collection:**
   - Composite: `productId` ASC, `status` ASC, `createdAt` DESC (For public product reviews query)
   - Composite: `productId` ASC, `status` ASC, `rating` DESC (For sorted product reviews)
   - Composite: `status` ASC, `createdAt` DESC (For Super Admin moderation table)
3. **`b2c_orders` collection:**
   - Composite: `customerEmail` ASC, `createdAt` DESC (For customer order history)
   - Composite: `orderStatus` ASC, `createdAt` DESC (For Admin order fulfillment)
4. **`b2b_orders` collection:**
   - Composite: `businessId` ASC, `createdAt` DESC (For enterprise order history)
   - Composite: `orderStatus` ASC, `createdAt` DESC (For Admin wholesale fulfillment)
5. **`b2b_quotations` collection:**
   - Composite: `businessId` ASC, `submittedAt` DESC (For business RFQ dashboard)
   - Composite: `status` ASC, `submittedAt` DESC (For Admin RFQ console)
6. **`certifications` collection:**
   - Composite: `status` ASC, `displayOrder` ASC
7. **`stories` collection:**
   - Composite: `status` ASC, `featured` DESC, `displayOrder` ASC

---

*End of Mapping Specification. Both `docs/FIREBASE_MIGRATION_AUDIT.md` and `docs/SUPABASE_TO_FIREBASE_MAPPING.md` are established.*

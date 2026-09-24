# KOGNITI MINDS PRIVATE LIMITED
# Database Schema & Entity Mapping Specification
## Supabase / SQL Tables → Firebase Realtime Database JSON Paths

**Target Project:** `kogniti-minds-website`  
**Primary Database Service:** Firebase Realtime Database  
**Author:** Senior Firebase Architect & Database Migration Engineer  

---

## 1. Top-Level Realtime Database Architecture Tree

```
/ (Root)
├── admin_users/
│   └── {adminId}/              # Super Admin and Admin personnel credentials & roles
├── products/
│   └── {productId}/            # Master product catalogue (B2C & B2B specs, pricing, stock)
├── categories/
│   └── {categoryId}/           # Product taxonomy, navigation slugs, display order
├── b2c_users/
│   └── {userId}/               # Retail customer profiles, addresses, preferences
├── b2b_businesses/
│   └── {businessId}/           # Verified corporate entities, GSTIN, credit terms, KYC status
├── b2c_orders/
│   └── {orderId}/              # Retail consumer orders, payment status, AWB tracking
├── b2b_orders/
│   └── {orderId}/              # Institutional wholesale purchase orders, GST tax invoices
├── b2b_quotations/
│   └── {rfqId}/                # B2B RFQ quotations, custom bulk pricing slabs
├── reviews/
│   └── {reviewId}/             # Customer reviews, star ratings, media attachments, moderation
├── review_audit_logs/
│   └── {auditId}/              # Administrative audit logs for review approvals/rejections
├── testimonials/
│   └── {testimonialId}/        # Verified client trust testimonials
├── certifications/
│   └── {certId}/               # Statutory certificates (MSME, ISO, GeM, Startup India)
├── certification_categories/
│   └── {catId}/                # 13 statutory certification classifications
├── stories/
│   └── {storyId}/              # Client success stories and corporate impact studies
├── settings/
│   └── global/                 # Global platform settings, maintenance flags, announcements
└── site_media/
    └── {mediaKey}/             # Hero banners, brand assets, logos
```

---

## 2. Detailed Entity Field Mappings

### 2.1 Products (`/products/{productId}`)
| Source Field | Realtime Database Path | Data Type | Description |
|---|---|---|---|
| `id` | `products/{id}/id` | string | Natural SKU identifier (e.g. `km-agri-a4-75`) |
| `name` | `products/{id}/name` | string | Commercial product name |
| `description` | `products/{id}/description` | string | Full technical and eco-friendly description |
| `category` | `products/{id}/category` | string | Foreign key referencing `/categories/{id}` |
| `b2cMrp` | `products/{id}/b2cMrp` | number | Maximum Retail Price for retail |
| `b2cPrice` | `products/{id}/b2cPrice` | number | Actual retail selling price |
| `b2bWholesalePrice`| `products/{id}/b2bWholesalePrice`| number | Base wholesale rate |
| `b2bMoq` | `products/{id}/b2bMoq` | number | Minimum order quantity for wholesale |
| `b2bDiscountSlabs` | `products/{id}/b2bDiscountSlabs`| array/object | Tiered volume discount slabs |
| `hsn` | `products/{id}/hsn` | string | Harmonized System of Nomenclature code |
| `gstRate` | `products/{id}/gstRate` | number | Statutory GST rate (e.g. 18) |
| `stock` | `products/{id}/stock` | number | Real-time live inventory count |
| `stockStatus` | `products/{id}/stockStatus` | string | `in_stock`, `limited_stock`, `out_of_stock` |
| `images` | `products/{id}/images` | array/object | URLs to high-resolution product photography |
| `specifications` | `products/{id}/specifications` | object | Paper weight, sheet size, brightness, texture |
| `createdAt` | `products/{id}/createdAt` | string | ISO-8601 creation timestamp |
| `updatedAt` | `products/{id}/updatedAt` | string | ISO-8601 modification timestamp |

### 2.2 Admin Users (`/admin_users/{adminId}`)
| Source Field | Realtime Database Path | Data Type | Description |
|---|---|---|---|
| `id` | `admin_users/{id}/id` | string | Fixed admin identifier (`adm_super_01`) |
| `userId` | `admin_users/{id}/userId` | string | Unique login alias (`kogniti14`) |
| `name` | `admin_users/{id}/name` | string | Legal name (`Shaurya Kashyap`) |
| `email` | `admin_users/{id}/email` | string | Verified email (`kogniti14@kognitiminds.com`) |
| `role` | `admin_users/{id}/role` | string | `super_admin` or `admin` |
| `department` | `admin_users/{id}/department` | string | Organizational designation |
| `status` | `admin_users/{id}/status` | string | `approved`, `active` |
| `registeredAt` | `admin_users/{id}/registeredAt` | string | ISO-8601 timestamp |

### 2.3 Product Reviews (`/reviews/{reviewId}`)
| Source Field | Realtime Database Path | Data Type | Description |
|---|---|---|---|
| `id` | `reviews/{id}/id` | string | Natural review ID (`rev_seed_001`) |
| `productId` | `reviews/{id}/productId` | string | Foreign key referencing `/products/{id}` |
| `orderId` | `reviews/{id}/orderId` | string | Reference to verified customer purchase order |
| `customerType` | `reviews/{id}/customerType` | string | `b2c` or `b2b` |
| `customerId` | `reviews/{id}/customerId` | string | Customer UID or Business ID |
| `customerName` | `reviews/{id}/customerName` | string | Verified display name |
| `companyName` | `reviews/{id}/companyName` | string | Optional B2B corporate entity |
| `rating` | `reviews/{id}/rating` | number | 1 to 5 star rating |
| `title` | `reviews/{id}/title` | string | Review heading |
| `text` | `reviews/{id}/text` | string | Full customer review commentary |
| `media` | `reviews/{id}/media` | array/object | Photo and video attachments |
| `status` | `reviews/{id}/status` | string | `pending`, `approved`, `rejected` |
| `isVerifiedPurchase`| `reviews/{id}/isVerifiedPurchase`| boolean | Verified against actual order |
| `createdAt` | `reviews/{id}/createdAt` | string | ISO-8601 timestamp |
| `moderatedAt` | `reviews/{id}/moderatedAt` | string | ISO-8601 timestamp |
| `moderatedBy` | `reviews/{id}/moderatedBy` | string | Administrator identifier |

### 2.4 B2B Corporate Accounts (`/b2b_businesses/{businessId}`)
| Source Field | Realtime Database Path | Data Type | Description |
|---|---|---|---|
| `id` | `b2b_businesses/{id}/id` | string | Business entity ID |
| `companyName` | `b2b_businesses/{id}/companyName`| string | Registered commercial entity name |
| `gstin` | `b2b_businesses/{id}/gstin` | string | 15-character GSTIN |
| `pan` | `b2b_businesses/{id}/pan` | string | 10-character Permanent Account Number |
| `status` | `b2b_businesses/{id}/status` | string | `pending`, `approved`, `rejected` |
| `documents` | `b2b_businesses/{id}/documents` | object | References to GST, MSME, MOA, AOA, COI in Storage |
| `creditLimit` | `b2b_businesses/{id}/creditLimit`| number | Approved institutional credit limit |
| `paymentTerms`| `b2b_businesses/{id}/paymentTerms`| string | `NET_30`, `ADVANCE`, `PDC` |

---

## 3. Realtime Database Indexing Plan (`.indexOn`)

Configured in `database.rules.json`:
- `products`: `.indexOn`: `["category", "stockStatus", "updatedAt"]`
- `reviews`: `.indexOn`: `["productId", "status", "customerId", "createdAt"]`
- `b2c_orders`: `.indexOn`: `["customerId", "orderStatus", "createdAt"]`
- `b2b_orders`: `.indexOn`: `["businessId", "orderStatus", "createdAt"]`
- `b2b_quotations`: `.indexOn`: `["businessId", "status", "createdAt"]`
- `admin_users`: `.indexOn`: `["userId", "email", "role"]`

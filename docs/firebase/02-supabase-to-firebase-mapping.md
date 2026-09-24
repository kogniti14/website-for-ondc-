# 02 - Supabase to Firebase Database Mapping
# Kogniti Minds Private Limited

## Reference
The complete and comprehensive column-to-field, entity-by-entity mapping specification is maintained at:
[`docs/SUPABASE_TO_FIREBASE_MAPPING.md`](../SUPABASE_TO_FIREBASE_MAPPING.md)

---

## Entity Mapping Summary

| Supabase / SQL Table | Firestore Collection | Document ID Strategy | Primary Relationships Preserved |
|---|---|---|---|
| `users` | `users/{userId}` | Firebase Auth UID | User profiles, cart, orders, wishlist |
| `admin_users` | `admin_users/{adminId}` | Admin Auth UID | Role (`super_admin`, `admin`, `moderator`), permissions |
| `products` | `products/{productId}` | Natural ID (`KM-PROD-...`) | Category ID, Reviews subcollection |
| `categories` | `categories/{categoryId}` | Natural ID / Slug | Parent category, product counts |
| `orders` | `orders/{orderId}` | Natural ID (`KM-ORD-...`) | Customer UID, Item IDs, Payment ID, Shipment ID |
| `b2b_applications` | `b2b_applications/{applicationId}` | Auto / Natural ID | Applicant UID, GST number, document references |
| `b2b_accounts` | `b2b_accounts/{b2bAccountId}` | Natural ID | User UID, Company name, credit limit, verified tier |
| `reviews` | `reviews/{reviewId}` | Natural ID (`KM-REV-...`) | Product ID, Customer UID, media URLs, moderation status |
| `certifications` | `certifications/{certId}` | Natural ID | Category, file URL, verification authority |
| `gallery` | `gallery/{imageId}` | Auto / Natural ID | Category, file URL, display order |
| `stories` | `stories/{storyId}` | Auto / Natural ID | Featured flag, cover image |
| `testimonials` | `testimonials/{id}` | Natural ID | Verified client flag, rating, avatar URL |
| `rfqs` | `rfqs/{rfqId}` | Natural ID (`KM-RFQ-...`) | B2B UID, Product IDs, quotation status |
| `settings` | `settings/{settingKey}` | Key string (`global`, `maintenance`) | Super Admin global system settings |
| `ondc_orders` | `ondc_orders/{transactionId}` | Beckn Transaction ID | Buyer App ID, BAP URI, item fulfillment |

For all data types, constraints, index requirements, and timestamp preservation rules, consult [`docs/SUPABASE_TO_FIREBASE_MAPPING.md`](../SUPABASE_TO_FIREBASE_MAPPING.md).

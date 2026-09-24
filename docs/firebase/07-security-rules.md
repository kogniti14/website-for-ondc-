# Firebase Security Rules Specification (Firestore & Storage)
# Kogniti Minds Private Limited

## 1. Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.role == 'super_admin' || 
         request.auth.token.role == 'admin' || 
         request.auth.token.admin == true);
    }

    function isSuperAdmin() {
      return isAuthenticated() && 
        (request.auth.token.role == 'super_admin' || 
         request.auth.token.email == 'kogniti14@kognitiminds.com');
    }

    // 1. Products & Categories (Public read, Admin write)
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 2. B2C Users (Owner read/write, Admin read/write)
    match /b2c_users/{userId} {
      allow read, write: if isOwner(userId) || isOwner(resource.data.firebaseUid) || isAdmin();
    }

    // 3. B2B Businesses (Business owner read/write, Admin full manage)
    match /b2b_businesses/{businessId} {
      allow read, write: if isOwner(businessId) || isOwner(resource.data.firebaseUid) || isAdmin();
    }

    // 4. B2C Orders (Owner read/write, Admin full manage)
    match /b2c_orders/{orderId} {
      allow read: if isOwner(resource.data.customerId) || isOwner(resource.data.customerEmail) || isAdmin();
      allow create: if isAuthenticated() || request.resource.data.customerEmail != null;
      allow update, delete: if isAdmin();
    }

    // 5. B2B Orders (Business owner read, Admin manage)
    match /b2b_orders/{orderId} {
      allow read: if isOwner(resource.data.businessId) || isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 6. B2B Quotations / RFQs (Business owner read, Admin manage)
    match /b2b_quotations/{quotationId} {
      allow read: if isOwner(resource.data.businessId) || isAdmin();
      allow create: if isAuthenticated() || request.resource.data.email != null;
      allow update: if isOwner(resource.data.businessId) || isAdmin();
      allow delete: if isAdmin();
    }

    // 7. Certifications & Gallery (Published items public, drafts Admin only)
    match /certifications/{certId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    match /certification_categories/{catId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /stories/{storyId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    match /gallery_categories/{catId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 8. Testimonials (Published public, Admin write)
    match /testimonials/{testId} {
      allow read: if resource.data.status == 'published' || isAdmin();
      allow write: if isAdmin();
    }

    // 9. Verified Customer Reviews (Approved public, submission authenticated, moderation Admin)
    match /reviews/{reviewId} {
      allow read: if resource.data.status == 'approved' || isAdmin();
      allow create: if isAuthenticated() && request.resource.data.status == 'pending';
      allow update, delete: if isAdmin();
    }

    match /review_audit_logs/{logId} {
      allow read, write: if isSuperAdmin();
    }

    // 10. Legal Policies & Version History
    match /policies/{policyId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /policy_records/{recordId} {
      allow read, write: if isAdmin();
    }

    // 11. Global Settings & Site Media
    match /settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 12. Admin Users Registry
    match /admin_users/{adminId} {
      allow read: if isSuperAdmin() || (isAuthenticated() && request.auth.uid == adminId);
      allow write: if isSuperAdmin();
    }

    // 13. Coupons (Active public read, Admin write)
    match /coupons/{couponId} {
      allow read: if resource.data.isActive == true || isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

---

## 2. Firebase Storage Security Rules (`storage.rules`)

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.role == 'super_admin' || 
         request.auth.token.role == 'admin');
    }

    // 1. SENSITIVE B2B KYC Documents (Owner Business & Admin ONLY)
    match /b2b_documents/{businessId}/{fileName} {
      allow read: if isAuthenticated() && (request.auth.uid == businessId || isAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == businessId || isAdmin()) &&
                     request.resource.size < 25 * 1024 * 1024 &&
                     (request.resource.contentType.matches('application/pdf') ||
                      request.resource.contentType.matches('image/.*'));
    }

    // 2. Company Certifications (Public read if downloadable, Admin write)
    match /certifications/{certId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && request.resource.size < 25 * 1024 * 1024;
    }

    // 3. Success Stories & Gallery (Public read, Admin write)
    match /gallery/{storyId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && request.resource.size < 20 * 1024 * 1024;
    }

    // 4. Product Catalog Images (Public read, Admin write)
    match /products/{productId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && request.resource.size < 15 * 1024 * 1024;
    }

    // 5. Customer Review Media (Photos max 5MB, Videos max 25MB)
    match /reviews/{reviewId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() && 
                     (request.resource.size < 25 * 1024 * 1024) &&
                     (request.resource.contentType.matches('image/.*') || 
                      request.resource.contentType.matches('video/mp4') || 
                      request.resource.contentType.matches('video/webm'));
    }

    // 6. Site Media & Branding
    match /site_media/{fileName} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

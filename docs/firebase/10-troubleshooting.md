# 10 - Troubleshooting & Operational Runbook
# Kogniti Minds Private Limited

## 1. Cloud Firestore Issues

### Issue 1: `FirebaseError: Missing or insufficient permissions`
- **Cause:** The requesting user's Auth token does not satisfy the conditions in `firestore.rules`.
- **Diagnostic:** Check the user's role claim using `firebase.auth().currentUser.getIdTokenResult()`.
- **Fix:**
  - Verify that the collection path matches the rules.
  - If accessing admin routes, ensure the user document in `admin_users/{uid}` has `role: 'super_admin'` or `role: 'admin'`.
  - For customer orders, verify `request.auth.uid == resource.data.customerId`.

### Issue 2: `FirebaseError: The query requires an index`
- **Cause:** Compound query (e.g. `where('status', '==', 'approved').orderBy('createdAt', 'desc')`) requires a composite index.
- **Fix:**
  - Click the direct Firebase Console link provided in the browser console error message to generate the composite index with a single click.
  - Or define it in `firestore.indexes.json` and deploy via `firebase deploy --only firestore:indexes`.

---

## 2. Firebase Authentication Issues

### Issue 1: Custom Claims Not Reflecting on Client
- **Cause:** Firebase Auth tokens are cached for up to 1 hour on the client.
- **Fix:** Force refresh the ID token:
  ```typescript
  await auth.currentUser?.getIdToken(true);
  ```

### Issue 2: Google Sign-In Popup Blocked on Safari / Mobile
- **Cause:** iOS Safari popup blockers block `signInWithPopup`.
- **Fix:** Fallback gracefully to `signInWithRedirect` when running on WebKit mobile browsers, or ensure the sign-in trigger is directly inside a user tap event listener.

---

## 3. Firebase Storage Issues

### Issue 1: CORS Policy Error During Direct Browser Upload
- **Cause:** Google Cloud Storage bucket requires CORS headers configured for `kognitiminds.com`.
- **Fix:** Apply CORS configuration using `gsutil` or Google Cloud Shell:
  ```json
  [
    {
      "origin": ["https://kognitiminds.com", "http://localhost:5173"],
      "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "responseHeader": ["*"],
      "maxAgeSeconds": 3600
    }
  ]
  ```
  Run: `gsutil cors set cors.json gs://kognitiminds-ondc.firebasestorage.app`

### Issue 2: Upload Rejected Due to File Size
- **Cause:** `storage.rules` restricts review media to <= 50MB and B2B documents to <= 25MB.
- **Fix:** Client-side validation in `ReviewModal.tsx` and B2B registration form checks file size before attempting upload.

---

## 4. Hostinger / Node Server Daemon Issues

### Issue 1: Port 3000 Address In Use
- **Cause:** Zombie Node.js process holding port 3000.
- **Fix:**
  ```bash
  lsof -ti:3000 | xargs kill -9
  node server.js &
  ```

### Issue 2: PHP Data Endpoint 403 Forbidden
- **Cause:** Hostinger permissions on `public/api/data.php` or `data/storage/`.
- **Fix:** Ensure directory permissions are set to `755` and files to `644`.

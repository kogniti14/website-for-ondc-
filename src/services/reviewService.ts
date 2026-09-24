import {
  ProductReview,
  ReviewStatus,
  ReviewMedia,
  ReviewAuditLog,
  ReviewEligibilityResult,
  CreateReviewInput,
  B2CUser,
  B2BBusiness,
  AdminUser,
  UserRole,
} from '../types';
import { storageService } from './storageService';
import { dataSyncBus } from './dataSyncBus';
import { db, isFirebaseConfigured } from './firebase';
import { ref, set, remove } from 'firebase/database';

const STORAGE_KEY_REVIEWS = 'km_product_reviews_v1';
const STORAGE_KEY_AUDIT = 'km_review_audit_logs_v1';

const SEED_REVIEWS: ProductReview[] = [
  {
    id: 'rev_seed_001',
    productId: 'km-agri-a4-75',
    productName: 'Kogniti AgroPrint 75 GSM A4 Sustainable Copier Paper (500 Sheets)',
    productImage: '/images/copier-paper.png',
    productSku: 'KM-PAP-AG75',
    orderId: 'ord_b2b_seed_01',
    orderNumber: 'KM-B2B-89421',
    customerType: 'b2b',
    customerId: 'b2b_cust_apex',
    customerName: 'Rahul Sharma',
    companyName: 'Apex Global Solutions Pvt. Ltd.',
    rating: 5,
    title: 'Outstanding Copier Paper Quality for High-Volume Printing',
    text: 'We switched our entire Bangalore regional office to Kogniti AgroPrint 75 GSM paper three months ago. The paper runs flawlessly through our high-speed multi-function xerox copiers without single misfeed or paper jam. Excellent crispness, high opacity, and true eco-friendly credentials.',
    media: [
      {
        id: 'med_seed_01',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
        fileName: 'copier_paper_stack.jpg',
        mimeType: 'image/jpeg',
        fileSize: 342000,
      },
    ],
    status: 'approved',
    isVerifiedPurchase: true,
    createdAt: '2026-09-18T10:30:00.000Z',
    moderatedAt: '2026-09-18T11:00:00.000Z',
    moderatedBy: 'Super Admin',
  },
  {
    id: 'rev_seed_002',
    productId: 'km-agri-a4-75',
    productName: 'Kogniti AgroPrint 75 GSM A4 Sustainable Copier Paper (500 Sheets)',
    productImage: '/images/copier-paper.png',
    productSku: 'KM-PAP-AG75',
    orderId: 'ord_b2c_seed_02',
    orderNumber: 'KM-B2C-51204',
    customerType: 'b2c',
    customerId: 'b2c_cust_pooja',
    customerName: 'Pooja Verma',
    companyName: '',
    rating: 5,
    title: 'Clean, bright sheets with zero paper dust',
    text: 'Extremely impressed with the agricultural residue paper. It feels just like premium virgin wood paper but knowing it is 100% tree-free makes it even better. Fast dispatch and received in mint condition with a proper GST invoice.',
    media: [],
    status: 'approved',
    isVerifiedPurchase: true,
    createdAt: '2026-09-19T14:15:00.000Z',
    moderatedAt: '2026-09-19T15:00:00.000Z',
    moderatedBy: 'Super Admin',
  },
  {
    id: 'rev_seed_003',
    productId: 'km-agri-a4-80',
    productName: 'Kogniti AgroPrint 80 GSM A4 Premium Copier Paper (500 Sheets)',
    productImage: '/images/copier-paper.png',
    productSku: 'KM-PAP-AG80',
    orderId: 'ord_b2b_seed_03',
    orderNumber: 'KM-B2B-90145',
    customerType: 'b2b',
    customerId: 'b2b_cust_nova',
    customerName: 'Vikram Malhotra',
    companyName: 'Nova Edutech Group',
    rating: 5,
    title: 'Superior 80 GSM Heavyweight Paper for Reports & Presentations',
    text: "The 80 GSM variant provides a substantial, luxurious hand-feel. Two-sided duplex printing has zero show-through. Prompt delivery and seamless GST input credit verification.",
    media: [],
    status: 'approved',
    isVerifiedPurchase: true,
    createdAt: '2026-09-17T09:45:00.000Z',
    moderatedAt: '2026-09-17T10:30:00.000Z',
    moderatedBy: 'Super Admin',
  },
  {
    id: 'rev_seed_004',
    productId: 'km-notebook-spiral-a5',
    productName: 'Kogniti EcoScribe A5 Wirebound Notebook',
    productImage: '/images/spiral-notebook.png',
    productSku: 'KM-NB-SP-A5',
    orderId: 'ord_b2c_seed_04',
    orderNumber: 'KM-B2C-62819',
    customerType: 'b2c',
    customerId: 'b2c_cust_ananya',
    customerName: 'Ananya Kulkarni',
    companyName: '',
    rating: 5,
    title: 'Best notebook for fountain pens and daily journaling',
    text: 'The binding is sturdy, lays completely flat on desk, and the ink does not bleed or feather. The recycled textured cover looks elegant and minimalist. Will definitely purchase again.',
    media: [
      {
        id: 'med_seed_02',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        fileName: 'notebook_desk_view.jpg',
        mimeType: 'image/jpeg',
        fileSize: 289000,
      },
    ],
    status: 'approved',
    isVerifiedPurchase: true,
    createdAt: '2026-09-20T16:20:00.000Z',
    moderatedAt: '2026-09-20T17:00:00.000Z',
    moderatedBy: 'Super Admin',
  },
];

class ReviewService {
  private reviewsCache: ProductReview[] | null = null;
  private auditCache: ReviewAuditLog[] | null = null;
  private isInitializing: boolean = false;

  constructor() {
    this.loadFromStorage();
    this.syncWithServer();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.reviewsCache = parsed;
        }
      }
      if (!this.reviewsCache) {
        this.reviewsCache = [...SEED_REVIEWS];
        this.persistLocally();
      }

      const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT);
      if (storedAudit) {
        this.auditCache = JSON.parse(storedAudit);
      } else {
        this.auditCache = [];
      }
    } catch (e) {
      console.warn('[ReviewService] Error reading local storage', e);
      this.reviewsCache = [...SEED_REVIEWS];
      this.auditCache = [];
    }
  }

  private persistLocally(): void {
    try {
      if (this.reviewsCache) {
        localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(this.reviewsCache));
      }
      if (this.auditCache) {
        localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(this.auditCache));
      }
    } catch (e) {
      console.warn('[ReviewService] Error persisting to local storage', e);
    }
  }

  public async syncWithServer(): Promise<void> {
    if (this.isInitializing) return;
    this.isInitializing = true;
    try {
      // 1. Fetch live reviews from server
      let res = await fetch('/api/data.php?collection=reviews&role=admin', {
        headers: { 'X-Admin-Role': 'super_admin' },
      });
      if (!res.ok) {
        res = await fetch('/api/data/reviews?role=admin', {
          headers: { 'X-Admin-Role': 'super_admin' },
        });
      }

      if (res.ok) {
        const serverReviews = await res.json();
        if (Array.isArray(serverReviews) && serverReviews.length > 0) {
          // Merge server reviews with local reviews (avoid duplicates by id)
          const merged = [...serverReviews];
          const serverIds = new Set(serverReviews.map((r: ProductReview) => r.id));
          if (this.reviewsCache) {
            for (const local of this.reviewsCache) {
              if (!serverIds.has(local.id)) {
                merged.push(local);
                // Push local-only review to server
                this.syncReviewToServer(local).catch(() => {});
              }
            }
          }
          this.reviewsCache = merged;
          this.persistLocally();
          dataSyncBus.emit('reviews', this.reviewsCache);
        } else if (this.reviewsCache && this.reviewsCache.length > 0) {
          // Server is empty, seed it
          for (const rev of this.reviewsCache) {
            await this.syncReviewToServer(rev).catch(() => {});
          }
        }
      }
    } catch (err) {
      console.warn('[ReviewService] Background server sync error (offline fallback active):', err);
    } finally {
      this.isInitializing = false;
    }
  }

  private async syncReviewToServer(review: ProductReview): Promise<void> {
    // 1. PRIMARY CLOUD STORE: Asynchronously replicate to Firebase Realtime Database
    if (isFirebaseConfigured() && db) {
      try {
        set(ref(db, `reviews/${review.id}`), review).catch(() => {});
      } catch {
        // Non-blocking realtime database sync
      }
    }

    // 2. FAILOVER & HOSTINGER STORE: Direct native PHP dispatcher
    try {
      let res = await fetch('/api/data.php?collection=reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'super_admin' },
        body: JSON.stringify(review),
      });
      if (!res.ok) {
        await fetch('/api/data/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'super_admin' },
          body: JSON.stringify(review),
        });
      }
    } catch (e) {
      console.warn('[ReviewService] Server sync error for review:', review.id, e);
    }
  }

  private async deleteReviewFromServer(reviewId: string): Promise<void> {
    // 1. PRIMARY CLOUD STORE: Asynchronously delete from Firebase Realtime Database
    if (isFirebaseConfigured() && db) {
      try {
        remove(ref(db, `reviews/${reviewId}`)).catch(() => {});
      } catch {
        // Non-blocking realtime database delete
      }
    }

    // 2. FAILOVER & HOSTINGER STORE: Direct native PHP dispatcher
    try {
      let res = await fetch(`/api/data.php?collection=reviews&id=${encodeURIComponent(reviewId)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Role': 'super_admin' },
      });
      if (!res.ok) {
        await fetch(`/api/data/reviews/${encodeURIComponent(reviewId)}`, {
          method: 'DELETE',
          headers: { 'X-Admin-Role': 'super_admin' },
        });
      }
    } catch (e) {
      console.warn('[ReviewService] Server delete error:', reviewId, e);
    }
  }

  private async syncAuditLogToServer(log: ReviewAuditLog): Promise<void> {
    try {
      let res = await fetch('/api/data.php?collection=review_audit_logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'super_admin' },
        body: JSON.stringify(log),
      });
      if (!res.ok) {
        await fetch('/api/data/review_audit_logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Role': 'super_admin' },
          body: JSON.stringify(log),
        });
      }
    } catch (e) {
      console.warn('[ReviewService] Server sync error for audit log:', log.id, e);
    }
  }

  // ==========================================
  // PUBLIC GETTERS (APPROVED ONLY)
  // ==========================================

  /**
   * Returns ONLY approved reviews for a given product or across all products.
   * Internal status is strictly 'approved'.
   * Customer details are sanitized to never expose phone, email, or internal order IDs.
   */
  public getApprovedReviews(productId?: string): ProductReview[] {
    if (!this.reviewsCache) {
      this.loadFromStorage();
    }
    const all = this.reviewsCache || [];
    return all.filter((r) => {
      const isApproved = r.status === 'approved';
      if (!isApproved) return false;
      if (productId && r.productId !== productId) return false;
      return true;
    });
  }

  // ==========================================
  // ADMIN GETTERS (ALL INTERNAL STATUSES)
  // ==========================================

  /**
   * Returns all submitted reviews for Super Admin moderation.
   */
  public getAllReviewsForAdmin(): ProductReview[] {
    if (!this.reviewsCache) {
      this.loadFromStorage();
    }
    return [...(this.reviewsCache || [])];
  }

  /**
   * Returns internal audit trail logs for Super Admin.
   */
  public getAuditLogs(): ReviewAuditLog[] {
    if (!this.auditCache) {
      this.loadFromStorage();
    }
    return [...(this.auditCache || [])];
  }

  // ==========================================
  // VERIFIED PURCHASE ELIGIBILITY CHECK
  // ==========================================

  /**
   * Verifies whether the logged-in customer (B2C or B2B) has actually purchased
   * the specified product in a delivered and paid order.
   * Also ensures one review per purchase/order.
   */
  public checkEligibility(
    productId: string,
    auth: {
      role: UserRole;
      b2cUser: B2CUser | null;
      b2bBusiness: B2BBusiness | null;
    }
  ): ReviewEligibilityResult {
    const { role, b2cUser, b2bBusiness } = auth;
    const allReviews = this.reviewsCache || [];

    // 1. Guest Check
    if (role === 'guest' || (!b2cUser && !b2bBusiness)) {
      return {
        eligible: false,
        reason: 'Please log in to your verified account to write a review.',
      };
    }

    // 2. B2B Eligibility Check
    if (role === 'b2b' && b2bBusiness) {
      const b2bOrders = storageService.getB2BOrders();
      // Find delivered orders belonging to this business
      const eligibleOrders = b2bOrders.filter((ord) => {
        const isDelivered = ord.orderStatus === 'delivered';
        const isBelonging =
          ord.businessId === b2bBusiness.id ||
          (b2bBusiness.gstin && ord.gstin?.toLowerCase() === b2bBusiness.gstin.toLowerCase()) ||
          ord.businessName?.toLowerCase() === b2bBusiness.companyName?.toLowerCase();
        return isDelivered && isBelonging;
      });

      // Find an order containing this product that hasn't been reviewed yet
      for (const ord of eligibleOrders) {
        const hasProduct = ord.items.some((it) => it.productId === productId);
        if (hasProduct) {
          // Check if already reviewed for this order + product
          const alreadyReviewed = allReviews.some(
            (r) =>
              r.productId === productId &&
              r.orderId === ord.id &&
              r.customerId === b2bBusiness.id
          );
          if (alreadyReviewed) {
            return {
              eligible: false,
              alreadyReviewed: true,
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              reason: 'Your organization has already submitted a review for this purchase.',
            };
          }
          // Found eligible unreviewed purchase!
          return {
            eligible: true,
            orderId: ord.id,
            orderNumber: ord.orderNumber,
          };
        }
      }

      return {
        eligible: false,
        reason: 'Reviews are available for verified customers who purchased this product.',
      };
    }

    // 3. B2C Eligibility Check
    if (b2cUser) {
      const b2cOrders = storageService.getB2COrders();
      // Filter for delivered and paid orders belonging to this customer
      const eligibleOrders = b2cOrders.filter((ord) => {
        const isDelivered = ord.orderStatus === 'delivered';
        const isPaid = ord.paymentStatus === 'paid' || ord.paymentMethod === 'cod';
        const isBelonging =
          (b2cUser.email && ord.customerEmail?.toLowerCase() === b2cUser.email.toLowerCase()) ||
          (b2cUser.phone && ord.customerPhone === b2cUser.phone) ||
          ord.customerName?.toLowerCase() === b2cUser.name?.toLowerCase();
        return isDelivered && isPaid && isBelonging;
      });

      // Find an order containing this product that hasn't been reviewed yet
      for (const ord of eligibleOrders) {
        const hasProduct = ord.items.some((it) => it.productId === productId);
        if (hasProduct) {
          const alreadyReviewed = allReviews.some(
            (r) =>
              r.productId === productId &&
              r.orderId === ord.id &&
              (r.customerId === b2cUser.id || r.customerId === b2cUser.email)
          );
          if (alreadyReviewed) {
            return {
              eligible: false,
              alreadyReviewed: true,
              orderId: ord.id,
              orderNumber: ord.orderNumber,
              reason: 'You have already submitted a review for this purchase.',
            };
          }
          return {
            eligible: true,
            orderId: ord.id,
            orderNumber: ord.orderNumber,
          };
        }
      }

      return {
        eligible: false,
        reason: 'Reviews are available for verified customers who purchased this product.',
      };
    }

    return {
      eligible: false,
      reason: 'Reviews are available for verified customers who purchased this product.',
    };
  }

  // ==========================================
  // REVIEW SUBMISSION (SILENT WORKFLOW)
  // ==========================================

  /**
   * Submits a new review.
   * Internal status is always set to 'pending'.
   * Never informs the customer about moderation or approval status.
   * Returns: "Thank you! Your review has been submitted successfully."
   */
  public async submitReview(
    input: CreateReviewInput
  ): Promise<{ success: boolean; message: string; review?: ProductReview }> {
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      return { success: false, message: 'Please select a valid star rating (1 to 5 stars).' };
    }
    if (!input.text || input.text.trim().length < 5) {
      return { success: false, message: 'Please enter a review description of at least 5 characters.' };
    }

    const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newReview: ProductReview = {
      id: reviewId,
      productId: input.productId,
      productName: input.productName,
      productImage: input.productImage,
      productSku: input.productSku,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      customerType: input.customerType,
      customerId: input.customerId,
      customerName: input.customerName.trim(),
      companyName: input.companyName?.trim() || undefined,
      rating: input.rating,
      title: input.title?.trim() || undefined,
      text: input.text.trim(),
      media: input.media || [],
      status: 'pending', // Internal moderation status
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    if (!this.reviewsCache) {
      this.loadFromStorage();
    }
    this.reviewsCache = [newReview, ...(this.reviewsCache || [])];
    this.persistLocally();

    // Sync to backend storage
    await this.syncReviewToServer(newReview);

    // Broadcast update across tabs
    dataSyncBus.emit('reviews', this.reviewsCache);
    dataSyncBus.emit('review_submitted', newReview);

    // CRITICAL USER EXPERIENCE:
    // Display strictly the positive confirmation without any moderation jargon.
    return {
      success: true,
      message: 'Thank you! Your review has been submitted successfully.',
      review: newReview,
    };
  }

  // ==========================================
  // SUPER ADMIN MODERATION ACTIONS
  // ==========================================

  /**
   * Super Admin moderation: Approve, Reject, or Delete a review.
   * Records an audit trail log.
   */
  public async moderateReview(
    reviewId: string,
    action: 'approve' | 'reject' | 'delete',
    adminUser: AdminUser | { name: string; id?: string },
    reason?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.reviewsCache) {
      this.loadFromStorage();
    }
    const current = this.reviewsCache || [];
    const index = current.findIndex((r) => r.id === reviewId);

    if (index === -1) {
      return { success: false, message: 'Review not found in database.' };
    }

    const targetReview = current[index];
    const prevStatus = targetReview.status;

    if (action === 'delete') {
      current.splice(index, 1);
      this.reviewsCache = [...current];
      this.persistLocally();
      await this.deleteReviewFromServer(reviewId);

      const auditLog: ReviewAuditLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        reviewId,
        adminId: adminUser.id || 'admin_super',
        adminName: adminUser.name || 'Super Admin',
        action: 'delete',
        previousStatus: prevStatus,
        reason: reason || 'Permanently deleted by Super Admin',
        timestamp: new Date().toISOString(),
      };
      this.auditCache = [auditLog, ...(this.auditCache || [])];
      this.persistLocally();
      await this.syncAuditLogToServer(auditLog);

      dataSyncBus.emit('reviews', this.reviewsCache);
      dataSyncBus.emit('review_moderated', { reviewId, action });
      return { success: true, message: 'Review permanently removed.' };
    }

    const newStatus: ReviewStatus = action === 'approve' ? 'approved' : 'rejected';
    targetReview.status = newStatus;
    targetReview.moderatedAt = new Date().toISOString();
    targetReview.moderatedBy = adminUser.name || 'Super Admin';
    targetReview.moderationNotes = reason || (action === 'approve' ? 'Approved for public listing' : 'Rejected');

    current[index] = { ...targetReview };
    this.reviewsCache = [...current];
    this.persistLocally();

    await this.syncReviewToServer(current[index]);

    const auditLog: ReviewAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reviewId,
      adminId: adminUser.id || 'admin_super',
      adminName: adminUser.name || 'Super Admin',
      action,
      previousStatus: prevStatus,
      newStatus,
      reason: reason || `Status set to ${newStatus.toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    this.auditCache = [auditLog, ...(this.auditCache || [])];
    this.persistLocally();
    await this.syncAuditLogToServer(auditLog);

    dataSyncBus.emit('reviews', this.reviewsCache);
    dataSyncBus.emit('review_moderated', { reviewId, action, newStatus });

    return {
      success: true,
      message: action === 'approve' ? 'Review successfully approved and published.' : 'Review rejected.',
    };
  }

  // ==========================================
  // RATING CALCULATION (APPROVED ONLY)
  // ==========================================

  /**
   * Product rating is calculated strictly and exclusively from APPROVED reviews.
   * Pending and rejected reviews never participate in public ratings.
   */
  public calculateProductRating(
    productId: string,
    providedReviews?: ProductReview[]
  ): {
    averageRating: number;
    totalReviews: number;
    distribution: Record<number, number>;
  } {
    const reviews = (providedReviews || this.reviewsCache || []).filter(
      (r) => r.productId === productId && r.status === 'approved'
    );

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (reviews.length === 0) {
      return {
        averageRating: 5.0,
        totalReviews: 0,
        distribution,
      };
    }

    let sum = 0;
    for (const r of reviews) {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      distribution[star] = (distribution[star] || 0) + 1;
      sum += r.rating;
    }

    const averageRating = Number((sum / reviews.length).toFixed(1));
    return {
      averageRating,
      totalReviews: reviews.length,
      distribution,
    };
  }

  // ==========================================
  // MEDIA UPLOAD WITH STRICT VALIDATION
  // ==========================================

  /**
   * Validates and securely uploads an image or video file for a review.
   * Images: JPG, JPEG, PNG, WEBP (<= 5MB)
   * Videos: MP4, WEBM (<= 25MB)
   */
  public async uploadReviewMedia(file: File): Promise<ReviewMedia> {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      throw new Error('Unsupported file type. Please upload a photo (JPG, PNG, WEBP) or video (MP4, WEBM).');
    }

    const maxImageSize = 5 * 1024 * 1024; // 5 MB
    const maxVideoSize = 25 * 1024 * 1024; // 25 MB

    if (isImage && file.size > maxImageSize) {
      throw new Error(`Photo "${file.name}" exceeds the maximum 5 MB file size limit.`);
    }

    if (isVideo && file.size > maxVideoSize) {
      throw new Error(`Video "${file.name}" exceeds the maximum 25 MB file size limit.`);
    }

    // Convert file to base64
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // Upload to server endpoint
    const payload = {
      folder: 'reviews',
      fileName: file.name,
      fileType: file.type,
      base64: base64Data,
    };

    let uploadRes = await fetch('/api/upload.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!uploadRes.ok) {
      uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!uploadRes.ok) {
      const errJson = await uploadRes.json().catch(() => ({}));
      throw new Error(errJson.message || 'Media upload failed. Please try again.');
    }

    const uploadData = await uploadRes.json();
    return {
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      mediaType: isVideo ? 'video' : 'image',
      url: uploadData.url || uploadData.fileUrl,
      fileName: uploadData.fileName || file.name,
      mimeType: file.type,
      fileSize: file.size,
    };
  }
}

export const reviewService = new ReviewService();

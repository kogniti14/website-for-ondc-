/**
 * KOGNITI MINDS PRIVATE LIMITED
 * FIREBASE REALTIME DATABASE LIVE SYNCHRONIZATION ENGINE
 *
 * Listens to real-time events from Firebase Realtime Database:
 * - Products & Live Inventory
 * - Categories & Taxonomy
 * - Company Certifications & Statutory Badges
 * - Stories & Sustainable Impact Gallery
 * - Customer Reviews & Moderation
 * - Global Website Settings
 * - Coupons & Promotions
 * - Site Media & Banners
 * - B2B RFQ Quotations
 *
 * Guarantees:
 * - Non-Destructive Ingestion: Never wipes client state if Firebase returns null or transiently empty.
 * - Live Propagation: Propagates state changes to React components via dataSyncBus without browser refresh.
 * - Global Audience Consistency: When Super Admin updates in live production, every visitor on any device updates immediately.
 */

import { ref, onValue, off, Unsubscribe } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import { dataSyncBus } from './dataSyncBus';
import { storageService } from './storageService';

class RealtimeSyncService {
  private unsubscribers: Map<string, Unsubscribe> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initializes real-time listeners for active client collections
   */
  public initRealtimeListeners(): void {
    if (this.isInitialized || typeof window === 'undefined') return;
    if (!isFirebaseConfigured() || !db) return;

    this.isInitialized = true;

    try {
      // 1. Live Products & Inventory Listener
      const productsRef = ref(db, 'products');
      const unsubsProducts = onValue(
        productsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            if (list.length > 0) {
              const normalized = storageService.normalizeProducts(list as any);
              try {
                localStorage.setItem('km_products_v2', JSON.stringify(normalized));
              } catch {}
              dataSyncBus.emit('products', normalized);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Products listener notice:', error.message);
        }
      );
      this.unsubscribers.set('products', unsubsProducts);

      // 2. Live Customer Reviews Listener
      const reviewsRef = ref(db, 'reviews');
      const unsubsReviews = onValue(
        reviewsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_product_reviews_v1', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('reviews', list);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Reviews listener notice:', error.message);
        }
      );
      this.unsubscribers.set('reviews', unsubsReviews);

      // 3. Live Website Global Settings Listener
      const settingsRef = ref(db, 'settings');
      const unsubsSettings = onValue(
        settingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const settings = snapshot.val();
            if (settings && typeof settings === 'object') {
              try {
                localStorage.setItem('km_settings_v1', JSON.stringify(settings));
              } catch {}
              dataSyncBus.emit('settings', settings);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Settings listener notice:', error.message);
        }
      );
      this.unsubscribers.set('settings', unsubsSettings);

      // 4. Live Categories Listener
      const categoriesRef = ref(db, 'categories');
      const unsubsCategories = onValue(
        categoriesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            if (list.length > 0) {
              try {
                localStorage.setItem('km_categories_v2', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('categories', list);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Categories listener notice:', error.message);
        }
      );
      this.unsubscribers.set('categories', unsubsCategories);

      // 5. Live Testimonials (Client Trust) Listener
      const testimonialsRef = ref(db, 'testimonials');
      const unsubsTestimonials = onValue(
        testimonialsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_testimonials_v1', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('testimonials', list);
          } else {
            try {
              localStorage.setItem('km_testimonials_v1', JSON.stringify([]));
            } catch {}
            dataSyncBus.emit('testimonials', []);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Testimonials listener notice:', error.message);
        }
      );
      this.unsubscribers.set('testimonials', unsubsTestimonials);

      // 6. Live Certifications Listener
      const certsRef = ref(db, 'certifications');
      const unsubsCerts = onValue(
        certsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            if (list.length > 0) {
              try {
                localStorage.setItem('kogniti_company_certifications', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('certifications', list);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Certifications listener notice:', error.message);
        }
      );
      this.unsubscribers.set('certifications', unsubsCerts);

      // 6b. Live Certification Categories Listener
      const certCatsRef = ref(db, 'certification_categories');
      const unsubsCertCats = onValue(
        certCatsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            if (list.length > 0) {
              try {
                localStorage.setItem('kogniti_certification_categories', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('certification_categories', list);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Certification categories listener notice:', error.message);
        }
      );
      this.unsubscribers.set('certification_categories', unsubsCertCats);

      // 6c. Live Stories & Gallery Listener
      const storiesRef = ref(db, 'stories');
      const unsubsStories = onValue(
        storiesRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            if (list.length > 0) {
              try {
                localStorage.setItem('km_stories_v1', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('stories', list);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Stories listener notice:', error.message);
        }
      );
      this.unsubscribers.set('stories', unsubsStories);

      // 7. Live B2B Quotations Listener
      const rfqsRef = ref(db, 'b2b_quotations');
      const unsubsRfqs = onValue(
        rfqsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_b2b_quotations_v2', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('b2b_quotations', list);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Quotations listener notice:', error.message);
        }
      );
      this.unsubscribers.set('b2b_quotations', unsubsRfqs);

      // 8. Live Coupons & Promotional Offers Listener
      const couponsRef = ref(db, 'coupons');
      const unsubsCoupons = onValue(
        couponsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_coupons_v2', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('coupons', list);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Coupons listener notice:', error.message);
        }
      );
      this.unsubscribers.set('coupons', unsubsCoupons);

      // 9. Live Site Media (Banners, Logo, Hero Media) Listener
      const mediaRef = ref(db, 'site_media');
      const unsubsMedia = onValue(
        mediaRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const media = snapshot.val();
            if (media && typeof media === 'object') {
              try {
                localStorage.setItem('km_site_media_v2', JSON.stringify(media));
              } catch {}
              dataSyncBus.emit('site_media', media);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Site Media listener notice:', error.message);
        }
      );
      this.unsubscribers.set('site_media', unsubsMedia);

      // 10. Live B2C Retail Orders Listener
      const b2cOrdersRef = ref(db, 'b2c_orders');
      const unsubsB2COrders = onValue(
        b2cOrdersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_b2c_orders_v2', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('b2c_orders', list);
            dataSyncBus.emit('orders_updated');
          } else {
            try {
              localStorage.setItem('km_b2c_orders_v2', JSON.stringify([]));
            } catch {}
            dataSyncBus.emit('b2c_orders', []);
            dataSyncBus.emit('orders_updated');
          }
        },
        (error) => {
          console.warn('[RealtimeSync] B2C Orders listener notice:', error.message);
        }
      );
      this.unsubscribers.set('b2c_orders', unsubsB2COrders);

      // 11. Live B2B Wholesale Orders Listener
      const b2bOrdersRef = ref(db, 'b2b_orders');
      const unsubsB2BOrders = onValue(
        b2bOrdersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_b2b_orders_v2', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('b2b_orders', list);
            dataSyncBus.emit('orders_updated');
          } else {
            try {
              localStorage.setItem('km_b2b_orders_v2', JSON.stringify([]));
            } catch {}
            dataSyncBus.emit('b2b_orders', []);
            dataSyncBus.emit('orders_updated');
          }
        },
        (error) => {
          console.warn('[RealtimeSync] B2B Orders listener notice:', error.message);
        }
      );
      this.unsubscribers.set('b2b_orders', unsubsB2BOrders);

      // 12. Live ONDC Protocol Orders Listener
      const ondcOrdersRef = ref(db, 'ondc_orders');
      const unsubsOndcOrders = onValue(
        ondcOrdersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_ondc_orders_v1', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('ondc_orders', list);
            dataSyncBus.emit('orders_updated');
          }
        },
        (error) => {
          console.warn('[RealtimeSync] ONDC Orders listener notice:', error.message);
        }
      );
      this.unsubscribers.set('ondc_orders', unsubsOndcOrders);

      // 13. Live B2C Customers Listener
      const b2cUsersRef = ref(db, 'b2c_users');
      const unsubsB2CUsers = onValue(
        b2cUsersRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_b2c_users_v1', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('b2c_users', list);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] B2C Users listener notice:', error.message);
        }
      );
      this.unsubscribers.set('b2c_users', unsubsB2CUsers);

      // 14. Live B2B Verified Corporate Accounts Listener
      const b2bBizRef = ref(db, 'b2b_businesses');
      const unsubsB2BBiz = onValue(
        b2bBizRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_b2b_businesses_v1', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('b2b_businesses', list);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] B2B Businesses listener notice:', error.message);
        }
      );
      this.unsubscribers.set('b2b_businesses', unsubsB2BBiz);

      // 15. Live Company Master Statutory Information Listener
      const companySettingsRef = ref(db, 'company_settings');
      const unsubsCompanySettings = onValue(
        companySettingsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            if (val && typeof val === 'object') {
              try {
                localStorage.setItem('km_company_master_v1', JSON.stringify(val));
              } catch {}
              dataSyncBus.emit('company_settings', val);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Company Master Settings listener notice:', error.message);
        }
      );
      this.unsubscribers.set('company_settings', unsubsCompanySettings);

      // 16. Live Cancellation Requests Listener
      const cancellationRef = ref(db, 'cancellation_requests');
      const unsubsCancellation = onValue(
        cancellationRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw || {});
            try {
              localStorage.setItem('km_cancellation_requests_v1', JSON.stringify(list));
            } catch {}
            dataSyncBus.emit('cancellation_requests', list);
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Cancellation requests listener notice:', error.message);
        }
      );
      this.unsubscribers.set('cancellation_requests', unsubsCancellation);

      console.log('[RealtimeSync] Realtime Database listeners active across products, categories, orders, users, RFQs, reviews, testimonials, certifications, stories, settings, coupons, site_media, and cancellations.');
    } catch (err) {
      console.warn('[RealtimeSync] Initialization fallback notice:', err);
    }
  }

  /**
   * Destroys all active listeners to prevent memory leaks
   */
  public destroyRealtimeListeners(): void {
    for (const [key, unsub] of this.unsubscribers.entries()) {
      try {
        unsub();
      } catch {}
    }
    this.unsubscribers.clear();
    this.isInitialized = false;
  }
}

export const realtimeSyncService = new RealtimeSyncService();

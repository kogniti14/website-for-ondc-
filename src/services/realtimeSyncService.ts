/**
 * KOGNITI MINDS PRIVATE LIMITED
 * FIREBASE REALTIME DATABASE LIVE SYNCHRONIZATION ENGINE
 *
 * Listens to real-time events from Firebase Realtime Database:
 * - Products & Live Inventory
 * - Customer Reviews & Moderation
 * - Global Website Settings
 * - Order Status Updates
 *
 * Automatically propagates state changes to mounted React components via dataSyncBus.
 * Eliminates the need for manual browser refreshes.
 */

import { ref, onValue, off, Unsubscribe } from 'firebase/database';
import { db, isFirebaseConfigured } from './firebase';
import { dataSyncBus } from './dataSyncBus';

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
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
            if (list.length > 0) {
              try {
                localStorage.setItem('km_products_v2', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('products', list);
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
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
            if (list.length > 0) {
              try {
                localStorage.setItem('km_product_reviews_v1', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('reviews', list);
            }
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
            try {
              localStorage.setItem('km_settings_v1', JSON.stringify(settings));
            } catch {}
            dataSyncBus.emit('settings', settings);
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
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
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
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
            if (list.length > 0) {
              try {
                localStorage.setItem('km_testimonials_v1', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('testimonials', list);
            }
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
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
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

      // 7. Live B2B Quotations Listener
      const rfqsRef = ref(db, 'b2b_quotations');
      const unsubsRfqs = onValue(
        rfqsRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const raw = snapshot.val();
            const list = Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw);
            if (list.length > 0) {
              try {
                localStorage.setItem('km_b2b_quotations_v2', JSON.stringify(list));
              } catch {}
              dataSyncBus.emit('b2b_quotations', list);
            }
          }
        },
        (error) => {
          console.warn('[RealtimeSync] Quotations listener notice:', error.message);
        }
      );
      this.unsubscribers.set('b2b_quotations', unsubsRfqs);

      console.log('[RealtimeSync] Realtime Database listeners active across products, categories, reviews, testimonials, certifications, settings, and RFQs.');
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

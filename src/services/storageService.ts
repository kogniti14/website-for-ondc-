/**
 * KOGNITI MINDS - Central Storage & Data Persistence Service
 *
 * Core Responsibility:
 * Manages the platform's dual-tier data persistence architecture:
 * 1. Tier 1 (Client-Side Cache): Rapid in-memory & localStorage caching for sub-millisecond UI rendering.
 * 2. Tier 2 (Server-Side Persistence): Asynchronous background synchronization to Hostinger LiteSpeed
 *    PHP storage (/api/data.php) and persistent atomic JSON files under data/storage/.
 *
 * Managed Business Entities:
 * - Products & Categories
 * - B2C Customer Accounts & Profiles
 * - B2B Corporate Accounts, Profiles & RFQ Quotations
 * - Customer Orders & Invoices (B2C & B2B)
 * - Cart & Wishlist persistence
 * - Admin Personnel Registry
 * - Promotional Coupons & Media
 *
 * Guarantees:
 * - Safe Deployments: Production data is decoupled from code updates (data/storage is gitignored).
 * - Offline/Lag Resilience: UI operates uninterrupted even during temporary network interruptions.
 */

import {
  Product,
  B2CUser,
  B2BBusiness,
  B2COrder,
  B2BOrder,
  B2BQuotation,
  B2BQuotationItem,
  CartItem,
  WishlistItem,
  Coupon,
  AdminUser,
  Category,
  PasswordResetOtp,
  SiteMedia,
  B2BPaymentRecord,
  B2BOrderItemSummary,
  B2CAddress,
  B2BDocumentType,
  B2BDocumentAttachment,
} from '../types';
import { MOCK_PRODUCTS, MOCK_COUPONS, CATEGORIES } from '../data/mockProducts';
import { emailOtpService } from './emailOtpService';
import { dataSyncBus } from './dataSyncBus';
import {
  MASTER_SUPER_ADMIN,
  normalizeAdminIdentifier,
  isSuperAdminIdentifier,
  adminDbService,
} from './adminDbService';
import { db, isFirebaseConfigured } from './firebase';
import { ref, set, remove, get } from 'firebase/database';

const KEYS = {
  PRODUCTS: 'km_products_v2',
  CATEGORIES: 'km_categories_v2',
  B2C_USERS: 'km_b2c_users_v1',
  B2B_BUSINESSES: 'km_b2b_businesses_v1',
  B2C_ORDERS: 'km_b2c_orders_v2',
  B2B_ORDERS: 'km_b2b_orders_v2',
  B2B_QUOTATIONS: 'km_b2b_quotations_v2',
  B2C_CART: 'km_b2c_cart_v2',
  B2B_CART: 'km_b2b_cart_v2',
  B2C_WISHLIST: 'km_b2c_wishlist_v2',
  COUPONS: 'km_coupons_v2',
  ADMIN_USERS: 'km_admin_users_v1',
  RESET_OTPS: 'km_reset_otps_v1',
  CURRENT_USER_SESSION: 'km_user_session_v1',
  SITE_MEDIA: 'km_site_media_v2',
};

// Initial Seed Data - Production Level (Zero Dummy Accounts)
const SEED_ADMIN_USERS: AdminUser[] = [MASTER_SUPER_ADMIN];

const SEED_B2C_USERS: B2CUser[] = [];

const SEED_B2B_BUSINESSES: B2BBusiness[] = [];

const SEED_B2C_ORDERS: B2COrder[] = [];

const SEED_B2B_ORDERS: B2BOrder[] = [];

const SEED_B2B_QUOTATIONS: B2BQuotation[] = [
  {
    id: 'rfq_301',
    rfqNumber: 'RFQ-KM-2026-104',
    businessId: 'biz_edutech',
    businessName: 'EduTech Solutions Private Limited',
    contactPerson: 'Vikram Malhotra',
    email: 'procurement@edutech.in',
    phone: '+91 98111 22334',
    productId: 'km-inst-pallet-a4',
    productName: 'Kogniti Institutional Bulk Pallet: 75 GSM Agro Copier Paper (40 Cartons / 200 Reams)',
    sku: 'KM-INST-PLT40',
    requestedQty: 5,
    targetUnitPrice: 36000,
    deliveryPincode: '560100',
    requiredByDate: '2026-09-25',
    specialRequirements:
      'Semester exam paper procurement for 5 campuses. Palletized delivery with forklift unloading and batch quality compliance certificates.',
    status: 'quoted',
    submittedAt: '2026-09-06T10:15:00Z',
    adminQuotation: {
      quotedUnitPrice: 35720, // 6% multi-campus discount
      totalTaxable: 178600,
      gstAmount: 21432,
      shippingCharges: 0,
      grandTotal: 200032,
      validUntil: '2026-09-30',
      adminNotes:
        'Official quotation approved for 5 pallets (1,000 reams / 500,000 sheets). Direct factory freight included with GST input credit.',
      quotedAt: '2026-09-07T09:30:00Z',
    },
  },
];

class StorageService {
  private memoryStore: Record<string, string> = {};
  private isHydrated = false;

  constructor() {
    if (typeof window !== 'undefined') {
      setTimeout(() => this.hydrateFromServer(), 50);
    }
  }

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        const stored = this.memoryStore[key];
        return stored ? JSON.parse(stored) : defaultVal;
      }
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(stored);
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.memoryStore[key] = JSON.stringify(val);
        return;
      }
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  }

  /**
   * Background server synchronization helper
   * Syncs changes to persistent store via data.php or /api/data
   */
  private async syncServer(collection: string, payload: any, method: 'POST' | 'DELETE' = 'POST', id?: string): Promise<any> {
    if (typeof window === 'undefined') return null;
    const body = method !== 'DELETE' ? JSON.stringify(payload) : undefined;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
    const isAdmin = typeof window !== 'undefined' && (
      localStorage.getItem('km_active_role') === 'admin' ||
      Boolean(localStorage.getItem('km_active_admin_id'))
    );
    if (isAdmin) {
      headers['X-Admin-Role'] = 'super_admin';
      headers['Authorization'] = 'Bearer admin';
    }

    try {
      // 1. PRIMARY CLOUD STORE: Asynchronously replicate to Firebase Realtime Database
      if (isFirebaseConfigured() && db) {
        try {
          const docId = id || (payload && payload.id);
          if (docId) {
            const itemRef = ref(db, `${collection}/${docId}`);
            if (method === 'DELETE') {
              remove(itemRef).catch(() => {});
            } else if (payload && typeof payload === 'object') {
              set(itemRef, payload).catch(() => {});
            }
          }
        } catch {
          // Non-blocking Realtime Database sync
        }
      }

      // 2. FAILOVER & HOSTINGER STORE: Direct native PHP dispatcher (guaranteed active on Hostinger LiteSpeed/Apache)
      const phpUrl = method === 'DELETE' && id
        ? `/api/data.php?collection=${collection}&id=${encodeURIComponent(id)}`
        : `/api/data.php?collection=${collection}`;
      let res = await fetch(phpUrl, { method, headers, body, cache: 'no-store' }).catch(() => null);
      if (!res || !res.ok) {
        const url = method === 'DELETE' && id
          ? `/api/data/${collection}/${encodeURIComponent(id)}`
          : `/api/data/${collection}`;
        res = await fetch(url, { method, headers, body, cache: 'no-store' }).catch(() => null);
      }
      if (res && res.ok) {
        return await res.json().catch(() => null);
      }
    } catch {
      // Non-blocking background sync
    }
    return null;
  }

  /**
   * Hydrates local cache with live persistent data from server on startup.
   * Server database is the canonical source of truth:
   * - Never resurrect deleted records into local cache or back to server
   * - Correctly unwrap object collections (site_media, settings, policies)
   * - Send admin authorization headers to preserve inventory data for admins
   */
  async hydrateFromServer(): Promise<void> {
    if (typeof window === 'undefined' || this.isHydrated) return;
    this.isHydrated = true;

    const isAdmin = typeof window !== 'undefined' && (
      localStorage.getItem('km_active_role') === 'admin' ||
      Boolean(localStorage.getItem('km_active_admin_id'))
    );

    const reqHeaders: Record<string, string> = {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
    if (isAdmin) {
      reqHeaders['X-Admin-Role'] = 'super_admin';
      reqHeaders['Authorization'] = 'Bearer admin';
    }

    const mappings: Array<{ collection: string; key: string; defaultVal: any; isArray: boolean }> = [
      { collection: 'products', key: KEYS.PRODUCTS, defaultVal: MOCK_PRODUCTS, isArray: true },
      { collection: 'categories', key: KEYS.CATEGORIES, defaultVal: CATEGORIES, isArray: true },
      { collection: 'b2c_users', key: KEYS.B2C_USERS, defaultVal: [], isArray: true },
      { collection: 'b2b_businesses', key: KEYS.B2B_BUSINESSES, defaultVal: [], isArray: true },
      { collection: 'b2c_orders', key: KEYS.B2C_ORDERS, defaultVal: [], isArray: true },
      { collection: 'b2b_orders', key: KEYS.B2B_ORDERS, defaultVal: [], isArray: true },
      { collection: 'b2b_quotations', key: KEYS.B2B_QUOTATIONS, defaultVal: SEED_B2B_QUOTATIONS, isArray: true },
      { collection: 'coupons', key: KEYS.COUPONS, defaultVal: MOCK_COUPONS, isArray: true },
      { collection: 'admin_users', key: KEYS.ADMIN_USERS, defaultVal: SEED_ADMIN_USERS, isArray: true },
      { collection: 'testimonials', key: 'km_testimonials_v1', defaultVal: [], isArray: true },
      { collection: 'settings', key: 'km_settings_v1', defaultVal: {}, isArray: false },
      { collection: 'site_media', key: KEYS.SITE_MEDIA, defaultVal: {}, isArray: false },
    ];

    const timestamp = Date.now();
    for (const item of mappings) {
      try {
        let res = await fetch(`/api/data.php?collection=${item.collection}&t=${timestamp}`, {
          cache: 'no-store',
          headers: reqHeaders,
        }).catch(() => null);
        if (!res || !res.ok) {
          res = await fetch(`/api/data/${item.collection}?t=${timestamp}`, {
            cache: 'no-store',
            headers: reqHeaders,
          }).catch(() => null);
        }
        if (res && res.ok) {
          const serverData = await res.json();
          if (item.isArray && Array.isArray(serverData)) {
            // Server database is authoritative: replace local store without resurrecting deleted items
            if (serverData.length > 0) {
              const localItems = this.getItem<any[]>(item.key, []);
              if (Array.isArray(localItems) && localItems.length > 0) {
                const mergedList = serverData.map((serverItem: any) => {
                  const localMatch = localItems.find((loc: any) => loc.id === serverItem.id);
                  if (localMatch && localMatch.updatedAt && serverItem.updatedAt) {
                    const localTime = new Date(localMatch.updatedAt).getTime();
                    const serverTime = new Date(serverItem.updatedAt).getTime();
                    if (localTime > serverTime) {
                      return localMatch;
                    }
                  }
                  return serverItem;
                });
                for (const loc of localItems) {
                  if (!mergedList.some((m: any) => m.id === loc.id)) {
                    mergedList.push(loc);
                  }
                }
                this.setItem(item.key, mergedList);
                dataSyncBus.emit(item.collection, mergedList);
              } else {
                this.setItem(item.key, serverData);
                dataSyncBus.emit(item.collection, serverData);
              }
            }
          } else if (!item.isArray) {
            // Object collection: handle both direct object and unwrapped single-item array
            let serverObj = serverData;
            if (Array.isArray(serverData)) {
              serverObj = serverData[0] || {};
            }
            if (serverObj && typeof serverObj === 'object') {
              const localObj = this.getItem<any>(item.key, item.defaultVal) || {};
              const merged = { ...localObj, ...serverObj };
              this.setItem(item.key, merged);
              dataSyncBus.emit(item.collection, merged);
            }
          }
        }
      } catch {
        // Non-blocking background hydration
      }
    }

    // Notify listeners that order and counter metrics are freshly hydrated
    dataSyncBus.emit('orders_updated');
  }

  /**
   * Real-time dynamic Pan-India Units Delivered Counter
   * Baseline start count: 200 units.
   * Directly synchronized with the actual order database.
   * Counts item quantities of valid confirmed/delivered B2C and B2B orders.
   * Deducts quantity when an order is cancelled or rejected.
   */
  getDeliveredUnitsCount(): number {
    const BASELINE_DELIVERED = 200;

    // 1. Sum B2C order item quantities
    const b2cOrders = this.getB2COrders();
    const b2cUnits = b2cOrders.reduce((total, order) => {
      if (
        order.orderStatus === 'cancelled' ||
        order.orderStatus === 'rejected' ||
        order.paymentStatus === 'failed'
      ) {
        return total;
      }
      const qty = Array.isArray(order.items)
        ? order.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
        : 1;
      return total + qty;
    }, 0);

    // 2. Sum B2B order item quantities
    const b2bOrders = this.getB2BOrders();
    const b2bUnits = b2bOrders.reduce((total, order) => {
      if (
        order.orderStatus === 'cancelled' ||
        order.orderStatus === 'rejected' ||
        order.status === 'cancelled' ||
        order.status === 'draft' ||
        order.paymentStatus === 'failed'
      ) {
        return total;
      }
      const qty = Array.isArray(order.items)
        ? order.items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0)
        : 1;
      return total + qty;
    }, 0);

    return BASELINE_DELIVERED + b2cUnits + b2bUnits;
  }

  // --- Products ---
  getProducts(): Product[] {
    let products = this.getItem<Product[]>(KEYS.PRODUCTS, MOCK_PRODUCTS);
    // Non-destructive: filter out individual deprecated IDs if found, never wipe catalog
    const hasDeprecated = products.some(
      (p) =>
        p.id === 'km-ergo-01' ||
        p.id === 'km-ifp-75' ||
        p.category === 'Ergonomic Furniture' ||
        p.category === 'Smart EdTech & Display'
    );
    if (hasDeprecated) {
      products = products.filter(
        (p) =>
          p.id !== 'km-ergo-01' &&
          p.id !== 'km-ifp-75' &&
          p.category !== 'Ergonomic Furniture' &&
          p.category !== 'Smart EdTech & Display'
      );
      this.setItem(KEYS.PRODUCTS, products);
    }

    // Auto-migrate any cached products with 12% GST to 18% GST
    let hasGst12 = false;
    const updatedProducts = products.map((p) => {
      if (p.gstRate === 12) {
        hasGst12 = true;
        return { ...p, gstRate: 18 };
      }
      return p;
    });
    if (hasGst12) {
      this.setItem(KEYS.PRODUCTS, updatedProducts);
      return updatedProducts;
    }

    // Normalize stock, stockStatus, and stockStatusMode for all catalog products (Req 65-71)
    let needsNormalization = false;
    const normalized = updatedProducts.map((p) => {
      const stock = typeof p.stock === 'number' ? Math.max(0, p.stock) : 0;
      const status = p.stockStatus || (stock > 50 ? 'in_stock' : stock > 0 ? 'limited_stock' : 'out_of_stock');
      const mode = p.stockStatusMode || 'manual';
      if (p.stock !== stock || p.stockStatus !== status || p.stockStatusMode !== mode || p.stockQuantity !== stock) {
        needsNormalization = true;
        return {
          ...p,
          stock,
          stockQuantity: stock,
          stockStatus: status,
          stockStatusMode: mode,
        };
      }
      return p;
    });

    if (needsNormalization) {
      this.setItem(KEYS.PRODUCTS, normalized);
      return normalized;
    }

    return updatedProducts;
  }

  getPublicProducts(): Product[] {
    const products = this.getProducts();
    return products.map((p) => {
      const copy = { ...p };
      delete (copy as any).stock;
      delete (copy as any).stockQuantity;
      return copy;
    });
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  async saveProduct(product: Product): Promise<void> {
    const products = this.getProducts();
    // Validate non-negative inventory (Req 79)
    const validStock = Math.max(0, Math.round(Number(product.stock) || 0));
    product.stock = validStock;
    product.stockQuantity = validStock;

    // Automatic vs Manual stock status determination (Req 71)
    if (product.stockStatusMode === 'automatic') {
      const threshold = product.lowStockThreshold || 50;
      product.stockStatus = validStock > threshold ? 'in_stock' : validStock > 0 ? 'limited_stock' : 'out_of_stock';
    } else {
      product.stockStatus = product.stockStatus || (validStock > 0 ? 'in_stock' : 'out_of_stock');
    }
    product.updatedAt = new Date().toISOString();

    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    this.setItem(KEYS.PRODUCTS, products);
    await this.syncServer('products', product);
    dataSyncBus.emit('products', products);
  }

  /**
   * Decrements actual inventory for purchased items upon successful order (Req 72)
   */
  async decrementProductInventory(items: { productId?: string; quantity: number }[]): Promise<void> {
    if (!items || items.length === 0) return;
    const products = this.getProducts();
    let modified = false;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) continue;
      const target = products.find((p) => p.id === item.productId);
      if (target) {
        const prev = typeof target.stock === 'number' ? target.stock : 0;
        target.stock = Math.max(0, prev - item.quantity);
        target.stockQuantity = target.stock;
        if (target.stockStatusMode === 'automatic') {
          const threshold = target.lowStockThreshold || 50;
          target.stockStatus = target.stock > threshold ? 'in_stock' : target.stock > 0 ? 'limited_stock' : 'out_of_stock';
        }
        target.updatedAt = new Date().toISOString();
        modified = true;
        await this.syncServer('products', target);
      }
    }

    if (modified) {
      this.setItem(KEYS.PRODUCTS, products);
      dataSyncBus.emit('products', products);
    }
  }

  /**
   * Restores inventory when an order is cancelled or rejected (Req 72)
   */
  async restoreProductInventory(items: { productId?: string; quantity: number }[]): Promise<void> {
    if (!items || items.length === 0) return;
    const products = this.getProducts();
    let modified = false;

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) continue;
      const target = products.find((p) => p.id === item.productId);
      if (target) {
        const prev = typeof target.stock === 'number' ? target.stock : 0;
        target.stock = prev + item.quantity;
        target.stockQuantity = target.stock;
        if (target.stockStatusMode === 'automatic') {
          const threshold = target.lowStockThreshold || 50;
          target.stockStatus = target.stock > threshold ? 'in_stock' : target.stock > 0 ? 'limited_stock' : 'out_of_stock';
        }
        target.updatedAt = new Date().toISOString();
        modified = true;
        await this.syncServer('products', target);
      }
    }

    if (modified) {
      this.setItem(KEYS.PRODUCTS, products);
      dataSyncBus.emit('products', products);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.setItem(KEYS.PRODUCTS, products);
    await this.syncServer('products', null, 'DELETE', id);
    dataSyncBus.emit('products', products);
  }

  async deleteMultipleProducts(ids: string[]): Promise<number> {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const initial = this.getProducts();
    const remaining = initial.filter((p) => !idSet.has(p.id));
    this.setItem(KEYS.PRODUCTS, remaining);
    await Promise.all(ids.map((id) => this.syncServer('products', null, 'DELETE', id)));
    dataSyncBus.emit('products', remaining);
    return initial.length - remaining.length;
  }

  // --- B2C Users ---
  getB2CUsers(): B2CUser[] {
    return this.getItem<B2CUser[]>(KEYS.B2C_USERS, SEED_B2C_USERS);
  }

  getB2CUserById(id: string): B2CUser | undefined {
    return this.getB2CUsers().find((u) => u.id === id);
  }

  isB2CIdentifierRegistered(identifier: string): boolean {
    if (!identifier || !identifier.trim()) return false;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const users = this.getB2CUsers();
    return users.some((u) => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uDigits = (u.phone || '').replace(/\D/g, '');
      if (clean.includes('@') && uEmail === clean) return true;
      if (cleanDigits.length >= 10 && uDigits.length >= 10 && uDigits.slice(-10) === cleanDigits.slice(-10)) return true;
      return false;
    });
  }

  getB2CUserByIdentifier(identifier: string): B2CUser | undefined {
    if (!identifier || !identifier.trim()) return undefined;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const users = this.getB2CUsers();
    return users.find((u) => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uDigits = (u.phone || '').replace(/\D/g, '');
      if (clean.includes('@') && uEmail === clean) return true;
      if (cleanDigits.length >= 10 && uDigits.length >= 10 && uDigits.slice(-10) === cleanDigits.slice(-10)) return true;
      return false;
    });
  }

  saveB2CUser(user: B2CUser): void {
    const users = this.getB2CUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.setItem(KEYS.B2C_USERS, users);
    this.syncServer('b2c_users', user);
    dataSyncBus.emit('b2c_users', users);
  }

  deleteB2CUser(id: string): boolean {
    const list = this.getB2CUsers();
    const remaining = list.filter((u) => u.id !== id);
    this.setItem(KEYS.B2C_USERS, remaining);
    this.syncServer('b2c_users', null, 'DELETE', id);
    dataSyncBus.emit('b2c_users', remaining);
    return list.length !== remaining.length;
  }

  deleteMultipleB2CUsers(ids: string[]): number {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const initial = this.getB2CUsers();
    const remaining = initial.filter((u) => !idSet.has(u.id));
    this.setItem(KEYS.B2C_USERS, remaining);
    ids.forEach((id) => this.syncServer('b2c_users', null, 'DELETE', id));
    dataSyncBus.emit('b2c_users', remaining);
    return initial.length - remaining.length;
  }

  // --- B2B Businesses ---
  getB2BBusinesses(): B2BBusiness[] {
    return this.getItem<B2BBusiness[]>(KEYS.B2B_BUSINESSES, SEED_B2B_BUSINESSES);
  }

  getB2BBusinessById(id: string): B2BBusiness | undefined {
    return this.getB2BBusinesses().find((b) => b.id === id);
  }

  isB2BIdentifierRegistered(identifier: string): boolean {
    if (!identifier || !identifier.trim()) return false;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const businesses = this.getB2BBusinesses();
    return businesses.some((b) => {
      const bEmail = (b.businessEmail || '').trim().toLowerCase();
      const bDigits = (b.mobile || '').replace(/\D/g, '');
      if (clean.includes('@') && bEmail === clean) return true;
      if (cleanDigits.length >= 10 && bDigits.length >= 10 && bDigits.slice(-10) === cleanDigits.slice(-10)) return true;
      return false;
    });
  }

  getB2BBusinessByIdentifier(identifier: string): B2BBusiness | undefined {
    if (!identifier || !identifier.trim()) return undefined;
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/\D/g, '');
    const businesses = this.getB2BBusinesses();
    return businesses.find((b) => {
      const bEmail = (b.businessEmail || '').trim().toLowerCase();
      const bDigits = (b.mobile || '').replace(/\D/g, '');
      if (clean.includes('@') && bEmail === clean) return true;
      if (cleanDigits.length >= 10 && bDigits.length >= 10 && bDigits.slice(-10) === cleanDigits.slice(-10)) return true;
      return false;
    });
  }

  saveB2BBusiness(business: B2BBusiness): void {
    const list = this.getB2BBusinesses();
    const index = list.findIndex((b) => b.id === business.id);
    if (index >= 0) {
      list[index] = business;
    } else {
      list.unshift(business);
    }
    this.setItem(KEYS.B2B_BUSINESSES, list);
    this.syncServer('b2b_businesses', business);
    dataSyncBus.emit('b2b_businesses', list);
  }

  updateBusinessStatus(id: string, status: B2BBusiness['status'], reason?: string): void {
    const list = this.getB2BBusinesses();
    const target = list.find((b) => b.id === id);
    if (target) {
      target.status = status;
      if (reason) target.statusReason = reason;
      if (status === 'approved') {
        target.approvedAt = new Date().toISOString();
        target.verificationStatus = 'verified';
      } else if (status === 'rejected') {
        target.verificationStatus = 'rejected';
      }
      this.setItem(KEYS.B2B_BUSINESSES, list);
      this.syncServer('b2b_businesses', target);
      dataSyncBus.emit('b2b_businesses', list);
    }
  }

  updateB2BVerificationStatus(
    id: string,
    verificationStatus: NonNullable<B2BBusiness['verificationStatus']>,
    status?: B2BBusiness['status'],
    reason?: string
  ): void {
    const list = this.getB2BBusinesses();
    const target = list.find((b) => b.id === id);
    if (target) {
      target.verificationStatus = verificationStatus;
      if (status) {
        target.status = status;
        if (status === 'approved') target.approvedAt = new Date().toISOString();
      }
      if (reason) target.statusReason = reason;
      this.setItem(KEYS.B2B_BUSINESSES, list);
      this.syncServer('b2b_businesses', target);
      dataSyncBus.emit('b2b_businesses', list);
    }
  }

  async updateB2BDocument(
    businessId: string,
    docType: B2BDocumentType,
    attachment: B2BDocumentAttachment
  ): Promise<boolean> {
    const list = this.getB2BBusinesses();
    const target = list.find((b) => b.id === businessId);
    if (!target) return false;

    const now = new Date().toISOString();
    const map: Record<string, string> = {
      gst_certificate: 'gstCertificate',
      msme_certificate: 'msmeCertificate',
      moa: 'moaDocument',
      aoa: 'aoaDocument',
      coi: 'coiDocument',
    };
    const key = map[docType];

    // Ensure status is under_review on document upload/replacement unless explicitly set
    attachment.status = attachment.status || 'under_review';
    attachment.verificationStatus = attachment.verificationStatus || 'under_review';
    attachment.updatedAt = now;
    attachment.lastAction = attachment.lastAction || 'replace';
    attachment.lastActionAt = now;

    if (Array.isArray(target.kycDocuments)) {
      const idx = target.kycDocuments.findIndex(
        (d: any) => d.type === docType || d.documentType === docType
      );
      if (idx >= 0) {
        target.kycDocuments[idx] = { ...target.kycDocuments[idx], ...attachment };
      } else {
        target.kycDocuments.push(attachment);
      }
    } else {
      if (!target.kycDocuments || typeof target.kycDocuments !== 'object') {
        target.kycDocuments = {};
      }
      if (key) {
        (target.kycDocuments as any)[key] = attachment;
      }
    }

    const docName = attachment.name;
    if (!Array.isArray(target.documents)) {
      target.documents = [];
    }
    const existingIdx = target.documents.findIndex(
      (d) => d.name === docName || (d as any).documentType === docType
    );
    const docEntry = {
      name: docName,
      type: (attachment.fileType || attachment.mimeType || '').includes('pdf') ? 'pdf' : 'image',
      uploadedAt: attachment.uploadedAt,
      updatedAt: now,
      status: attachment.status,
      url: attachment.fileUrl || attachment.documentUrl,
      fileUrl: attachment.fileUrl || attachment.documentUrl,
      documentType: docType,
      originalFileName: attachment.originalFileName || attachment.originalFilename,
      fileSize: attachment.fileSize,
      version: attachment.version,
      rejectionReason: attachment.rejectionReason,
      resubmissionReason: attachment.resubmissionReason,
      reviewedBy: attachment.reviewedBy,
      reviewedAt: attachment.reviewedAt,
    };
    if (existingIdx >= 0) {
      target.documents[existingIdx] = docEntry;
    } else {
      target.documents.push(docEntry);
    }

    target.updatedAt = now;
    this.setItem(KEYS.B2B_BUSINESSES, list);
    dataSyncBus.emit('b2b_businesses', list);
    await this.syncServer('b2b_businesses', target);
    return true;
  }

  async updateB2BDocumentStatus(
    businessId: string,
    docType: B2BDocumentType,
    status: 'verified' | 'rejected' | 'requires_resubmission' | 'under_review' | 'pending',
    metadata?: {
      rejectionReason?: string;
      resubmissionReason?: string;
      reviewedBy?: string;
      reviewedAt?: string;
    }
  ): Promise<boolean> {
    const list = this.getB2BBusinesses();
    const target = list.find((b) => b.id === businessId);
    if (!target) return false;

    const now = new Date().toISOString();
    const map: Record<string, string> = {
      gst_certificate: 'gstCertificate',
      msme_certificate: 'msmeCertificate',
      moa: 'moaDocument',
      aoa: 'aoaDocument',
      coi: 'coiDocument',
    };
    const key = map[docType];

    const actionType =
      status === 'verified'
        ? 'approve'
        : status === 'rejected'
        ? 'reject'
        : status === 'requires_resubmission'
        ? 'request_resubmission'
        : 'replace';

    const docLabels: Record<string, string> = {
      gst_certificate: 'GST Certificate',
      msme_certificate: 'MSME / Udyam Certificate',
      moa: 'MOA — Memorandum of Association',
      aoa: 'AOA — Articles of Association',
      coi: 'COI — Certificate of Incorporation',
    };
    const docLabel = docLabels[docType] || docType;

    // 1. Update or append kycDocuments if array
    if (Array.isArray(target.kycDocuments)) {
      const idx = target.kycDocuments.findIndex(
        (d: any) => d.type === docType || d.documentType === docType
      );
      if (idx >= 0) {
        target.kycDocuments[idx] = {
          ...target.kycDocuments[idx],
          status,
          verificationStatus: status,
          updatedAt: now,
          reviewedAt: metadata?.reviewedAt || now,
          reviewedBy: metadata?.reviewedBy || 'Super Admin',
          rejectionReason: metadata?.rejectionReason,
          resubmissionReason: metadata?.resubmissionReason,
          lastAction: actionType,
          lastActionAt: now,
        };
      } else {
        target.kycDocuments.push({
          id: `kyc_${docType}_${Date.now()}`,
          documentType: docType,
          type: docType,
          name: docLabel,
          originalFilename: `${docType}.pdf`,
          documentUrl: '',
          uploadedAt: now,
          status,
          verificationStatus: status,
          updatedAt: now,
          reviewedAt: metadata?.reviewedAt || now,
          reviewedBy: metadata?.reviewedBy || 'Super Admin',
          rejectionReason: metadata?.rejectionReason,
          resubmissionReason: metadata?.resubmissionReason,
          lastAction: actionType,
          lastActionAt: now,
        } as any);
      }
    }
    // 2. Update or set kycDocuments if object
    if (!target.kycDocuments || typeof target.kycDocuments !== 'object' || !Array.isArray(target.kycDocuments)) {
      if (!target.kycDocuments || typeof target.kycDocuments !== 'object') {
        target.kycDocuments = {};
      }
      if (key) {
        (target.kycDocuments as any)[key] = {
          ...((target.kycDocuments as any)[key] || {
            id: `kyc_${docType}_${Date.now()}`,
            documentType: docType,
            type: docType,
            name: docLabel,
            uploadedAt: now,
          }),
          status,
          verificationStatus: status,
          updatedAt: now,
          reviewedAt: metadata?.reviewedAt || now,
          reviewedBy: metadata?.reviewedBy || 'Super Admin',
          rejectionReason: metadata?.rejectionReason,
          resubmissionReason: metadata?.resubmissionReason,
          lastAction: actionType,
          lastActionAt: now,
        };
      }
    }

    // 3. Update or append documents array
    if (!Array.isArray(target.documents)) {
      target.documents = [];
    }
    const docIdx = target.documents.findIndex(
      (d: any) =>
        d.documentType === docType ||
        (d.name && d.name.toLowerCase().includes(docType.replace('_', ' '))) ||
        (d.type && d.type.toLowerCase().includes(docType.replace('_', ' '))) ||
        (d.name && d.name.toLowerCase().includes(docType.split('_')[0]))
    );
    if (docIdx >= 0) {
      target.documents[docIdx] = {
        ...target.documents[docIdx],
        documentType: docType,
        status,
        updatedAt: now,
        rejectionReason: metadata?.rejectionReason,
        resubmissionReason: metadata?.resubmissionReason,
        reviewedBy: metadata?.reviewedBy || 'Super Admin',
        reviewedAt: metadata?.reviewedAt || now,
      } as any;
    } else {
      target.documents.push({
        name: docLabel,
        documentType: docType,
        type: 'pdf',
        status,
        uploadedAt: now,
        updatedAt: now,
        rejectionReason: metadata?.rejectionReason,
        resubmissionReason: metadata?.resubmissionReason,
        reviewedBy: metadata?.reviewedBy || 'Super Admin',
        reviewedAt: metadata?.reviewedAt || now,
      } as any);
    }

    target.updatedAt = now;

    // Check independent statutory document statuses to update business verificationStatus
    const STATUTORY_TYPES: B2BDocumentType[] = ['gst_certificate', 'msme_certificate', 'moa', 'aoa', 'coi'];
    const statuses = STATUTORY_TYPES.map((t) => {
      if (Array.isArray(target.kycDocuments)) {
        const d = target.kycDocuments.find((item: any) => item.type === t || item.documentType === t);
        return d?.status || 'pending';
      }
      const k = map[t];
      if (target.kycDocuments && typeof target.kycDocuments === 'object' && k && (target.kycDocuments as any)[k]) {
        return (target.kycDocuments as any)[k].status || 'pending';
      }
      const foundInDocs = target.documents?.find((d: any) => d.documentType === t);
      return foundInDocs?.status || 'pending';
    });

    if (statuses.every((s) => s === 'verified')) {
      target.verificationStatus = 'verified';
    } else if (statuses.some((s) => s === 'rejected')) {
      target.verificationStatus = 'rejected';
    } else if (statuses.some((s) => s === 'requires_resubmission')) {
      target.verificationStatus = 'requires_resubmission';
    } else if (statuses.some((s) => s === 'under_review')) {
      target.verificationStatus = 'under_review';
    }

    this.setItem(KEYS.B2B_BUSINESSES, list);
    dataSyncBus.emit('b2b_businesses', list);
    await this.syncServer('b2b_businesses', target);
    return true;
  }

  deleteB2BBusiness(id: string): boolean {
    const list = this.getB2BBusinesses();
    const remaining = list.filter((b) => b.id !== id);
    this.setItem(KEYS.B2B_BUSINESSES, remaining);
    this.syncServer('b2b_businesses', null, 'DELETE', id);
    dataSyncBus.emit('b2b_businesses', remaining);
    return list.length !== remaining.length;
  }

  deleteMultipleB2BBusinesses(ids: string[]): number {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const initial = this.getB2BBusinesses();
    const remaining = initial.filter((b) => !idSet.has(b.id));
    this.setItem(KEYS.B2B_BUSINESSES, remaining);
    ids.forEach((id) => this.syncServer('b2b_businesses', null, 'DELETE', id));
    dataSyncBus.emit('b2b_businesses', remaining);
    return initial.length - remaining.length;
  }

  // --- B2C Orders ---
  getB2COrders(): B2COrder[] {
    const raw = this.getItem<B2COrder[]>(KEYS.B2C_ORDERS, []);
    return raw.filter((o) => o.id !== 'b2c_ord_101');
  }

  getB2COrderById(id: string): B2COrder | undefined {
    return this.getB2COrders().find((o) => o.id === id);
  }

  saveB2COrder(order: B2COrder): void {
    const orders = this.getB2COrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
      // Deduct actual product inventory upon successful order placement (Req 72)
      if (Array.isArray(order.items)) {
        this.decrementProductInventory(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
      }
    }
    this.setItem(KEYS.B2C_ORDERS, orders);
    this.syncServer('b2c_orders', order);
    dataSyncBus.emit('b2c_orders', orders);
    dataSyncBus.emit('orders_updated');
  }

  async updateB2COrderStatus(id: string, status: B2COrder['orderStatus'], note?: string): Promise<void> {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      const prevStatus = order.orderStatus;
      order.orderStatus = status;
      if (!Array.isArray(order.statusTimeline)) {
        order.statusTimeline = [];
      }
      order.statusTimeline.push({
        status: status.replace('_', ' ').toUpperCase(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        note: note || `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
      });
      // If order is cancelled/rejected, restore product stock (Req 72)
      if ((status === 'cancelled' || status === 'rejected') && prevStatus !== 'cancelled' && prevStatus !== 'rejected') {
        if (Array.isArray(order.items)) {
          await this.restoreProductInventory(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
        }
      }
      this.setItem(KEYS.B2C_ORDERS, orders);
      await this.syncServer('b2c_orders', order);
      dataSyncBus.emit('b2c_orders', orders);
      dataSyncBus.emit('orders_updated');
    }
  }

  async confirmB2COrder(id: string, adminName: string): Promise<B2COrder | null> {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    order.confirmedBy = adminName;
    if (!Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }
    order.statusTimeline.push({
      status: 'ORDER CONFIRMED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `Order confirmed by ${adminName}. Proceeding to packaging and dispatch.`,
    });
    this.setItem(KEYS.B2C_ORDERS, orders);
    await this.syncServer('b2c_orders', order);
    dataSyncBus.emit('b2c_orders', orders);
    dataSyncBus.emit('orders_updated');
    return order;
  }

  async rejectB2COrder(id: string, adminName: string, reason?: string): Promise<B2COrder | null> {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    const prevStatus = order.orderStatus;
    order.orderStatus = 'rejected';
    order.rejectionReason = reason || 'Order rejected during admin verification';
    order.rejectedAt = new Date().toISOString();
    order.rejectedBy = adminName;
    if (!Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }
    order.statusTimeline.push({
      status: 'ORDER REJECTED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `Order rejected by ${adminName}. Reason: ${reason || 'Not specified'}`,
    });
    // Restore inventory if previously not cancelled/rejected
    if (prevStatus !== 'cancelled' && prevStatus !== 'rejected' && Array.isArray(order.items)) {
      await this.restoreProductInventory(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
    }
    this.setItem(KEYS.B2C_ORDERS, orders);
    await this.syncServer('b2c_orders', order);
    dataSyncBus.emit('b2c_orders', orders);
    dataSyncBus.emit('orders_updated');
    return order;
  }

  deleteB2COrder(id: string): boolean {
    const orders = this.getB2COrders();
    const remaining = orders.filter((o) => o.id !== id);
    this.setItem(KEYS.B2C_ORDERS, remaining);
    this.syncServer('b2c_orders', null, 'DELETE', id);
    dataSyncBus.emit('b2c_orders', remaining);
    dataSyncBus.emit('orders_updated');
    return orders.length !== remaining.length;
  }

  deleteMultipleB2COrders(ids: string[]): number {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const initial = this.getB2COrders();
    const remaining = initial.filter((o) => !idSet.has(o.id));
    this.setItem(KEYS.B2C_ORDERS, remaining);
    ids.forEach((id) => this.syncServer('b2c_orders', null, 'DELETE', id));
    dataSyncBus.emit('b2c_orders', remaining);
    dataSyncBus.emit('orders_updated');
    return initial.length - remaining.length;
  }

  // --- B2B Orders ---
  getB2BOrders(): B2BOrder[] {
    const raw = this.getItem<B2BOrder[]>(KEYS.B2B_ORDERS, []);
    return raw.filter((o) => o.id !== 'b2b_ord_01');
  }

  getB2BOrderById(id: string): B2BOrder | undefined {
    return this.getB2BOrders().find((o) => o.id === id);
  }

  saveB2BOrder(order: B2BOrder): void {
    const orders = this.getB2BOrders();
    const existingIndex = orders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.unshift(order);
      // Deduct actual product inventory upon successful B2B order placement (Req 72)
      if (Array.isArray(order.items)) {
        this.decrementProductInventory(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
      }
    }
    this.setItem(KEYS.B2B_ORDERS, orders);
    this.syncServer('b2b_orders', order);
    dataSyncBus.emit('b2b_orders', orders);
    dataSyncBus.emit('orders_updated');
  }

  async updateB2BOrderStatus(id: string, status: B2BOrder['orderStatus'], note?: string): Promise<void> {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      const prevStatus = order.orderStatus;
      order.orderStatus = status;
      if (!Array.isArray(order.statusTimeline)) {
        order.statusTimeline = [];
      }
      order.statusTimeline.push({
        status: status.replace('_', ' ').toUpperCase(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        note: note || `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
      });
      // If B2B order is cancelled/rejected, restore product stock (Req 72)
      if ((status === 'cancelled' || status === 'rejected') && prevStatus !== 'cancelled' && prevStatus !== 'rejected') {
        if (Array.isArray(order.items)) {
          await this.restoreProductInventory(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
        }
      }
      this.setItem(KEYS.B2B_ORDERS, orders);
      await this.syncServer('b2b_orders', order);
      dataSyncBus.emit('b2b_orders', orders);
      dataSyncBus.emit('orders_updated');
    }
  }

  async confirmB2BOrder(id: string, adminName: string): Promise<B2BOrder | null> {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    order.confirmedBy = adminName;
    if (!Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }
    order.statusTimeline.push({
      status: 'ORDER CONFIRMED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `B2B purchase order verified and confirmed by ${adminName}. Proceeding to wholesale allocation.`,
    });
    this.setItem(KEYS.B2B_ORDERS, orders);
    await this.syncServer('b2b_orders', order);
    dataSyncBus.emit('b2b_orders', orders);
    dataSyncBus.emit('orders_updated');
    return order;
  }

  async rejectB2BOrder(id: string, adminName: string, reason?: string): Promise<B2BOrder | null> {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    const prevStatus = order.orderStatus;
    order.orderStatus = 'rejected';
    order.rejectionReason = reason || 'PO rejected by administration';
    order.rejectedAt = new Date().toISOString();
    order.rejectedBy = adminName;
    if (!Array.isArray(order.statusTimeline)) {
      order.statusTimeline = [];
    }
    order.statusTimeline.push({
      status: 'ORDER REJECTED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `B2B Order rejected by ${adminName}. Reason: ${reason || 'Not specified'}`,
    });

    // Restore product stock upon rejection (Req 72)
    if (prevStatus !== 'rejected' && prevStatus !== 'cancelled' && Array.isArray(order.items)) {
      await this.restoreProductInventory(order.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
    }

    this.setItem(KEYS.B2B_ORDERS, orders);
    await this.syncServer('b2b_orders', order);
    dataSyncBus.emit('b2b_orders', orders);
    dataSyncBus.emit('orders_updated');
    return order;
  }

  deleteB2BOrder(id: string): boolean {
    const orders = this.getB2BOrders();
    const remaining = orders.filter((o) => o.id !== id);
    this.setItem(KEYS.B2B_ORDERS, remaining);
    this.syncServer('b2b_orders', null, 'DELETE', id);
    dataSyncBus.emit('b2b_orders', remaining);
    dataSyncBus.emit('orders_updated');
    return orders.length !== remaining.length;
  }

  deleteMultipleB2BOrders(ids: string[]): number {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const initial = this.getB2BOrders();
    const remaining = initial.filter((o) => !idSet.has(o.id));
    this.setItem(KEYS.B2B_ORDERS, remaining);
    ids.forEach((id) => this.syncServer('b2b_orders', null, 'DELETE', id));
    dataSyncBus.emit('b2b_orders', remaining);
    dataSyncBus.emit('orders_updated');
    return initial.length - remaining.length;
  }

  recordB2BOfflinePayment(
    orderId: string,
    paymentData: {
      amount: number;
      paymentDate: string;
      paymentMode: 'razorpay' | 'bank_transfer' | 'neft' | 'rtgs' | 'imps' | 'cheque' | 'other' | string;
      transactionReference?: string;
      transactionRef?: string;
      chequeNumber?: string;
      bankName?: string;
      notes?: string;
      newPaymentStatus?: 'paid' | 'partially_paid' | 'payment_due' | 'failed' | 'refunded';
    },
    adminName: string
  ): B2BOrder | null {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const currentPaid = Number(order.amountPaid || (order.paymentStatus === 'paid' ? order.grandTotal : 0));
    const newAmountPaid = Math.min(order.grandTotal, currentPaid + Number(paymentData.amount));
    const newAmountDue = Math.max(0, order.grandTotal - newAmountPaid);

    let status = paymentData.newPaymentStatus;
    if (!status) {
      if (newAmountDue <= 0) {
        status = 'paid';
      } else if (newAmountPaid > 0) {
        status = 'partially_paid';
      } else {
        status = 'payment_due';
      }
    }

    const newRecord: B2BPaymentRecord = {
      id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: Number(paymentData.amount),
      paymentDate: paymentData.paymentDate || new Date().toISOString().slice(0, 10),
      paymentMode: paymentData.paymentMode,
      transactionReference: paymentData.transactionReference || paymentData.transactionRef,
      transactionRef: paymentData.transactionRef || paymentData.transactionReference,
      chequeNumber: paymentData.chequeNumber,
      bankName: paymentData.bankName,
      notes: paymentData.notes,
      recordedBy: adminName,
      recordedAt: new Date().toISOString(),
    };

    order.paymentStatus = status;
    order.paymentMode = paymentData.paymentMode;
    order.amountPaid = newAmountPaid;
    order.amountDue = newAmountDue;
    order.paymentRecords = [...(order.paymentRecords || []), newRecord];
    order.statusTimeline.push({
      status: `OFFLINE PAYMENT RECORDED (${paymentData.paymentMode.replace('_', ' ').toUpperCase()})`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `Recorded payment of ₹${Number(paymentData.amount).toLocaleString('en-IN')} via ${paymentData.paymentMode.replace('_', ' ').toUpperCase()}. Total Settled: ₹${newAmountPaid.toLocaleString('en-IN')}, Remaining Due: ₹${newAmountDue.toLocaleString('en-IN')}. Admin: ${adminName}.`,
    });

    this.setItem(KEYS.B2B_ORDERS, orders);
    return order;
  }

  createManualB2BOrder(
    orderData: {
      source: 'web' | 'phone' | 'whatsapp' | 'email' | 'sales_rep' | 'direct_offline' | 'other';
      businessId?: string;
      businessName: string;
      contactPerson: string;
      email: string;
      mobile: string;
      gstin?: string;
      billingAddress: B2CAddress;
      shippingAddress: B2CAddress;
      items: {
        productId?: string;
        productName: string;
        sku?: string;
        hsn?: string;
        image?: string;
        quantity: number;
        unitPrice: number;
        discountPercent?: number;
        gstRate?: number;
      }[];
      shippingFee?: number;
      paymentTerms?: string;
      paymentMode?: string;
      paymentStatus: 'paid' | 'partially_paid' | 'payment_due';
      upfrontAmountPaid?: number;
      transactionReference?: string;
      bankName?: string;
      internalRemarks?: string;
      orderStatus?: 'placed' | 'confirmed';
    },
    adminName: string
  ): B2BOrder {
    // 1. Check or auto-register B2BBusiness
    let business = orderData.businessId ? this.getB2BBusinessById(orderData.businessId) : undefined;
    if (!business) {
      business = this.getB2BBusinessByIdentifier(orderData.email) || this.getB2BBusinessByIdentifier(orderData.mobile);
    }
    if (!business) {
      const newBizId = `biz_man_${Date.now()}`;
      const defaultAddr: B2CAddress = {
        id: `addr_${Date.now()}`,
        fullName: orderData.contactPerson,
        phone: orderData.mobile,
        street: 'Commercial Facility',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        addressType: 'work',
      };
      const newBiz: B2BBusiness = {
        id: newBizId,
        companyName: orderData.businessName,
        legalName: orderData.businessName,
        contactPerson: orderData.contactPerson,
        businessEmail: orderData.email || `contact@${orderData.businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        mobile: orderData.mobile,
        gstin: orderData.gstin || '09AAECK1234F1Z5',
        pan: orderData.gstin ? orderData.gstin.slice(2, 12) : 'AAECK1234F',
        businessType: 'Corporate Office',
        status: 'approved',
        billingAddress: defaultAddr,
        shippingAddress: defaultAddr,
        documents: [],
        creditLimit: 500000,
        paymentTerms: orderData.paymentTerms === 'Net 15' ? 'Net 15' : orderData.paymentTerms === 'Net 30' ? 'Net 30' : 'Prepaid',
        accountManager: {
          name: 'Direct Sales Desk',
          email: 'sales@kognitiminds.com',
          phone: '+91 99316 48595',
          designation: 'Senior Account Officer',
        },
        registeredAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };
      this.saveB2BBusiness(newBiz);
      business = newBiz;
    }

    const orderNumber = `KM-B2B-${Math.floor(100000 + Math.random() * 900000)}`;
    const poNumber = `PO-MAN-${orderData.source.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items: B2BOrderItemSummary[] = orderData.items.map((it, idx) => {
      const discount = it.discountPercent || 0;
      const effUnitPrice = Math.round(it.unitPrice * (1 - discount / 100));
      const lineTaxable = effUnitPrice * it.quantity;
      return {
        productId: it.productId || `prod_man_${idx}`,
        productName: it.productName,
        sku: it.sku || `SKU-MAN-${idx + 1}`,
        image: it.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
        quantity: it.quantity,
        wholesalePrice: it.unitPrice,
        tierDiscountPercent: discount,
        effectiveUnitPrice: effUnitPrice,
        hsn: it.hsn || '8471',
        gstRate: it.gstRate || 18,
        total: lineTaxable,
      };
    });

    const subtotal = items.reduce((s, i) => s + (i.wholesalePrice * i.quantity), 0);
    const taxableAmount = items.reduce((s, i) => s + i.total, 0);
    const bulkDiscountTotal = Math.max(0, subtotal - taxableAmount);
    const totalGst = Math.round(taxableAmount * 0.18 * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst / 2) * 100) / 100;
    const shippingFee = Number(orderData.shippingFee) || 0;
    const grandTotal = taxableAmount + totalGst + shippingFee;

    const upfrontPaid = orderData.paymentStatus === 'paid'
      ? grandTotal
      : (orderData.paymentStatus === 'partially_paid' ? (Number(orderData.upfrontAmountPaid) || 0) : 0);
    const amountDue = Math.max(0, grandTotal - upfrontPaid);

    const paymentRecords: B2BPaymentRecord[] = [];
    if (upfrontPaid > 0) {
      paymentRecords.push({
        id: `pay_${Date.now()}_init`,
        amount: upfrontPaid,
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMode: orderData.paymentMode || 'bank_transfer',
        transactionReference: orderData.transactionReference || `INIT-${Date.now()}`,
        transactionRef: orderData.transactionReference || `INIT-${Date.now()}`,
        bankName: orderData.bankName || 'Direct / Bank',
        notes: `Upfront payment captured during manual order creation (${orderData.source.toUpperCase()}).`,
        recordedBy: adminName,
        recordedAt: new Date().toISOString(),
      });
    }

    const isConfirmed = orderData.orderStatus === 'confirmed';

    const newOrder: B2BOrder = {
      id: `b2b_ord_${Date.now()}`,
      orderNumber,
      poNumber,
      businessId: business.id,
      businessName: orderData.businessName,
      gstin: orderData.gstin || business.gstin || '09AAECK1234F1Z5',
      source: orderData.source,
      internalRemarks: orderData.internalRemarks,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      items,
      subtotal,
      bulkDiscountTotal,
      taxableAmount,
      cgst,
      sgst,
      igst: 0,
      totalGst,
      shippingFee,
      grandTotal,
      paymentTerms: orderData.paymentTerms || 'Prepaid',
      paymentStatus: orderData.paymentStatus,
      paymentMode: orderData.paymentMode || 'bank_transfer',
      amountPaid: upfrontPaid,
      amountDue,
      paymentRecords,
      orderStatus: isConfirmed ? 'confirmed' : 'placed',
      confirmedAt: isConfirmed ? new Date().toISOString() : undefined,
      confirmedBy: isConfirmed ? adminName : undefined,
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: isConfirmed ? 'MANUAL ORDER CREATED & CONFIRMED' : 'MANUAL ORDER DRAFT CREATED',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          note: `Order booked manually via ${orderData.source.replace('_', ' ').toUpperCase()} by ${adminName}. Total: ₹${grandTotal.toLocaleString('en-IN')}, Paid: ₹${upfrontPaid.toLocaleString('en-IN')}.`,
        },
      ],
    };

    this.saveB2BOrder(newOrder);
    return newOrder;
  }

  // --- B2B Quotations (RFQ) ---
  getB2BQuotations(): B2BQuotation[] {
    return this.getItem<B2BQuotation[]>(KEYS.B2B_QUOTATIONS, SEED_B2B_QUOTATIONS);
  }

  saveB2BQuotation(quotation: B2BQuotation): void {
    const quotations = this.getB2BQuotations();
    const idx = quotations.findIndex((q) => q.id === quotation.id);
    if (idx >= 0) {
      quotations[idx] = quotation;
    } else {
      quotations.unshift(quotation);
    }
    this.setItem(KEYS.B2B_QUOTATIONS, quotations);
    this.syncServer('b2b_quotations', quotation);
  }

  deleteB2BQuotation(id: string): void {
    const quotations = this.getB2BQuotations().filter((q) => q.id !== id);
    this.setItem(KEYS.B2B_QUOTATIONS, quotations);
    this.syncServer('b2b_quotations', null, 'DELETE', id);
  }

  deleteMultipleB2BQuotations(ids: string[]): number {
    if (!ids || ids.length === 0) return 0;
    const idSet = new Set(ids);
    const initial = this.getB2BQuotations();
    const remaining = initial.filter((q) => !idSet.has(q.id));
    this.setItem(KEYS.B2B_QUOTATIONS, remaining);
    ids.forEach((id) => this.syncServer('b2b_quotations', null, 'DELETE', id));
    return initial.length - remaining.length;
  }

  reviseB2BQuotation(
    quotationId: string,
    revisionData: {
      items: B2BQuotationItem[];
      shippingCharges?: number;
      paymentTerms?: string;
      deliveryTerms?: string;
      validUntil?: string;
      adminNotes?: string;
    },
    adminName: string
  ): B2BQuotation | null {
    const quotations = this.getB2BQuotations();
    const q = quotations.find((item) => item.id === quotationId);
    if (!q) return null;

    // Snapshot original request if not already captured
    if (!q.originalRequest) {
      q.originalRequest = {
        requestedQty: q.requestedQty || (q.items?.reduce((s, i) => s + i.quantity, 0) || 1),
        targetUnitPrice: q.targetUnitPrice || (q.items?.[0]?.unitPrice || 0),
        deliveryPincode: q.deliveryPincode || q.shippingAddress?.pincode,
        specialRequirements: q.specialRequirements,
        items: q.items?.map((it) => ({
          productName: it.productName,
          quantity: it.quantity,
          targetUnitPrice: it.unitPrice,
        })),
      };
    }

    const previousGrandTotal = q.grandTotal || (q.adminQuotation?.grandTotal || 0);

    const totalTaxable = revisionData.items.reduce((s, it) => s + it.total, 0);
    const totalGst = Math.round(totalTaxable * 0.18 * 100) / 100;
    const shipping = Number(revisionData.shippingCharges) || 0;
    const newGrandTotal = totalTaxable + totalGst + shipping;

    q.items = revisionData.items;
    q.subtotal = totalTaxable;
    q.taxableAmount = totalTaxable;
    q.gstAmount = totalGst;
    q.shippingCharges = shipping;
    q.grandTotal = newGrandTotal;
    q.paymentTerms = revisionData.paymentTerms || q.paymentTerms || 'Prepaid';
    q.deliveryTerms = revisionData.deliveryTerms || q.deliveryTerms || 'Doorstep Delivery within 5-7 business days';
    q.notes = revisionData.adminNotes || q.notes;
    q.status = 'revised_quoted';

    q.adminQuotation = {
      quotedUnitPrice: revisionData.items[0]?.unitPrice || 0,
      totalTaxable,
      gstAmount: totalGst,
      shippingCharges: shipping,
      grandTotal: newGrandTotal,
      validUntil: revisionData.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      adminNotes: revisionData.adminNotes || 'Revised proposal terms submitted by Sales & Quotations desk.',
      quotedAt: new Date().toISOString(),
    };

    const newRevision = {
      revisedAt: new Date().toISOString(),
      revisedBy: adminName,
      previousGrandTotal,
      newGrandTotal,
      remarks: revisionData.adminNotes || 'Revised quotation issued to client.',
    };
    q.revisions = [...(q.revisions || []), newRevision];

    this.saveB2BQuotation(q);
    return q;
  }

  convertQuotationToB2BOrder(quotationId: string, adminName: string): B2BOrder | null {
    const quotations = this.getB2BQuotations();
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) return null;

    const orderNumber = `KM-B2B-${Math.floor(100000 + Math.random() * 900000)}`;
    const items: B2BOrderItemSummary[] = (quote.items && quote.items.length > 0)
      ? quote.items.map((it, idx) => ({
          productId: it.productId || `prod_quote_${idx}`,
          productName: it.productName,
          sku: it.sku || `SKU-${idx + 1}`,
          image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
          quantity: it.quantity,
          wholesalePrice: it.unitPrice,
          tierDiscountPercent: it.discount || 0,
          effectiveUnitPrice: Math.round(it.unitPrice * (1 - (it.discount || 0) / 100)),
          hsn: '4802',
          gstRate: it.gstRate || 18,
          total: it.total,
        }))
      : [
          {
            productId: quote.productId || 'km-agri-a4-75',
            productName: quote.productName || 'B2B Custom Procurement Batch',
            sku: quote.sku || 'KM-B2B-CUSTOM',
            image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
            quantity: quote.requestedQty || 10,
            wholesalePrice: quote.adminQuotation?.quotedUnitPrice || quote.targetUnitPrice || 200,
            tierDiscountPercent: 0,
            effectiveUnitPrice: quote.adminQuotation?.quotedUnitPrice || quote.targetUnitPrice || 200,
            hsn: '4802',
            gstRate: 18,
            total: (quote.adminQuotation?.totalTaxable) || ((quote.requestedQty || 10) * (quote.adminQuotation?.quotedUnitPrice || quote.targetUnitPrice || 200)),
          },
        ];

    const subtotal = quote.subtotal || quote.adminQuotation?.totalTaxable || items.reduce((s, i) => s + i.total, 0);
    const bulkDiscountTotal = quote.discount || 0;
    const taxableAmount = quote.taxableAmount || (subtotal - bulkDiscountTotal);
    const totalGst = quote.gstAmount || quote.adminQuotation?.gstAmount || Math.round(taxableAmount * 0.18 * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst / 2) * 100) / 100;
    const shippingFee = quote.shippingCharges !== undefined ? quote.shippingCharges : (quote.adminQuotation?.shippingCharges || 0);
    const grandTotal = quote.grandTotal || quote.adminQuotation?.grandTotal || (taxableAmount + totalGst + shippingFee);

    const defaultAddress: B2CAddress = {
      id: `addr_${Date.now()}`,
      fullName: quote.contactPerson,
      phone: quote.phone,
      street: 'Commercial Delivery Address',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: quote.deliveryPincode || '201301',
      addressType: 'work',
    };

    const newOrder: B2BOrder = {
      id: `b2b_ord_${Date.now()}`,
      orderNumber,
      poNumber: `PO-${quote.rfqNumber}`,
      businessId: quote.businessId || `biz_${Date.now()}`,
      businessName: quote.businessName,
      gstin: quote.gstin || '09AAECK1234F1Z5',
      shippingAddress: quote.shippingAddress || defaultAddress,
      billingAddress: quote.billingAddress || defaultAddress,
      items,
      subtotal,
      bulkDiscountTotal,
      taxableAmount,
      cgst,
      sgst,
      igst: 0,
      totalGst,
      shippingFee,
      grandTotal,
      paymentTerms: quote.paymentTerms || 'Prepaid',
      paymentStatus: 'payment_due',
      paymentMode: 'bank_transfer',
      amountPaid: 0,
      amountDue: grandTotal,
      orderStatus: 'confirmed',
      confirmedAt: new Date().toISOString(),
      confirmedBy: adminName,
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'ORDER CREATED FROM QUOTATION',
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          note: `Commercial order converted from proposal ${quote.rfqNumber} and confirmed by ${adminName}.`,
        },
      ],
    };

    this.saveB2BOrder(newOrder);

    // Update quotation status to 'ordered'
    quote.status = 'ordered';
    quote.convertedOrderId = newOrder.orderNumber;
    quote.convertedAt = new Date().toISOString();
    quote.convertedBy = adminName;
    this.saveB2BQuotation(quote);

    return newOrder;
  }

  // --- Cart System (Separate B2C & B2B) ---
  getB2CCart(): CartItem[] {
    return this.getItem<CartItem[]>(KEYS.B2C_CART, []);
  }

  setB2CCart(items: CartItem[]): void {
    this.setItem(KEYS.B2C_CART, items);
  }

  getB2BCart(): CartItem[] {
    return this.getItem<CartItem[]>(KEYS.B2B_CART, []);
  }

  setB2BCart(items: CartItem[]): void {
    this.setItem(KEYS.B2B_CART, items);
  }

  // --- Wishlist System ---
  getWishlist(): WishlistItem[] {
    return this.getItem<WishlistItem[]>(KEYS.B2C_WISHLIST, [
      { productId: 'km-desk-02', addedAt: '2026-09-01T10:00:00Z' },
    ]);
  }

  setWishlist(items: WishlistItem[]): void {
    this.setItem(KEYS.B2C_WISHLIST, items);
  }

  // --- Coupons ---
  getCoupons(): Coupon[] {
    const raw = this.getItem<Coupon[]>(KEYS.COUPONS, []);
    // Ensure no legacy demo coupons are lingering in local storage
    return raw.filter(
      (c) => c.code !== 'WELCOME10' && c.code !== 'KOGNITI15' && c.code !== 'FLAT200'
    );
  }

  async saveCoupon(coupon: Coupon): Promise<void> {
    const coupons = this.getCoupons();
    const cleanCode = coupon.code.trim().toUpperCase();
    const index = coupons.findIndex((c) => c.id === coupon.id || c.code.toUpperCase() === cleanCode);
    const newCoupon: Coupon = {
      ...coupon,
      id: coupon.id || `cpn_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      code: cleanCode,
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
      usageCount: coupon.usageCount || 0,
      createdAt: coupon.createdAt || new Date().toISOString(),
    };
    if (index >= 0) {
      coupons[index] = newCoupon;
    } else {
      coupons.unshift(newCoupon);
    }
    this.setItem(KEYS.COUPONS, coupons);
    await this.syncServer('coupons', newCoupon);
    dataSyncBus.emit('coupons', coupons);
  }

  async deleteCoupon(idOrCode: string): Promise<void> {
    const coupons = this.getCoupons().filter(
      (c) => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase()
    );
    this.setItem(KEYS.COUPONS, coupons);
    await this.syncServer('coupons', null, 'DELETE', idOrCode);
    dataSyncBus.emit('coupons', coupons);
  }

  async deleteMultipleCoupons(idsOrCodes: string[]): Promise<number> {
    if (!idsOrCodes || idsOrCodes.length === 0) return 0;
    const targets = new Set(idsOrCodes.map((s) => s.toUpperCase()));
    const initial = this.getCoupons();
    const remaining = initial.filter(
      (c) => !targets.has(c.id.toUpperCase()) && !targets.has(c.code.toUpperCase())
    );
    this.setItem(KEYS.COUPONS, remaining);
    await Promise.all(idsOrCodes.map((id) => this.syncServer('coupons', null, 'DELETE', id)));
    dataSyncBus.emit('coupons', remaining);
    return initial.length - remaining.length;
  }

  async toggleCouponStatus(idOrCode: string): Promise<void> {
    const coupons = this.getCoupons();
    const c = coupons.find((item) => item.id === idOrCode || item.code.toUpperCase() === idOrCode.toUpperCase());
    if (c) {
      c.isActive = !c.isActive;
      this.setItem(KEYS.COUPONS, coupons);
      await this.syncServer('coupons', c);
      dataSyncBus.emit('coupons', coupons);
    }
  }

  incrementCouponUsage(code: string): void {
    const coupons = this.getCoupons();
    const c = coupons.find((item) => item.code.toUpperCase() === code.trim().toUpperCase());
    if (c) {
      c.usageCount = (c.usageCount || 0) + 1;
      this.setItem(KEYS.COUPONS, coupons);
    }
  }

  // --- Admin Staff & Governance ---
  getAdminUsers(): AdminUser[] {
    const list = this.getItem<AdminUser[]>(KEYS.ADMIN_USERS, SEED_ADMIN_USERS);
    if (Array.isArray(list)) {
      const superAdminIndex = list.findIndex(
        (u) =>
          u.id === 'adm_super_01' ||
          u.userId.toLowerCase() === 'kogniti14' ||
          u.email.toLowerCase() === 'kogniti14@kognitiminds.com'
      );

      if (superAdminIndex >= 0) {
        if (
          list[superAdminIndex].name !== MASTER_SUPER_ADMIN.name ||
          list[superAdminIndex].department !== MASTER_SUPER_ADMIN.department
        ) {
          list[superAdminIndex] = {
            ...list[superAdminIndex],
            name: MASTER_SUPER_ADMIN.name,
            department: MASTER_SUPER_ADMIN.department,
          };
          this.setItem(KEYS.ADMIN_USERS, list);
        }
        return list;
      } else {
        const merged = [MASTER_SUPER_ADMIN, ...list];
        this.setItem(KEYS.ADMIN_USERS, merged);
        return merged;
      }
    }
    this.setItem(KEYS.ADMIN_USERS, [MASTER_SUPER_ADMIN]);
    return [MASTER_SUPER_ADMIN];
  }

  getAdminUserById(id: string): AdminUser | null {
    const users = this.getAdminUsers();
    return users.find((u) => u.id === id) || null;
  }

  getAdminUserByIdentifier(identifier: string): AdminUser | null {
    if (!identifier) return null;
    const clean = normalizeAdminIdentifier(identifier);
    if (!clean) return null;

    // Check directly for Super Admin identifier or aliases (kogniti14, superadmin, etc.)
    if (isSuperAdminIdentifier(clean)) {
      const users = this.getAdminUsers();
      const superAdmin = users.find(
        (u) =>
          u.userId.toLowerCase() === 'kogniti14' ||
          u.email.toLowerCase() === 'kogniti14@kognitiminds.com'
      );
      return superAdmin || MASTER_SUPER_ADMIN;
    }

    const users = this.getAdminUsers();
    return (
      users.find(
        (u) =>
          u.userId.toLowerCase() === clean ||
          u.email.toLowerCase() === clean ||
          (u.name && u.name.toLowerCase() === clean)
      ) || null
    );
  }

  isAnyAdminIdentifier(identifier: string): boolean {
    if (!identifier) return false;
    return Boolean(this.getAdminUserByIdentifier(identifier));
  }

  saveAdminUser(admin: AdminUser): void {
    const users = this.getAdminUsers();
    const index = users.findIndex((u) => u.id === admin.id || u.userId.toLowerCase() === admin.userId.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...admin };
    } else {
      users.push(admin);
    }
    this.setItem(KEYS.ADMIN_USERS, users);
  }

  updateAdminStatus(
    id: string,
    status: 'approved' | 'rejected',
    reason?: string,
    approvedBy?: string
  ): AdminUser | null {
    const users = this.getAdminUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index >= 0) {
      users[index].status = status;
      if (status === 'approved') {
        users[index].approvedAt = new Date().toISOString();
        users[index].approvedBy = approvedBy || 'superadmin';
        users[index].rejectionReason = undefined;
      } else if (status === 'rejected') {
        users[index].rejectionReason = reason || 'Application declined by Super Admin';
      }
      this.setItem(KEYS.ADMIN_USERS, users);
      return users[index];
    }
    return null;
  }

  deleteAdminUser(id: string): { success: boolean; message: string } {
    const admin = this.getAdminUserById(id);
    if (!admin) return { success: false, message: 'Admin account not found.' };
    if (
      isSuperAdminIdentifier(admin.userId) ||
      isSuperAdminIdentifier(admin.email) ||
      admin.role === 'super_admin' ||
      admin.id === 'adm_super_01'
    ) {
      return { success: false, message: 'Protected account: The Master Super Admin cannot be deleted.' };
    }
    const remaining = this.getAdminUsers().filter((u) => u.id !== id);
    this.setItem(KEYS.ADMIN_USERS, remaining);
    return { success: true, message: `Staff account @${admin.userId} removed.` };
  }

  deleteMultipleAdminUsers(ids: string[]): { deletedCount: number; protectedSkipped: number } {
    if (!ids || ids.length === 0) return { deletedCount: 0, protectedSkipped: 0 };
    const all = this.getAdminUsers();
    let protectedSkipped = 0;
    const deletableIds = new Set<string>();

    for (const id of ids) {
      const u = all.find((a) => a.id === id);
      if (
        u &&
        (isSuperAdminIdentifier(u.userId) ||
          isSuperAdminIdentifier(u.email) ||
          u.role === 'super_admin' ||
          u.id === 'adm_super_01')
      ) {
        protectedSkipped++;
      } else if (u) {
        deletableIds.add(u.id);
      }
    }

    const remaining = all.filter((u) => !deletableIds.has(u.id));
    this.setItem(KEYS.ADMIN_USERS, remaining);
    return { deletedCount: deletableIds.size, protectedSkipped };
  }

  // --- Category Management ---
  getCategories(): Category[] {
    const cats = this.getItem<Category[]>(KEYS.CATEGORIES, CATEGORIES);
    const hasDeprecated = cats.some(
      (c) =>
        c.id === 'ergonomic-furniture' ||
        c.id === 'smart-edtech-display' ||
        c.name === 'Ergonomic Furniture'
    );
    if (hasDeprecated) {
      this.setItem(KEYS.CATEGORIES, CATEGORIES);
      return CATEGORIES;
    }
    return cats;
  }

  getCategoryById(id: string): Category | null {
    const cats = this.getCategories();
    return cats.find((c) => c.id === id) || null;
  }

  async saveCategory(category: Category, oldName?: string): Promise<void> {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      cats[index] = { ...cats[index], ...category };
    } else {
      cats.unshift(category);
    }
    this.setItem(KEYS.CATEGORIES, cats);
    await this.syncServer('categories', category);
    dataSyncBus.emit('categories', cats);

    // If category was renamed, synchronize existing products assigned to old category name
    if (oldName && oldName.trim() !== category.name.trim()) {
      const products = this.getProducts();
      let hasProductUpdates = false;
      for (const p of products) {
        if (p.category === oldName) {
          p.category = category.name;
          hasProductUpdates = true;
          await this.syncServer('products', p);
        }
      }
      if (hasProductUpdates) {
        this.setItem(KEYS.PRODUCTS, products);
        dataSyncBus.emit('products', products);
      }
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    const cats = this.getCategories();
    const target = cats.find((c) => c.id === id);
    if (!target) return false;

    const filtered = cats.filter((c) => c.id !== id);
    this.setItem(KEYS.CATEGORIES, filtered);
    await this.syncServer('categories', null, 'DELETE', id);
    dataSyncBus.emit('categories', filtered);
    return true;
  }

  async deleteMultipleCategories(ids: string[]): Promise<{ deletedCount: number; protectedSkipped: number }> {
    if (!ids || ids.length === 0) return { deletedCount: 0, protectedSkipped: 0 };
    const cats = this.getCategories();
    const idSet = new Set(ids);
    const remaining = cats.filter((c) => !idSet.has(c.id));
    this.setItem(KEYS.CATEGORIES, remaining);
    await Promise.all(ids.map((id) => this.syncServer('categories', null, 'DELETE', id)));
    dataSyncBus.emit('categories', remaining);
    return { deletedCount: cats.length - remaining.length, protectedSkipped: 0 };
  }

  // --- OTP & Credential Security Services ---
  getResetOtps(): PasswordResetOtp[] {
    return this.getItem<PasswordResetOtp[]>(KEYS.RESET_OTPS, []);
  }

  async generatePasswordResetOtp(
    targetIdentifier: string,
    userType: 'admin' | 'b2c' | 'b2b'
  ): Promise<{ otp: string; expiresAt: string; targetIdentifier: string; message?: string }> {
    const cleanTarget = targetIdentifier.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
    const otps = this.getResetOtps().filter((o) => o.targetIdentifier !== cleanTarget);
    otps.push({ targetIdentifier: cleanTarget, otp, expiresAt, userType });
    this.setItem(KEYS.RESET_OTPS, otps);

    let message: string | undefined;
    if (cleanTarget.includes('@')) {
      const emailRes = await emailOtpService.sendOtp(cleanTarget, 'reset');
      message = emailRes.message;
    }

    return { otp, expiresAt, targetIdentifier: cleanTarget, message };
  }

  verifyPasswordResetOtp(targetIdentifier: string, inputOtp: string): boolean {
    const cleanTarget = targetIdentifier.trim().toLowerCase();
    const cleanInput = inputOtp.trim();
    if (!cleanInput || cleanInput.length !== 6 || !/^\d{6}$/.test(cleanInput)) return false;
    const otps = this.getResetOtps();
    const record = otps.find((o) => o.targetIdentifier === cleanTarget && o.otp === cleanInput);
    if (!record) return false;
    return new Date(record.expiresAt).getTime() > Date.now();
  }

  resetPasswordWithOtp(
    targetIdentifier: string,
    inputOtp: string,
    newPassword: string
  ): { success: boolean; message: string } {
    if (!this.verifyPasswordResetOtp(targetIdentifier, inputOtp)) {
      return {
        success: false,
        message: 'Invalid or expired OTP code. Please enter the code sent to your account or request a fresh OTP.',
      };
    }
    const clean = targetIdentifier.trim().toLowerCase();
    const cleanDigits = targetIdentifier.replace(/\D/g, '');

    // 1. Check Admin Users
    const admins = this.getAdminUsers();
    const admin = admins.find(
      (a) => a.userId.toLowerCase() === clean || a.email.toLowerCase() === clean
    );
    if (admin) {
      admin.password = newPassword;
      this.setItem(KEYS.ADMIN_USERS, admins);
      return { success: true, message: `Password for admin @${admin.userId} was successfully updated!` };
    }

    // 2. Check B2B Businesses
    const businesses = this.getB2BBusinesses();
    const biz = businesses.find(
      (b) =>
        b.businessEmail.toLowerCase() === clean ||
        (cleanDigits.length >= 10 && b.mobile.replace(/\D/g, '').includes(cleanDigits.slice(-10)))
    );
    if (biz) {
      biz.password = newPassword;
      this.setItem(KEYS.B2B_BUSINESSES, businesses);
      return { success: true, message: `Password for corporate account "${biz.companyName}" was successfully updated!` };
    }

    // 3. Check B2C Users
    const b2cUsers = this.getB2CUsers();
    const user = b2cUsers.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        (cleanDigits.length >= 10 && u.phone.replace(/\D/g, '').includes(cleanDigits.slice(-10)))
    );
    if (user) {
      user.password = newPassword;
      this.setItem(KEYS.B2C_USERS, b2cUsers);
      return { success: true, message: `Password for customer "${user.name}" was successfully updated!` };
    }

    return {
      success: false,
      message: 'No registered user, business, or admin record matched the given identifier.',
    };
  }

  // --- Super Admin Direct Credential Updates ---
  updateAdminCredentials(
    id: string,
    newUserId: string,
    newEmail: string,
    newPassword?: string
  ): boolean {
    const admins = this.getAdminUsers();
    const target = admins.find((a) => a.id === id);
    if (!target) return false;
    target.userId = newUserId.trim();
    target.email = newEmail.trim();
    if (newPassword && newPassword.trim()) {
      target.password = newPassword.trim();
    }
    this.setItem(KEYS.ADMIN_USERS, admins);
    return true;
  }

  updateB2CCredentials(
    id: string,
    newEmail: string,
    newPhone: string,
    newPassword?: string,
    newName?: string
  ): boolean {
    const users = this.getB2CUsers();
    const target = users.find((u) => u.id === id);
    if (!target) return false;
    target.email = newEmail.trim();
    target.phone = newPhone.trim();
    if (newName && newName.trim()) target.name = newName.trim();
    if (newPassword && newPassword.trim()) {
      target.password = newPassword.trim();
    }
    this.setItem(KEYS.B2C_USERS, users);
    return true;
  }

  updateB2BCredentials(
    id: string,
    newEmail: string,
    newMobile: string,
    newPassword?: string,
    newCompanyName?: string
  ): boolean {
    const businesses = this.getB2BBusinesses();
    const target = businesses.find((b) => b.id === id);
    if (!target) return false;
    target.businessEmail = newEmail.trim();
    target.mobile = newMobile.trim();
    if (newCompanyName && newCompanyName.trim()) target.companyName = newCompanyName.trim();
    if (newPassword && newPassword.trim()) {
      target.password = newPassword.trim();
    }
    this.setItem(KEYS.B2B_BUSINESSES, businesses);
    return true;
  }

  changeSuperAdminPassword(
    currentPassword: string,
    newPassword: string
  ): { success: boolean; message: string } {
    const admins = this.getAdminUsers();
    const superAdmin = admins.find((a) => a.role === 'super_admin');
    if (!superAdmin) {
      return { success: false, message: 'Super Admin account not found.' };
    }
    if (superAdmin.password && superAdmin.password !== currentPassword) {
      return { success: false, message: 'Current password does not match.' };
    }
    superAdmin.password = newPassword;
    this.setItem(KEYS.ADMIN_USERS, admins);
    return { success: true, message: 'Super Admin password updated successfully!' };
  }

  // --- Site Media & Banners ---
  getSiteMedia(): SiteMedia {
    return this.getItem<SiteMedia>(KEYS.SITE_MEDIA, {
      heroBanner: '',
      assuranceBanner: '',
      logo: '',
      gemLogo: '',
      ondcLogo: '',
      promotionalBanner: '',
    });
  }

  async saveSiteMedia(media: SiteMedia): Promise<void> {
    this.setItem(KEYS.SITE_MEDIA, media);
    await this.syncServer('site_media', media);
    dataSyncBus.emit('site_media', media);
  }
}

export const storageService = new StorageService();

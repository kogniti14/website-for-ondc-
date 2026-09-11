import {
  Product,
  B2CUser,
  B2BBusiness,
  B2COrder,
  B2BOrder,
  B2BQuotation,
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
} from '../types';
import { MOCK_PRODUCTS, MOCK_COUPONS, CATEGORIES } from '../data/mockProducts';

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

// Initial Seed Data
const SEED_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm_super_01',
    userId: 'superadmin',
    name: 'Kogniti Super Admin',
    email: 'superadmin@kognitiminds.com',
    password: 'SuperAdmin@2026#',
    role: 'super_admin',
    department: 'Executive Leadership & Governance',
    status: 'approved',
    registeredAt: '2026-08-01T09:00:00Z',
    approvedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'adm_ops_02',
    userId: 'admin_ops',
    name: 'Rohan Sharma (Operations)',
    email: 'admin@kognitiminds.com',
    password: 'OpsAdmin@2026#',
    role: 'operations_admin',
    department: 'Fulfillment & Logistics',
    status: 'approved',
    registeredAt: '2026-08-10T10:30:00Z',
    approvedAt: '2026-08-10T11:00:00Z',
  },
  {
    id: 'adm_catalog_03',
    userId: 'admin_catalog',
    name: 'Priya Patel (Catalog)',
    email: 'catalog@kognitiminds.com',
    password: 'CatalogLead@2026#',
    role: 'catalog_manager',
    department: 'Product & Catalog Management',
    status: 'approved',
    registeredAt: '2026-08-12T14:15:00Z',
    approvedAt: '2026-08-12T15:00:00Z',
  },
  {
    id: 'adm_fin_04',
    userId: 'admin_finance',
    name: 'Amit Verma (Finance)',
    email: 'finance@kognitiminds.com',
    password: 'FinanceAdmin@2026#',
    role: 'finance_admin',
    department: 'Accounts, GST & Credit Control',
    status: 'approved',
    registeredAt: '2026-08-15T09:00:00Z',
    approvedAt: '2026-08-15T09:30:00Z',
  },
];

const SEED_B2C_USERS: B2CUser[] = [
  {
    id: 'b2c_user_01',
    name: 'Utkarsh Sharma',
    email: 'customer@kognitiminds.com',
    phone: '+91 98765 43210',
    password: 'Customer@123',
    addresses: [
      {
        id: 'addr_01',
        fullName: 'Utkarsh Sharma',
        phone: '+91 98765 43210',
        street: 'Flat 402, Green Glen Layout, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        isDefault: true,
        addressType: 'home',
      },
    ],
    createdAt: '2026-08-15T10:00:00Z',
  },
];

const SEED_B2B_BUSINESSES: B2BBusiness[] = [
  {
    id: 'biz_edutech',
    companyName: 'EduTech Solutions Private Limited',
    contactPerson: 'Vikram Malhotra',
    businessEmail: 'procurement@edutech.in',
    mobile: '+91 98111 22334',
    password: 'b2b123',
    gstin: '29AAACE1234F1Z8',
    pan: 'AAACE1234F',
    businessType: 'Education / School',
    status: 'approved',
    creditLimit: 1500000,
    paymentTerms: 'Net 30',
    accountManager: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@kognitiminds.com',
      phone: '+91 9931648595',
      designation: 'Senior Institutional Key Account Manager',
    },
    registeredAt: '2026-08-01T10:00:00Z',
    approvedAt: '2026-08-02T14:30:00Z',
    billingAddress: {
      id: 'addr_b2b_01_bill',
      fullName: 'EduTech Solutions Pvt Ltd (Finance)',
      phone: '+91 98111 22334',
      street: 'Plot 45, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      addressType: 'work',
      isDefault: true,
    },
    shippingAddress: {
      id: 'addr_b2b_01_ship',
      fullName: 'EduTech Solutions Central Campus Warehouse',
      phone: '+91 98111 22334',
      street: 'Gate 2, EduTech Campus, Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      addressType: 'work',
      isDefault: true,
    },
    documents: [
      {
        name: 'GST_Certificate_29AAACE1234F1Z8.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-08-01T10:05:00Z',
        status: 'verified',
      },
      {
        name: 'PAN_Card_Corporate.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-08-01T10:06:00Z',
        status: 'verified',
      },
    ],
  },
  {
    id: 'biz_innovate',
    companyName: 'Innovate Workspace Hub LLP',
    contactPerson: 'Pooja Verma',
    businessEmail: 'admin@innovatetech.co',
    mobile: '+91 97222 33445',
    password: 'b2b123',
    gstin: '07AABCI5678G1ZP',
    pan: 'AABCI5678G',
    businessType: 'Co-Working & Real Estate',
    status: 'pending',
    creditLimit: 500000,
    paymentTerms: 'Prepaid',
    accountManager: {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@kognitiminds.com',
      phone: '+91 9931648595',
      designation: 'Senior Institutional Key Account Manager',
    },
    registeredAt: '2026-09-08T09:15:00Z',
    billingAddress: {
      id: 'addr_b2b_02_bill',
      fullName: 'Innovate Workspace Hub LLP',
      phone: '+91 97222 33445',
      street: 'Tower B, Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      addressType: 'work',
      isDefault: true,
    },
    shippingAddress: {
      id: 'addr_b2b_02_ship',
      fullName: 'Innovate Hub Logistics Dock',
      phone: '+91 97222 33445',
      street: 'Basement Level 2 Freight Bay, Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      addressType: 'work',
      isDefault: true,
    },
    documents: [
      {
        name: 'GST_Reg_Innovate_07AABCI5678G1ZP.pdf',
        type: 'application/pdf',
        uploadedAt: '2026-09-08T09:20:00Z',
        status: 'pending',
      },
    ],
  },
];

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

  // --- Products ---
  getProducts(): Product[] {
    const products = this.getItem<Product[]>(KEYS.PRODUCTS, MOCK_PRODUCTS);
    const hasDeprecated = products.some(
      (p) =>
        p.id === 'km-ergo-01' ||
        p.id === 'km-ifp-75' ||
        p.category === 'Ergonomic Furniture' ||
        p.category === 'Smart EdTech & Display'
    );
    if (hasDeprecated) {
      this.setItem(KEYS.PRODUCTS, MOCK_PRODUCTS);
      return MOCK_PRODUCTS;
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

    return products;
  }

  getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  saveProduct(product: Product): void {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.unshift(product);
    }
    this.setItem(KEYS.PRODUCTS, products);
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    this.setItem(KEYS.PRODUCTS, products);
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
  }

  updateBusinessStatus(id: string, status: B2BBusiness['status'], reason?: string): void {
    const list = this.getB2BBusinesses();
    const target = list.find((b) => b.id === id);
    if (target) {
      target.status = status;
      if (reason) target.statusReason = reason;
      if (status === 'approved') target.approvedAt = new Date().toISOString();
      this.setItem(KEYS.B2B_BUSINESSES, list);
    }
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
    }
    this.setItem(KEYS.B2C_ORDERS, orders);
  }

  updateB2COrderStatus(id: string, status: B2COrder['orderStatus'], note?: string): void {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.orderStatus = status;
      order.statusTimeline.push({
        status: status.replace('_', ' ').toUpperCase(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        note: note || `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
      });
      this.setItem(KEYS.B2C_ORDERS, orders);
    }
  }

  confirmB2COrder(id: string, adminName: string): B2COrder | null {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    order.confirmedBy = adminName;
    order.statusTimeline.push({
      status: 'ORDER CONFIRMED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `Order confirmed by ${adminName}. Proceeding to packaging and dispatch.`,
    });
    this.setItem(KEYS.B2C_ORDERS, orders);
    return order;
  }

  rejectB2COrder(id: string, adminName: string, reason?: string): B2COrder | null {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = 'rejected';
    order.rejectionReason = reason || 'Order rejected during admin verification';
    order.rejectedAt = new Date().toISOString();
    order.rejectedBy = adminName;
    order.statusTimeline.push({
      status: 'ORDER REJECTED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `Order rejected by ${adminName}. Reason: ${reason || 'Not specified'}`,
    });
    this.setItem(KEYS.B2C_ORDERS, orders);
    return order;
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
    }
    this.setItem(KEYS.B2B_ORDERS, orders);
  }

  updateB2BOrderStatus(id: string, status: B2BOrder['orderStatus'], note?: string): void {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.orderStatus = status;
      order.statusTimeline.push({
        status: status.replace('_', ' ').toUpperCase(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        note: note || `Status updated to ${status.replace('_', ' ').toUpperCase()}`,
      });
      this.setItem(KEYS.B2B_ORDERS, orders);
    }
  }

  confirmB2BOrder(id: string, adminName: string): B2BOrder | null {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = 'confirmed';
    order.confirmedAt = new Date().toISOString();
    order.confirmedBy = adminName;
    order.statusTimeline.push({
      status: 'ORDER CONFIRMED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `B2B purchase order verified and confirmed by ${adminName}. Proceeding to wholesale allocation.`,
    });
    this.setItem(KEYS.B2B_ORDERS, orders);
    return order;
  }

  rejectB2BOrder(id: string, adminName: string, reason?: string): B2BOrder | null {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) return null;

    order.orderStatus = 'rejected';
    order.rejectionReason = reason || 'PO rejected by administration';
    order.rejectedAt = new Date().toISOString();
    order.rejectedBy = adminName;
    order.statusTimeline.push({
      status: 'ORDER REJECTED',
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      note: `B2B Order rejected by ${adminName}. Reason: ${reason || 'Not specified'}`,
    });
    this.setItem(KEYS.B2B_ORDERS, orders);
    return order;
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
  }

  deleteB2BQuotation(id: string): void {
    const quotations = this.getB2BQuotations().filter((q) => q.id !== id);
    this.setItem(KEYS.B2B_QUOTATIONS, quotations);
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

  saveCoupon(coupon: Coupon): void {
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
  }

  deleteCoupon(idOrCode: string): void {
    const coupons = this.getCoupons().filter(
      (c) => c.id !== idOrCode && c.code.toUpperCase() !== idOrCode.toUpperCase()
    );
    this.setItem(KEYS.COUPONS, coupons);
  }

  toggleCouponStatus(idOrCode: string): void {
    const coupons = this.getCoupons();
    const c = coupons.find((item) => item.id === idOrCode || item.code.toUpperCase() === idOrCode.toUpperCase());
    if (c) {
      c.isActive = !c.isActive;
      this.setItem(KEYS.COUPONS, coupons);
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
    return this.getItem<AdminUser[]>(KEYS.ADMIN_USERS, SEED_ADMIN_USERS);
  }

  getAdminUserById(id: string): AdminUser | null {
    const users = this.getAdminUsers();
    return users.find((u) => u.id === id) || null;
  }

  getAdminUserByIdentifier(identifier: string): AdminUser | null {
    const users = this.getAdminUsers();
    const clean = identifier.trim().toLowerCase();
    return (
      users.find(
        (u) => u.userId.toLowerCase() === clean || u.email.toLowerCase() === clean
      ) || null
    );
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

  saveCategory(category: Category, oldName?: string): void {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      cats[index] = { ...cats[index], ...category };
    } else {
      cats.unshift(category);
    }
    this.setItem(KEYS.CATEGORIES, cats);

    // If category was renamed, synchronize existing products assigned to old category name
    if (oldName && oldName.trim() !== category.name.trim()) {
      const products = this.getProducts();
      let hasProductUpdates = false;
      products.forEach((p) => {
        if (p.category === oldName) {
          p.category = category.name;
          hasProductUpdates = true;
        }
      });
      if (hasProductUpdates) {
        this.setItem(KEYS.PRODUCTS, products);
      }
    }
  }

  deleteCategory(id: string): boolean {
    const cats = this.getCategories();
    const target = cats.find((c) => c.id === id);
    if (!target) return false;

    const filtered = cats.filter((c) => c.id !== id);
    this.setItem(KEYS.CATEGORIES, filtered);
    return true;
  }

  // --- OTP & Credential Security Services ---
  getResetOtps(): PasswordResetOtp[] {
    return this.getItem<PasswordResetOtp[]>(KEYS.RESET_OTPS, []);
  }

  generatePasswordResetOtp(
    targetIdentifier: string,
    userType: 'admin' | 'b2c' | 'b2b'
  ): { otp: string; expiresAt: string; targetIdentifier: string } {
    const cleanTarget = targetIdentifier.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins
    const otps = this.getResetOtps().filter((o) => o.targetIdentifier !== cleanTarget);
    otps.push({ targetIdentifier: cleanTarget, otp, expiresAt, userType });
    this.setItem(KEYS.RESET_OTPS, otps);
    return { otp, expiresAt, targetIdentifier: cleanTarget };
  }

  verifyPasswordResetOtp(targetIdentifier: string, inputOtp: string): boolean {
    const cleanTarget = targetIdentifier.trim().toLowerCase();
    const cleanInput = inputOtp.trim();
    if (cleanInput === '123456') return true; // Master developer bypass code
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

  saveSiteMedia(media: SiteMedia): void {
    this.setItem(KEYS.SITE_MEDIA, media);
  }
}

export const storageService = new StorageService();

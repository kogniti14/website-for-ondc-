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
} from '../types';
import { MOCK_PRODUCTS, MOCK_COUPONS, CATEGORIES } from '../data/mockProducts';

const KEYS = {
  PRODUCTS: 'km_products_v1',
  CATEGORIES: 'km_categories_v1',
  B2C_USERS: 'km_b2c_users_v1',
  B2B_BUSINESSES: 'km_b2b_businesses_v1',
  B2C_ORDERS: 'km_b2c_orders_v1',
  B2B_ORDERS: 'km_b2b_orders_v1',
  B2B_QUOTATIONS: 'km_b2b_quotations_v1',
  B2C_CART: 'km_b2c_cart_v1',
  B2B_CART: 'km_b2b_cart_v1',
  B2C_WISHLIST: 'km_b2c_wishlist_v1',
  COUPONS: 'km_coupons_v1',
  ADMIN_USERS: 'km_admin_users_v1',
  RESET_OTPS: 'km_reset_otps_v1',
  CURRENT_USER_SESSION: 'km_user_session_v1',
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
    approvedBy: 'System Root',
  },
  {
    id: 'adm_ops_02',
    userId: 'admin_ops',
    name: 'Aarav Patel',
    email: 'admin@kognitiminds.com',
    password: 'AdminOps@123',
    role: 'operations_admin',
    department: 'Fulfillment & Logistics',
    status: 'approved',
    registeredAt: '2026-08-15T11:00:00Z',
    approvedAt: '2026-08-16T10:00:00Z',
    approvedBy: 'superadmin',
  },
  {
    id: 'adm_pending_03',
    userId: 'admin_neha',
    name: 'Neha Sharma',
    email: 'neha.sharma@kognitiminds.com',
    password: 'NehaAdmin@123',
    role: 'catalog_manager',
    department: 'Product Merchandising & Pricing',
    status: 'pending',
    registeredAt: '2026-09-07T14:20:00Z',
  },
];
const SEED_B2C_USERS: B2CUser[] = [
  {
    id: 'usr_b2c_demo',
    name: 'Utkarsh Sharma',
    email: 'customer@kognitiminds.com',
    phone: '+91 98765 43210',
    password: 'Customer@123',
    createdAt: '2026-08-01T10:00:00Z',
    addresses: [
      {
        id: 'addr_1',
        fullName: 'Utkarsh Sharma',
        phone: '+91 98765 43210',
        street: 'Flat 402, Green Glen Layout, Outer Ring Road',
        apartment: 'Prestige Ivy League',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560103',
        isDefault: true,
        addressType: 'home',
      },
      {
        id: 'addr_2',
        fullName: 'Utkarsh Sharma',
        phone: '+91 98765 43210',
        street: 'Tower B, 6th Floor, DLF Cyber City',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122002',
        isDefault: false,
        addressType: 'work',
      },
    ],
  },
];

const SEED_B2B_BUSINESSES: B2BBusiness[] = [
  {
    id: 'biz_edutech',
    companyName: 'EduTech Solutions Private Limited',
    contactPerson: 'Vikram Malhotra',
    businessEmail: 'procurement@edutech.in',
    mobile: '+91 98111 22334',
    password: 'B2bEdu@123',
    gstin: '29AAACE1234F1Z8',
    pan: 'AAACE1234F',
    businessType: 'Education / School',
    status: 'approved',
    creditLimit: 500000,
    paymentTerms: 'Net 30',
    registeredAt: '2026-08-10T14:30:00Z',
    approvedAt: '2026-08-11T11:00:00Z',
    accountManager: {
      name: 'Rohan Saxena',
      email: 'rohan.saxena@kognitiminds.com',
      phone: '+91 99100 88221',
      designation: 'Sr. Institutional Client Partner',
    },
    billingAddress: {
      id: 'baddr_edu_bill',
      fullName: 'EduTech Solutions Private Limited',
      phone: '+91 98111 22334',
      street: 'EduTech Towers, Campus 3, Outer Ring Road',
      apartment: 'Phase 2, Marathahalli',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560037',
      addressType: 'work',
      isDefault: true,
    },
    shippingAddress: {
      id: 'baddr_edu_ship',
      fullName: 'EduTech Central Campus Warehouse',
      phone: '+91 98111 22334',
      street: 'Gate 4, EduTech International Campus, Hosur Road',
      apartment: 'Electronic City Phase 1',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      addressType: 'work',
      isDefault: true,
    },
    documents: [
      {
        name: 'GST_Registration_Certificate_29AAACE1234F1Z8.pdf',
        type: 'GST Certificate',
        uploadedAt: '2026-08-10T14:35:00Z',
        status: 'verified',
      },
      {
        name: 'Certificate_of_Incorporation_MCA.pdf',
        type: 'MCA Registration',
        uploadedAt: '2026-08-10T14:36:00Z',
        status: 'verified',
      },
    ],
  },
  {
    id: 'biz_innovate',
    companyName: 'Innovate Co-Working & Tech Hub LLP',
    contactPerson: 'Pooja Verma',
    businessEmail: 'admin@innovatetech.co',
    mobile: '+91 99887 76655',
    password: 'Innovate@123',
    gstin: '07AABCI5678K1Z2',
    pan: 'AABCI5678K',
    businessType: 'Co-Working & Real Estate',
    status: 'pending',
    statusReason: 'Under compliance verification by Kogniti B2B Desk (SLA: 24h)',
    creditLimit: 0,
    paymentTerms: 'Prepaid',
    registeredAt: '2026-09-07T16:45:00Z',
    accountManager: {
      name: 'Priya Nambiar',
      email: 'priya.nambiar@kognitiminds.com',
      phone: '+91 98200 44332',
      designation: 'B2B Onboarding Specialist',
    },
    billingAddress: {
      id: 'baddr_inno_bill',
      fullName: 'Innovate Co-Working LLP',
      phone: '+91 99887 76655',
      street: 'Block C, Barakhamba Road, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      addressType: 'work',
      isDefault: true,
    },
    shippingAddress: {
      id: 'baddr_inno_ship',
      fullName: 'Innovate Hub Sector 62 Facility',
      phone: '+91 99887 76655',
      street: 'Plot B-9, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      addressType: 'work',
      isDefault: true,
    },
    documents: [
      {
        name: 'GSTIN_Acknowledgment_07AABCI5678K1Z2.pdf',
        type: 'GST Form',
        uploadedAt: '2026-09-07T16:50:00Z',
        status: 'pending',
      },
    ],
  },
];

const SEED_B2C_ORDERS: B2COrder[] = [
  {
    id: 'b2c_ord_101',
    orderNumber: 'KM-B2C-2026-8941',
    customerName: 'Utkarsh Sharma',
    customerEmail: 'customer@kognitiminds.com',
    customerPhone: '+91 98765 43210',
    shippingAddress: SEED_B2C_USERS[0].addresses[0],
    billingAddress: SEED_B2C_USERS[0].addresses[0],
    items: [
      {
        productId: 'km-ergo-01',
        productName: 'Kogniti AeroFlex Pro Ergonomic Mesh Chair',
        sku: 'KM-CHAIR-AF01',
        image: 'https://images.unsplash.com/photo-1580481077195-77626359b35b?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unitPrice: 12499,
        mrp: 18999,
        hsn: '94013000',
        gstRate: 18,
        total: 12499,
      },
      {
        productId: 'km-eco-08',
        productName: 'Kogniti EcoCraft Executive Bamboo Desk Organizer Set',
        sku: 'KM-ECO-BAM08',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
        quantity: 1,
        unitPrice: 2299,
        mrp: 3499,
        hsn: '44219990',
        gstRate: 18,
        total: 2299,
      },
    ],
    subtotal: 14798,
    discount: 1480,
    couponCode: 'WELCOME10',
    gstAmount: 2031, // Included in price (approx 18% on taxable)
    shippingFee: 0,
    total: 13318,
    paymentMethod: 'upi',
    paymentStatus: 'paid',
    paymentDetails: {
      transactionId: 'UPI-RAZOR-90823412',
      upiId: 'utkarsh@oksbi',
    },
    orderStatus: 'shipped',
    trackingNumber: 'DEL-IN-893041920',
    courierPartner: 'Delhivery',
    createdAt: '2026-09-04T11:20:00Z',
    statusTimeline: [
      { status: 'Order Placed', timestamp: '2026-09-04 11:20 AM', note: 'Order placed via UPI Payment' },
      { status: 'Payment Confirmed', timestamp: '2026-09-04 11:21 AM', note: 'Payment verified: ₹13,318' },
      { status: 'Processing & QC', timestamp: '2026-09-04 02:40 PM', note: 'Goods allocated at Hosur Fulfilment Center' },
      { status: 'Packed', timestamp: '2026-09-05 09:15 AM', note: 'Double-wall carton with bubble wrap' },
      { status: 'Shipped', timestamp: '2026-09-05 04:30 PM', note: 'Handed over to Delhivery Express (AWB: DEL-IN-893041920)' },
    ],
  },
];

const SEED_B2B_ORDERS: B2BOrder[] = [
  {
    id: 'b2b_ord_201',
    orderNumber: 'KM-B2B-2026-0428',
    poNumber: 'PO-EDU-2026-089',
    businessId: 'biz_edutech',
    businessName: 'EduTech Solutions Private Limited',
    gstin: '29AAACE1234F1Z8',
    shippingAddress: SEED_B2B_BUSINESSES[0].shippingAddress,
    billingAddress: SEED_B2B_BUSINESSES[0].billingAddress,
    items: [
      {
        productId: 'km-ifp-75',
        productName: 'Kogniti VisionBoard 75" 4K Interactive Flat Panel',
        sku: 'KM-DISP-VB75',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
        quantity: 5,
        wholesalePrice: 112000,
        tierDiscountPercent: 6,
        effectiveUnitPrice: 105280,
        hsn: '85285200',
        gstRate: 18,
        total: 526400,
      },
      {
        productId: 'km-ergo-01',
        productName: 'Kogniti AeroFlex Pro Ergonomic Mesh Chair',
        sku: 'KM-CHAIR-AF01',
        image: 'https://images.unsplash.com/photo-1580481077195-77626359b35b?auto=format&fit=crop&w=400&q=80',
        quantity: 25,
        wholesalePrice: 8999,
        tierDiscountPercent: 8,
        effectiveUnitPrice: 8279,
        hsn: '94013000',
        gstRate: 18,
        total: 206975,
      },
    ],
    subtotal: 733375,
    bulkDiscountTotal: 51600,
    taxableAmount: 733375,
    cgst: 66003.75,
    sgst: 66003.75,
    igst: 0,
    totalGst: 132007.5,
    shippingFee: 0,
    grandTotal: 865382.5,
    paymentTerms: 'Net 30',
    paymentStatus: 'credit_approved',
    orderStatus: 'processing',
    trackingNumber: 'BLUEDART-FREIGHT-772910',
    courierPartner: 'Blue Dart Freight',
    createdAt: '2026-09-02T16:00:00Z',
    statusTimeline: [
      { status: 'PO Received', timestamp: '2026-09-02 04:00 PM', note: 'Purchase Order PO-EDU-2026-089 validated' },
      { status: 'Credit Approved', timestamp: '2026-09-02 05:15 PM', note: 'Net 30 terms approved against active credit line' },
      { status: 'Processing Allocation', timestamp: '2026-09-03 10:00 AM', note: 'Industrial staging at Bengaluru Warehouse 2' },
    ],
  },
];

const SEED_B2B_QUOTATIONS: B2BQuotation[] = [
  {
    id: 'rfq_301',
    rfqNumber: 'RFQ-KM-2026-104',
    businessId: 'biz_edutech',
    businessName: 'EduTech Solutions Private Limited',
    contactPerson: 'Vikram Malhotra',
    email: 'procurement@edutech.in',
    phone: '+91 98111 22334',
    productId: 'km-conf-04',
    productName: 'Kogniti OmniMeet 4K AI Conference Soundbar',
    sku: 'KM-AV-OM04',
    requestedQty: 30,
    targetUnitPrice: 24000,
    deliveryPincode: '560100',
    requiredByDate: '2026-09-25',
    specialRequirements:
      'Required for 30 hybrid tutorial rooms. Must include wall mounting hardware and extended 5m USB-C host cables.',
    status: 'quoted',
    submittedAt: '2026-09-06T10:15:00Z',
    adminQuotation: {
      quotedUnitPrice: 24225, // 15% tier discount
      totalTaxable: 726750,
      gstAmount: 130815,
      shippingCharges: 0,
      grandTotal: 857565,
      validUntil: '2026-09-30',
      adminNotes:
        'Official quotation approved for 30 units with complimentary 5m high-flex braided USB-C cables and priority installation support.',
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
    return this.getItem<Product[]>(KEYS.PRODUCTS, MOCK_PRODUCTS);
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
    return this.getItem<B2COrder[]>(KEYS.B2C_ORDERS, SEED_B2C_ORDERS);
  }

  getB2COrderById(id: string): B2COrder | undefined {
    return this.getB2COrders().find((o) => o.id === id);
  }

  saveB2COrder(order: B2COrder): void {
    const orders = this.getB2COrders();
    orders.unshift(order);
    this.setItem(KEYS.B2C_ORDERS, orders);
  }

  updateB2COrderStatus(id: string, status: B2COrder['orderStatus'], note?: string): void {
    const orders = this.getB2COrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.orderStatus = status;
      order.statusTimeline.push({
        status: status.replace('_', ' ').toUpperCase(),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        note: note || `Status updated to ${status}`,
      });
      this.setItem(KEYS.B2C_ORDERS, orders);
    }
  }

  // --- B2B Orders ---
  getB2BOrders(): B2BOrder[] {
    return this.getItem<B2BOrder[]>(KEYS.B2B_ORDERS, SEED_B2B_ORDERS);
  }

  getB2BOrderById(id: string): B2BOrder | undefined {
    return this.getB2BOrders().find((o) => o.id === id);
  }

  saveB2BOrder(order: B2BOrder): void {
    const orders = this.getB2BOrders();
    orders.unshift(order);
    this.setItem(KEYS.B2B_ORDERS, orders);
  }

  updateB2BOrderStatus(id: string, status: B2BOrder['orderStatus'], note?: string): void {
    const orders = this.getB2BOrders();
    const order = orders.find((o) => o.id === id);
    if (order) {
      order.orderStatus = status;
      order.statusTimeline.push({
        status: status.replace('_', ' ').toUpperCase(),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        note: note || `Status updated to ${status}`,
      });
      this.setItem(KEYS.B2B_ORDERS, orders);
    }
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
    return this.getItem<Coupon[]>(KEYS.COUPONS, MOCK_COUPONS);
  }

  saveCoupon(coupon: Coupon): void {
    const coupons = this.getCoupons();
    const index = coupons.findIndex((c) => c.code === coupon.code);
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    this.setItem(KEYS.COUPONS, coupons);
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
    return this.getItem<Category[]>(KEYS.CATEGORIES, CATEGORIES);
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
}

export const storageService = new StorageService();

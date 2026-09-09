export interface Product {
  id: string;
  name: string;
  tagline: string;
  sku: string;
  hsn: string;
  category: string;
  b2cMrp: number;
  b2cPrice: number;
  b2bWholesalePrice: number;
  b2bMoq: number;
  b2bDiscountSlabs: {
    minQty: number;
    maxQty?: number;
    discountPercent: number;
    label: string;
  }[];
  gstRate: number; // e.g. 18
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  images: string[];
  shortDescription: string;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  dimensions: string;
  weight: string;
  warranty: string;
  leadTimeDays: number;
}

export interface B2CAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  addressType: 'home' | 'work' | 'other';
}

export interface B2CUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: B2CAddress[];
  createdAt: string;
}

export interface B2BBusiness {
  id: string;
  companyName: string;
  contactPerson: string;
  businessEmail: string;
  mobile: string;
  gstin: string;
  pan: string;
  businessType:
    | 'Education / School'
    | 'Corporate Office'
    | 'Retailer / Reseller'
    | 'Healthcare / Hospital'
    | 'Co-Working & Real Estate'
    | 'Government / PSU'
    | 'Other';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  statusReason?: string;
  billingAddress: B2CAddress;
  shippingAddress: B2CAddress;
  documents: {
    name: string;
    type: string;
    uploadedAt: string;
    status: 'verified' | 'pending' | 'rejected';
  }[];
  creditLimit: number;
  paymentTerms: 'Prepaid' | 'Net 15' | 'Net 30';
  accountManager: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  registeredAt: string;
  approvedAt?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  isB2B: boolean;
  customNotes?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface OrderItemSummary {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  hsn: string;
  gstRate: number;
  total: number;
}

export interface B2COrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: B2CAddress;
  billingAddress: B2CAddress;
  optionalGstin?: string;
  items: OrderItemSummary[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  gstAmount: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentDetails: {
    transactionId?: string;
    upiId?: string;
    bankName?: string;
  };
  orderStatus:
    | 'placed'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  trackingNumber?: string;
  courierPartner?: 'Delhivery' | 'Blue Dart' | 'Shiprocket' | 'DTDC';
  createdAt: string;
  statusTimeline: {
    status: string;
    timestamp: string;
    note: string;
  }[];
}

export interface B2BOrderItemSummary {
  productId: string;
  productName: string;
  sku: string;
  image: string;
  quantity: number;
  wholesalePrice: number;
  tierDiscountPercent: number;
  effectiveUnitPrice: number;
  hsn: string;
  gstRate: number;
  total: number;
}

export interface B2BOrder {
  id: string;
  orderNumber: string;
  poNumber: string;
  businessId: string;
  businessName: string;
  gstin: string;
  shippingAddress: B2CAddress;
  billingAddress: B2CAddress;
  items: B2BOrderItemSummary[];
  subtotal: number;
  bulkDiscountTotal: number;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  shippingFee: number;
  grandTotal: number;
  paymentTerms: 'Prepaid' | 'Net 15' | 'Net 30';
  paymentStatus: 'paid' | 'pending_po_approval' | 'credit_approved';
  orderStatus:
    | 'placed'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled';
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
  statusTimeline: {
    status: string;
    timestamp: string;
    note: string;
  }[];
}

export interface B2BQuotation {
  id: string;
  rfqNumber: string;
  businessId: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  productId: string;
  productName: string;
  sku: string;
  requestedQty: number;
  targetUnitPrice: number;
  deliveryPincode: string;
  requiredByDate: string;
  specialRequirements: string;
  status: 'submitted' | 'quoted' | 'accepted' | 'rejected' | 'ordered';
  adminQuotation?: {
    quotedUnitPrice: number;
    totalTaxable: number;
    gstAmount: number;
    shippingCharges: number;
    grandTotal: number;
    validUntil: string;
    adminNotes: string;
    quotedAt: string;
  };
  submittedAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrderValue: number;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  count?: number;
  description?: string;
  image?: string;
  createdAt?: string;
}

export type AdminRole = 'super_admin' | 'operations_admin' | 'catalog_manager' | 'finance_admin';

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  password?: string;
  role: AdminRole;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export type UserRole = 'guest' | 'b2c' | 'b2b' | 'admin';

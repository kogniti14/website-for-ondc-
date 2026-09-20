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
  wholesalePrice?: number;
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
  password?: string;
  firebaseUid?: string;
  authProvider?: 'firebase_email' | 'firebase_google' | 'local' | 'email_otp';
  avatarUrl?: string;
  addresses: B2CAddress[];
  createdAt: string;
  policyAccepted?: boolean;
  policyAcceptedAt?: string;
  policyAcceptedVersion?: string;
}

export type B2BDocumentType =
  | 'gst_certificate'
  | 'msme_certificate'
  | 'msme_udyam'
  | 'moa'
  | 'aoa'
  | 'coi';

export interface B2BDocumentAttachment {
  id?: string;
  documentType: B2BDocumentType;
  name: string;
  originalFileName?: string;
  originalFilename?: string;
  storedFileName?: string;
  storedPath?: string;
  fileUrl?: string;
  documentUrl?: string;
  fileType?: string;
  mimeType?: string;
  fileSize: number;
  uploadedAt: string;
  updatedAt?: string;
  status?: 'pending' | 'under_review' | 'verified' | 'rejected' | 'requires_resubmission';
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected' | 'requires_resubmission';
  verificationNotes?: string;
  rejectionReason?: string;
  resubmissionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  lastAction?: 'approve' | 'reject' | 'request_resubmission' | 'replace' | 'upload';
  lastActionAt?: string;
  version?: number;
}

export interface B2BBusiness {
  id: string;
  companyName: string;
  legalName?: string;
  tradeName?: string;
  contactPerson: string;
  designation?: string;
  businessEmail: string;
  mobile: string;
  password?: string;
  firebaseUid?: string;
  authProvider?: 'firebase_email' | 'firebase_google' | 'local' | 'email_otp';
  avatarUrl?: string;
  gstin: string;
  pan: string;
  udyamNumber?: string;
  cin?: string;
  cinNumber?: string;
  createdAt?: string;
  policyAccepted?: boolean;
  policyAcceptedAt?: string;
  policyAcceptedVersion?: string;
  entityType?:
    | 'Private Limited Company'
    | 'Public Limited Company'
    | 'Limited Liability Partnership (LLP)'
    | 'Partnership Firm'
    | 'Sole Proprietorship'
    | 'Trust / NGO'
    | 'Government / PSU'
    | 'Other Corporate Entity';
  businessType:
    | 'Education / School'
    | 'Corporate Office'
    | 'Retailer / Reseller'
    | 'Healthcare / Hospital'
    | 'Co-Working & Real Estate'
    | 'Government / PSU'
    | 'Other';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';
  statusReason?: string;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected' | 'requires_resubmission';
  registeredAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  suspendedAt?: string;
  registeredAddress?: B2CAddress;
  billingAddress: B2CAddress;
  shippingAddress: B2CAddress;
  documents: {
    name: string;
    type: string;
    uploadedAt: string;
    updatedAt?: string;
    status: 'verified' | 'pending' | 'rejected' | 'under_review' | 'requires_resubmission';
    url?: string;
    fileUrl?: string;
    documentType?: string;
    originalFileName?: string;
    fileSize?: number;
    rejectionReason?: string;
    resubmissionReason?: string;
    reviewedBy?: string;
    reviewedAt?: string;
    version?: number;
  }[];
  kycDocuments?: {
    gstCertificate?: B2BDocumentAttachment;
    msmeCertificate?: B2BDocumentAttachment;
    moaDocument?: B2BDocumentAttachment;
    aoaDocument?: B2BDocumentAttachment;
    coiDocument?: B2BDocumentAttachment;
  } | B2BDocumentAttachment[] | any;
  creditLimit: number;
  paymentTerms: 'Prepaid' | 'Net 15' | 'Net 30';
  accountManager: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
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
  paymentMethod: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
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
    | 'cancelled'
    | 'rejected';
  rejectionReason?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
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

export interface B2BPaymentRecord {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMode: 'razorpay' | 'bank_transfer' | 'neft' | 'rtgs' | 'imps' | 'cheque' | 'other' | string;
  transactionReference?: string;
  transactionRef?: string;
  chequeNumber?: string;
  bankName?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface B2BOrder {
  id: string;
  orderNumber: string;
  poNumber: string;
  businessId: string;
  businessName: string;
  gstin: string;
  source?: 'web' | 'phone' | 'whatsapp' | 'email' | 'sales_rep' | 'direct_offline' | 'other';
  internalRemarks?: string;
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
  paymentTerms: string;
  paymentStatus:
    | 'paid'
    | 'partially_paid'
    | 'payment_due'
    | 'pending_po_approval'
    | 'credit_approved'
    | 'failed'
    | 'refunded';
  paymentMode?: 'razorpay' | 'bank_transfer' | 'neft' | 'rtgs' | 'imps' | 'cheque' | 'other' | string;
  amountPaid?: number;
  amountDue?: number;
  paymentRecords?: B2BPaymentRecord[];
  paymentDetails?: {
    transactionId: string;
    bankName?: string;
    upiId?: string;
  };
  orderStatus:
    | 'placed'
    | 'confirmed'
    | 'processing'
    | 'packed'
    | 'shipped'
    | 'out_for_delivery'
    | 'delivered'
    | 'cancelled'
    | 'rejected';
  status?: string;
  rejectionReason?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  trackingNumber?: string;
  courierPartner?: string;
  createdAt: string;
  statusTimeline: {
    status: string;
    timestamp: string;
    note: string;
  }[];
}

export interface B2BQuotationItem {
  productId?: string;
  productName: string;
  sku?: string;
  hsn?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountPercent?: number;
  gstRate: number;
  taxableAmount?: number;
  taxableValue?: number;
  gstAmount: number;
  total: number;
}

export interface B2BQuotation {
  id: string;
  rfqNumber: string;
  businessId?: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress?: B2CAddress;
  shippingAddress?: B2CAddress;
  gstin?: string;
  items?: B2BQuotationItem[];
  productId?: string;
  productName?: string;
  sku?: string;
  requestedQty?: number;
  targetUnitPrice?: number;
  deliveryPincode?: string;
  requiredByDate?: string;
  specialRequirements?: string;
  status:
    | 'draft'
    | 'quoted'
    | 'submitted'
    | 'under_review'
    | 'revision_requested'
    | 'revised_quoted'
    | 'accepted'
    | 'rejected'
    | 'expired'
    | 'converted_to_order'
    | 'ordered';
  subtotal?: number;
  discount?: number;
  taxableAmount?: number;
  gstAmount?: number;
  shippingCharges?: number;
  grandTotal?: number;
  paymentTerms?: string;
  deliveryTerms?: string;
  deliveryTimeline?: string;
  adminRemarks?: string;
  notes?: string;
  originalRequest?: {
    productName?: string;
    requestedQty: number;
    targetUnitPrice: number;
    deliveryPincode?: string;
    specialRequirements?: string;
    notes?: string;
    submittedAt?: string;
    items?: { productName: string; quantity: number; targetUnitPrice?: number }[];
  };
  revisions?: {
    revisedAt: string;
    revisedBy: string;
    previousGrandTotal?: number;
    newGrandTotal: number;
    remarks?: string;
  }[];
  convertedOrderId?: string;
  convertedAt?: string;
  convertedBy?: string;
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
  submittedAt?: string;
  createdAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit?: number;
  usageCount?: number;
  perUserLimit?: number;
  isActive: boolean;
  description: string;
  createdAt: string;
  createdBy?: string;
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

export interface AdminPermissions {
  canManageCoupons?: boolean;
  canConfirmOrders?: boolean;
  canRejectOrders?: boolean;
  canManageProducts?: boolean;
  canManageUsers?: boolean;
  canManageStories?: boolean; // upload success stories, image, pdf
  canUploadCertifications?: boolean; // upload certificates (pdf, images)
  canEditCertifications?: boolean; // edit certificates & validity
  canDeleteCertifications?: boolean; // delete certificates
}

export type AdminRole = 'super_admin' | 'operations_admin' | 'catalog_manager' | 'finance_admin';

export interface AdminUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  password?: string;
  firebaseUid?: string;
  authProvider?: 'firebase_email' | 'firebase_google' | 'local' | 'email_otp';
  avatarUrl?: string;
  role: AdminRole;
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  registeredAt: string;
  approvedAt?: string;
  approvedBy?: string;
  permissions?: AdminPermissions;
}

export type UserRole = 'guest' | 'b2c' | 'b2b' | 'admin';

export interface PasswordResetOtp {
  targetIdentifier: string;
  otp: string;
  expiresAt: string;
  userType: 'admin' | 'b2c' | 'b2b';
}

export interface SiteMedia {
  heroBanner?: string;
  assuranceBanner?: string;
  logo?: string;
  gemLogo?: string;
  ondcLogo?: string;
  promotionalBanner?: string;
}

// --- Image Gallery & Success Stories CMS Types ---
export type GalleryVisibility = 'both' | 'b2b' | 'b2c';
export type GalleryStatus = 'published' | 'draft' | 'unpublished';

export interface GalleryStory {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  documentUrl?: string; // Optional PDF case study / brochure
  fileType?: 'image' | 'pdf'; // Primary media type
  storagePath?: string;
  imageAlt: string;
  category: string;
  visibility: GalleryVisibility;
  status: GalleryStatus;
  featured: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  publishedAt?: string;
}

export interface GalleryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// --- Certification Management Module Types ---
export type CertificationVisibility = 'both' | 'b2b' | 'b2c';
export type CertificationStatus = 'published' | 'draft' | 'unpublished';
export type ValidityStatus = 'active' | 'expired' | 'upcoming';

export interface CompanyCertification {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  category: string;
  issuingAuthority: string;
  certificateNumber?: string;
  issueDate: string; // YYYY-MM-DD
  expiryDate?: string | null; // YYYY-MM-DD or null
  noExpiry: boolean;
  verificationUrl?: string;
  fileUrl: string;
  storagePath?: string;
  fileType: string; // 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp'
  thumbnailUrl?: string;
  visibility: CertificationVisibility;
  status: CertificationStatus;
  featured: boolean;
  allowDownload: boolean;
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  publishedAt?: string;
}

export interface CertificationCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PolicyUpdateRecord {
  id: string;
  policyId: 'terms' | 'privacy' | 'refund' | 'shipping';
  policyName: string;
  versionNumber: string;
  previousVersion: string;
  newVersion: string;
  updatedAt: string;
  changeSummary: string;
  notificationStatus: 'pending' | 'sent' | 'partially_sent' | 'failed' | 'not_required';
  recipientsCount: number;
  recipientsDelivered: string[];
  isPublished: boolean;
  error?: string;
}


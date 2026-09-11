import React, { useState } from 'react';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Building2,
  FileText,
  Tag,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Truck,
  TrendingUp,
  ShieldCheck,
  Clock,
  Send,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  UserCheck,
  UserX,
  Shield,
  FolderTree,
  KeyRound,
  Copy,
  Check,
  Search,
  Image as ImageIcon,
  CreditCard,
  RefreshCw,
  Percent,
  Calendar,
  Filter,
  X,
  Phone,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { Product, B2COrder, B2BOrder, B2BBusiness, B2BQuotation, Coupon, AdminUser, Category, B2CUser, SiteMedia, B2BOrderItemSummary, OrderItemSummary, B2BQuotationItem, B2BPaymentRecord, B2CAddress } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { OrderInvoiceModal } from '../../components/common/OrderInvoiceModal';
import { isFirebaseConfigured } from '../../services/firebase';
import { ImageUpload } from '../../components/common/ImageUpload';
import { razorpayService, RazorpayConfig, RazorpayTransactionRecord } from '../../services/razorpayService';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';

interface AdminDashboardPageProps {
  products: Product[];
  categories: Category[];
  b2cUsers: B2CUser[];
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  businesses: B2BBusiness[];
  quotations: B2BQuotation[];
  coupons: Coupon[];
  onRefresh: () => void;
  onExitAdmin: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products,
  categories,
  b2cUsers,
  b2cOrders,
  b2bOrders,
  businesses,
  quotations,
  coupons,
  onRefresh,
  onExitAdmin,
}) => {
  const { currentAdminUser, isSuperAdmin, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'categories' | 'b2c_orders' | 'b2b_orders' | 'verification' | 'rfqs' | 'coupons' | 'approvals' | 'credentials' | 'media' | 'razorpay'
  >('overview');

  // Razorpay Gateway State
  const [razorpayConfig, setRazorpayConfig] = useState<RazorpayConfig>(() => razorpayService.getConfig());
  const [razorpayTransactions, setRazorpayTransactions] = useState<RazorpayTransactionRecord[]>(() => razorpayService.getTransactions());
  const [rzpSavedMsg, setRzpSavedMsg] = useState(false);
  const [rzpSearchQuery, setRzpSearchQuery] = useState('');
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [adminTestCheckoutOpen, setAdminTestCheckoutOpen] = useState(false);

  const handleSaveRazorpayConfig = () => {
    razorpayService.saveConfig(razorpayConfig);
    setRzpSavedMsg(true);
    setTimeout(() => setRzpSavedMsg(false), 3500);
  };

  const refreshRazorpayTransactions = () => {
    setRazorpayTransactions(razorpayService.getTransactions());
  };

  // Site Media State
  const [siteMedia, setSiteMedia] = useState<SiteMedia>(() => storageService.getSiteMedia());
  const [mediaSavedMsg, setMediaSavedMsg] = useState(false);

  const handleSaveSiteMedia = () => {
    storageService.saveSiteMedia(siteMedia);
    setMediaSavedMsg(true);
    setTimeout(() => setMediaSavedMsg(false), 3000);
  };

  // Admin Users & Super Admin Approvals State
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => storageService.getAdminUsers());
  const [adminSuccessMsg, setAdminSuccessMsg] = useState<string | null>(null);

  const refreshAdminUsers = () => {
    setAdminUsers(storageService.getAdminUsers());
  };

  const handleApproveAdmin = (adminId: string) => {
    storageService.updateAdminStatus(
      adminId,
      'approved',
      undefined,
      currentAdminUser?.userId || 'superadmin'
    );
    refreshAdminUsers();
    setAdminSuccessMsg('Admin staff authorization granted successfully! Account is now active.');
    setTimeout(() => setAdminSuccessMsg(null), 5000);
    onRefresh();
  };

  const handleRejectAdmin = (adminId: string) => {
    const reason = prompt(
      'Enter rejection justification for applicant records:',
      'Corporate verification criteria not met'
    ) || 'Application declined by Super Admin';
    storageService.updateAdminStatus(
      adminId,
      'rejected',
      reason,
      currentAdminUser?.userId || 'superadmin'
    );
    refreshAdminUsers();
    setAdminSuccessMsg('Staff registration request was rejected.');
    setTimeout(() => setAdminSuccessMsg(null), 5000);
    onRefresh();
  };

  // Product Edit / Add State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Category Management State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryOriginalName, setCategoryOriginalName] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    id: string;
    name: string;
    description: string;
    image: string;
    icon: string;
    isNew: boolean;
  }>({
    id: '',
    name: '',
    description: '',
    image: '',
    icon: '📦',
    isNew: false,
  });
  const [categoryMsg, setCategoryMsg] = useState<string | null>(null);

  const handleOpenAddCategory = () => {
    setCategoryForm({
      id: '',
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      icon: '📦',
      isNew: true,
    });
    setCategoryOriginalName(null);
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryForm({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
      icon: cat.icon || '📦',
      isNew: false,
    });
    setCategoryOriginalName(cat.name);
    setShowCategoryModal(true);
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const slugId = categoryForm.id.trim()
      ? categoryForm.id.trim().toLowerCase().replace(/\s+/g, '-')
      : categoryForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const catToSave: Category = {
      id: slugId,
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      image: categoryForm.image.trim(),
      icon: categoryForm.icon.trim() || '📦',
    };

    storageService.saveCategory(catToSave, categoryForm.isNew ? undefined : categoryOriginalName || undefined);
    onRefresh();
    setShowCategoryModal(false);
    setCategoryMsg(
      categoryForm.isNew
        ? `Category "${catToSave.name}" created successfully!`
        : `Category "${catToSave.name}" updated successfully! Assigned products synchronized.`
    );
    setTimeout(() => setCategoryMsg(null), 5000);
  };

  const handleDeleteCategory = (cat: Category) => {
    const assignedCount = products.filter((p) => p.category === cat.name).length;
    const confirmMsg = assignedCount > 0
      ? `Warning: Category "${cat.name}" has ${assignedCount} product(s) linked to it. Are you sure you want to delete it?`
      : `Are you sure you want to delete category "${cat.name}"?`;

    if (window.confirm(confirmMsg)) {
      storageService.deleteCategory(cat.id);
      onRefresh();
      setCategoryMsg(`Category "${cat.name}" deleted successfully.`);
      setTimeout(() => setCategoryMsg(null), 4000);
    }
  };

  // Selected Order for Official Tax Invoice (B2C and B2B)
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<{
    order: B2COrder | B2BOrder;
    isB2B: boolean;
  } | null>(null);

  // B2B Offline Payment Management State
  const [showOfflinePaymentModal, setShowOfflinePaymentModal] = useState(false);
  const [orderForOfflinePayment, setOrderForOfflinePayment] = useState<B2BOrder | null>(null);
  const [offlinePaymentAmount, setOfflinePaymentAmount] = useState<number>(0);
  const [offlinePaymentDate, setOfflinePaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [offlinePaymentMode, setOfflinePaymentMode] = useState<string>('bank_transfer');
  const [offlinePaymentRef, setOfflinePaymentRef] = useState<string>('');
  const [offlinePaymentChequeNo, setOfflinePaymentChequeNo] = useState<string>('');
  const [offlinePaymentBank, setOfflinePaymentBank] = useState<string>('');
  const [offlinePaymentNotes, setOfflinePaymentNotes] = useState<string>('');

  const handleOpenOfflinePayment = (order: B2BOrder) => {
    if (!order.source || order.source === 'web') {
      alert('Payment Rule Notice: For automated website orders (B2C/B2B), payments are processed directly through the integrated Razorpay online gateway. Manual recording or altering payment modes for website orders is disabled to preserve statutory tax and audit integrity.');
      return;
    }
    setOrderForOfflinePayment(order);
    const due = order.amountDue !== undefined ? order.amountDue : (order.paymentStatus === 'paid' ? 0 : order.grandTotal);
    setOfflinePaymentAmount(due > 0 ? due : order.grandTotal);
    setOfflinePaymentDate(new Date().toISOString().split('T')[0]);
    setOfflinePaymentMode(order.paymentMode || 'bank_transfer');
    setOfflinePaymentRef('');
    setOfflinePaymentChequeNo('');
    setOfflinePaymentBank('');
    setOfflinePaymentNotes('');
    setShowOfflinePaymentModal(true);
  };

  const handleSaveOfflinePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderForOfflinePayment) return;
    if (offlinePaymentAmount <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    const updated = storageService.recordB2BOfflinePayment(
      orderForOfflinePayment.id,
      {
        amount: Number(offlinePaymentAmount),
        paymentDate: offlinePaymentDate,
        paymentMode: offlinePaymentMode as any,
        transactionRef: offlinePaymentRef,
        chequeNumber: offlinePaymentChequeNo,
        bankName: offlinePaymentBank,
        notes: offlinePaymentNotes,
      },
      currentAdminUser?.name || 'Super Admin'
    );

    if (updated) {
      if (selectedOrderForInspection && selectedOrderForInspection.order.id === updated.id) {
        setSelectedOrderForInspection({ type: 'b2b', order: updated });
      }
      onRefresh();
      setShowOfflinePaymentModal(false);
      setOrderForOfflinePayment(null);
      alert(`Payment of ₹${offlinePaymentAmount.toLocaleString('en-IN')} successfully logged! New Status: ${updated.paymentStatus.toUpperCase()} (Remaining Due: ₹${(updated.amountDue || 0).toLocaleString('en-IN')})`);
    }
  };

  // B2B Manual Quotation Management State
  const [showManualQuoteModal, setShowManualQuoteModal] = useState(false);
  const [quoteBusinessName, setQuoteBusinessName] = useState('');
  const [quoteContactPerson, setQuoteContactPerson] = useState('');
  const [quoteContactPhone, setQuoteContactPhone] = useState('');
  const [quoteContactEmail, setQuoteContactEmail] = useState('');
  const [quoteGstin, setQuoteGstin] = useState('');
  const [quoteBillingStreet, setQuoteBillingStreet] = useState('');
  const [quoteBillingCity, setQuoteBillingCity] = useState('');
  const [quoteBillingState, setQuoteBillingState] = useState('');
  const [quoteBillingPincode, setQuoteBillingPincode] = useState('');
  const [quoteShippingSameAsBilling, setQuoteShippingSameAsBilling] = useState(true);
  const [quoteShippingStreet, setQuoteShippingStreet] = useState('');
  const [quoteShippingCity, setQuoteShippingCity] = useState('');
  const [quoteShippingState, setQuoteShippingState] = useState('');
  const [quoteShippingPincode, setQuoteShippingPincode] = useState('');

  interface ManualQuoteLineItem {
    productId?: string;
    productName: string;
    sku: string;
    hsn: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }
  const [quoteLineItems, setQuoteLineItems] = useState<ManualQuoteLineItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || 'Interactive Flat Panel 75 Inch 4K',
      sku: products[0]?.sku || 'KM-IFP-75-PRO',
      hsn: products[0]?.hsn || '8471',
      quantity: 5,
      unitPrice: products[0]?.b2bWholesalePrice || 85000,
      discountPercent: 0,
    },
  ]);
  const [quoteShippingFee, setQuoteShippingFee] = useState<number>(0);
  const [quotePaymentTerms, setQuotePaymentTerms] = useState<string>('Prepaid');
  const [quoteDeliveryTerms, setQuoteDeliveryTerms] = useState<string>('Ex-Warehouse Noida / Doorstep Delivery within 5-7 business days');
  const [quoteProposalNotes, setQuoteProposalNotes] = useState<string>('Official Institutional Proposal valid for 30 calendar days. 18% GST input tax credit applicable under Section 31.');
  const [quoteProposalValidDays, setQuoteProposalValidDays] = useState<number>(30);

  const handleOpenManualQuoteModal = () => {
    setQuoteBusinessName('');
    setQuoteContactPerson('');
    setQuoteContactPhone('');
    setQuoteContactEmail('');
    setQuoteGstin('');
    setQuoteBillingStreet('');
    setQuoteBillingCity('Noida');
    setQuoteBillingState('Uttar Pradesh');
    setQuoteBillingPincode('201301');
    setQuoteShippingSameAsBilling(true);
    setQuoteShippingStreet('');
    setQuoteShippingCity('Noida');
    setQuoteShippingState('Uttar Pradesh');
    setQuoteShippingPincode('201301');
    setQuoteLineItems([
      {
        productId: products[0]?.id || '',
        productName: products[0]?.name || 'Interactive Flat Panel 75 Inch 4K',
        sku: products[0]?.sku || 'KM-IFP-75-PRO',
        hsn: products[0]?.hsn || '8471',
        quantity: 5,
        unitPrice: products[0]?.b2bWholesalePrice || 85000,
        discountPercent: 0,
      },
    ]);
    setQuoteShippingFee(0);
    setQuotePaymentTerms('Prepaid');
    setQuoteDeliveryTerms('Ex-Warehouse Noida / Doorstep Delivery within 5-7 business days');
    setQuoteProposalNotes('Official Institutional Proposal valid for 30 calendar days. 18% GST input tax credit applicable under Section 31.');
    setQuoteProposalValidDays(30);
    setShowManualQuoteModal(true);
  };

  const handleSaveManualQuotation = (andConvert: boolean = false) => {
    if (!quoteBusinessName.trim() || !quoteContactPerson.trim() || !quoteContactPhone.trim()) {
      alert('Please fill in required business and contact details (Company Name, Contact Person, Mobile).');
      return;
    }
    if (quoteLineItems.length === 0) {
      alert('Please add at least one line item to the quotation.');
      return;
    }

    let totalTaxable = 0;
    const processedItems: B2BQuotationItem[] = quoteLineItems.map((item) => {
      const taxable = Math.round(item.quantity * item.unitPrice * (1 - item.discountPercent / 100) * 100) / 100;
      const gst = Math.round(taxable * 0.18 * 100) / 100;
      const total = taxable + gst;
      totalTaxable += taxable;
      return {
        productId: item.productId || `prod_${Date.now()}`,
        productName: item.productName,
        sku: item.sku,
        hsn: item.hsn,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discountPercent,
        discountPercent: item.discountPercent,
        taxableAmount: taxable,
        taxableValue: taxable,
        gstRate: 18,
        gstAmount: gst,
        total,
      };
    });

    const totalGst = Math.round(totalTaxable * 0.18 * 100) / 100;
    const grandTotal = totalTaxable + totalGst + (Number(quoteShippingFee) || 0);
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (Number(quoteProposalValidDays) || 30));

    const billingAddress: B2CAddress = {
      id: `addr_bill_${Date.now()}`,
      fullName: quoteContactPerson || quoteBusinessName,
      phone: quoteContactPhone || '9931648595',
      street: quoteBillingStreet || 'Commercial Hub',
      city: quoteBillingCity || 'Noida',
      state: quoteBillingState || 'Uttar Pradesh',
      pincode: quoteBillingPincode || '201301',
      addressType: 'work',
    };

    const shippingAddress: B2CAddress = quoteShippingSameAsBilling
      ? { ...billingAddress, id: `addr_ship_${Date.now()}` }
      : {
          id: `addr_ship_${Date.now()}`,
          fullName: quoteContactPerson || quoteBusinessName,
          phone: quoteContactPhone || '9931648595',
          street: quoteShippingStreet || quoteBillingStreet || 'Commercial Hub',
          city: quoteShippingCity || quoteBillingCity || 'Noida',
          state: quoteShippingState || quoteBillingState || 'Uttar Pradesh',
          pincode: quoteShippingPincode || quoteBillingPincode || '201301',
          addressType: 'work',
        };

    const newQuotation: B2BQuotation = {
      id: `quote_${Date.now()}`,
      businessId: `biz_${Date.now()}`,
      businessName: quoteBusinessName,
      contactPerson: quoteContactPerson,
      email: quoteContactEmail,
      phone: quoteContactPhone,
      gstin: quoteGstin ? quoteGstin.trim().toUpperCase() : undefined,
      rfqNumber: `RFQ-MAN-${Math.floor(100000 + Math.random() * 900000)}`,
      productId: processedItems[0]?.productId || '',
      productName: processedItems.length === 1 ? processedItems[0].productName : `${processedItems[0].productName} + ${processedItems.length - 1} more items`,
      sku: processedItems[0]?.sku || 'VARIOUS',
      requestedQty: processedItems.reduce((acc, i) => acc + i.quantity, 0),
      targetUnitPrice: processedItems[0]?.unitPrice || 0,
      deliveryPincode: shippingAddress.pincode,
      requiredByDate: validUntilDate.toISOString().split('T')[0],
      specialRequirements: quoteProposalNotes,
      status: 'quoted',
      createdAt: new Date().toISOString(),
      items: processedItems,
      billingAddress,
      shippingAddress,
      deliveryTerms: quoteDeliveryTerms,
      paymentTerms: quotePaymentTerms,
      adminQuotation: {
        quotedUnitPrice: processedItems[0]?.unitPrice || 0,
        totalTaxable,
        gstAmount: totalGst,
        shippingCharges: Number(quoteShippingFee) || 0,
        grandTotal,
        validUntil: validUntilDate.toISOString().split('T')[0],
        adminNotes: quoteProposalNotes,
        quotedAt: new Date().toISOString(),
      },
    };

    storageService.saveB2BQuotation(newQuotation);

    if (andConvert) {
      const convertedOrder = storageService.convertQuotationToB2BOrder(
        newQuotation.id,
        currentAdminUser?.name || 'Super Admin'
      );
      setShowManualQuoteModal(false);
      onRefresh();
      alert(`Manual B2B Quotation created and converted directly to Confirmed B2B Order #${convertedOrder?.orderNumber}! Statutory Tax Invoice is now generated.`);
    } else {
      setShowManualQuoteModal(false);
      onRefresh();
      alert(`Manual B2B Quotation ${newQuotation.rfqNumber} published successfully for ${quoteBusinessName}!`);
    }
  };

  const handleLineItemProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...quoteLineItems];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      hsn: prod.hsn || '8471',
      unitPrice: prod.b2bWholesalePrice,
    };
    setQuoteLineItems(updated);
  };

  const handleAddLineItem = () => {
    const firstProd = products[0];
    setQuoteLineItems([
      ...quoteLineItems,
      {
        productId: firstProd?.id || '',
        productName: firstProd?.name || 'Interactive Flat Panel 75 Inch 4K',
        sku: firstProd?.sku || 'KM-IFP-75-PRO',
        hsn: firstProd?.hsn || '8471',
        quantity: 1,
        unitPrice: firstProd?.b2bWholesalePrice || 85000,
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (quoteLineItems.length <= 1) {
      alert('At least one line item is required.');
      return;
    }
    setQuoteLineItems(quoteLineItems.filter((_, i) => i !== index));
  };

  const handleConvertQuotationToOrder = (quotationId: string) => {
    if (window.confirm('Are you sure you want to convert this Quotation directly into a Confirmed B2B Order?')) {
      const ord = storageService.convertQuotationToB2BOrder(quotationId, currentAdminUser?.name || 'Super Admin');
      if (ord) {
        onRefresh();
        alert(`Quotation successfully converted to Confirmed B2B Order #${ord.orderNumber}! Statutory Tax Invoice is now available.`);
      } else {
        alert('Could not convert quotation. Please check if the quotation exists.');
      }
    }
  };

  const handleDeleteQuotation = (quotationId: string, rfqNum: string) => {
    if (window.confirm(`Delete quotation ${rfqNum}? This action cannot be undone.`)) {
      storageService.deleteB2BQuotation(quotationId);
      onRefresh();
    }
  };

  // Manual B2B Order Management State (Phone, WhatsApp, Email, Sales Rep, Direct/Offline)
  const [showManualOrderModal, setShowManualOrderModal] = useState(false);
  const [manualOrderSource, setManualOrderSource] = useState<'phone' | 'whatsapp' | 'email' | 'sales_rep' | 'direct_offline' | 'other'>('phone');
  const [manualOrderExistingBizId, setManualOrderExistingBizId] = useState<string>('new');
  const [manualOrderBizName, setManualOrderBizName] = useState('');
  const [manualOrderContactPerson, setManualOrderContactPerson] = useState('');
  const [manualOrderMobile, setManualOrderMobile] = useState('');
  const [manualOrderEmail, setManualOrderEmail] = useState('');
  const [manualOrderGstin, setManualOrderGstin] = useState('');
  const [manualOrderBillingStreet, setManualOrderBillingStreet] = useState('');
  const [manualOrderBillingCity, setManualOrderBillingCity] = useState('Noida');
  const [manualOrderBillingState, setManualOrderBillingState] = useState('Uttar Pradesh');
  const [manualOrderBillingPincode, setManualOrderBillingPincode] = useState('201301');
  const [manualOrderShippingSame, setManualOrderShippingSame] = useState(true);
  const [manualOrderShippingStreet, setManualOrderShippingStreet] = useState('');
  const [manualOrderShippingCity, setManualOrderShippingCity] = useState('Noida');
  const [manualOrderShippingState, setManualOrderShippingState] = useState('Uttar Pradesh');
  const [manualOrderShippingPincode, setManualOrderShippingPincode] = useState('201301');
  
  interface ManualOrderLineItem {
    productId?: string;
    productName: string;
    sku: string;
    hsn: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }
  const [manualOrderLineItems, setManualOrderLineItems] = useState<ManualOrderLineItem[]>([
    {
      productId: products[0]?.id || '',
      productName: products[0]?.name || 'Interactive Flat Panel 75 Inch 4K',
      sku: products[0]?.sku || 'KM-IFP-75-PRO',
      hsn: products[0]?.hsn || '8471',
      quantity: 2,
      unitPrice: products[0]?.b2bWholesalePrice || 85000,
      discountPercent: 0,
    },
  ]);
  const [manualOrderShippingFee, setManualOrderShippingFee] = useState<number>(0);
  const [manualOrderPaymentTerms, setManualOrderPaymentTerms] = useState<string>('Net 30');
  const [manualOrderPaymentMode, setManualOrderPaymentMode] = useState<string>('bank_transfer');
  const [manualOrderPaymentStatus, setManualOrderPaymentStatus] = useState<'paid' | 'partially_paid' | 'payment_due'>('payment_due');
  const [manualOrderUpfrontPaid, setManualOrderUpfrontPaid] = useState<number>(0);
  const [manualOrderTxnRef, setManualOrderTxnRef] = useState<string>('');
  const [manualOrderBankName, setManualOrderBankName] = useState<string>('');
  const [manualOrderRemarks, setManualOrderRemarks] = useState<string>('');

  const handleOpenManualOrderModal = () => {
    setManualOrderSource('phone');
    setManualOrderExistingBizId('new');
    setManualOrderBizName('');
    setManualOrderContactPerson('');
    setManualOrderMobile('');
    setManualOrderEmail('');
    setManualOrderGstin('');
    setManualOrderBillingStreet('');
    setManualOrderBillingCity('Noida');
    setManualOrderBillingState('Uttar Pradesh');
    setManualOrderBillingPincode('201301');
    setManualOrderShippingSame(true);
    setManualOrderShippingStreet('');
    setManualOrderShippingCity('Noida');
    setManualOrderShippingState('Uttar Pradesh');
    setManualOrderShippingPincode('201301');
    const firstP = products[0];
    setManualOrderLineItems([
      {
        productId: firstP?.id || '',
        productName: firstP?.name || 'Interactive Flat Panel 75 Inch 4K',
        sku: firstP?.sku || 'KM-IFP-75-PRO',
        hsn: firstP?.hsn || '8471',
        quantity: 2,
        unitPrice: firstP?.b2bWholesalePrice || 85000,
        discountPercent: 0,
      },
    ]);
    setManualOrderShippingFee(0);
    setManualOrderPaymentTerms('Net 30');
    setManualOrderPaymentMode('bank_transfer');
    setManualOrderPaymentStatus('payment_due');
    setManualOrderUpfrontPaid(0);
    setManualOrderTxnRef('');
    setManualOrderBankName('');
    setManualOrderRemarks('');
    setShowManualOrderModal(true);
  };

  const handleSelectManualOrderBusiness = (bizId: string) => {
    setManualOrderExistingBizId(bizId);
    if (bizId === 'new') {
      setManualOrderBizName('');
      setManualOrderContactPerson('');
      setManualOrderMobile('');
      setManualOrderEmail('');
      setManualOrderGstin('');
    } else {
      const b = businesses.find((x) => x.id === bizId);
      if (b) {
        setManualOrderBizName(b.companyName || b.legalName || '');
        setManualOrderContactPerson(b.contactPerson || '');
        setManualOrderMobile(b.mobile || '');
        setManualOrderEmail(b.businessEmail || '');
        setManualOrderGstin(b.gstin || '');
      }
    }
  };

  const handleManualOrderProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...manualOrderLineItems];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      hsn: prod.hsn || '8471',
      unitPrice: prod.b2bWholesalePrice,
    };
    setManualOrderLineItems(updated);
  };

  const handleAddManualOrderLineItem = () => {
    const firstP = products[0];
    setManualOrderLineItems([
      ...manualOrderLineItems,
      {
        productId: firstP?.id || '',
        productName: firstP?.name || 'Copier Paper',
        sku: firstP?.sku || 'KM-PAPER',
        hsn: firstP?.hsn || '4802',
        quantity: 1,
        unitPrice: firstP?.b2bWholesalePrice || 1000,
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveManualOrderLineItem = (index: number) => {
    if (manualOrderLineItems.length <= 1) {
      alert('At least one line item is required.');
      return;
    }
    setManualOrderLineItems(manualOrderLineItems.filter((_, i) => i !== index));
  };

  const handleSaveManualB2BOrder = (isConfirm: boolean) => {
    if (!manualOrderBizName.trim() || !manualOrderContactPerson.trim() || !manualOrderMobile.trim()) {
      alert('Please fill in required business details: Company Name, Contact Person, and Mobile Number.');
      return;
    }
    if (manualOrderLineItems.length === 0) {
      alert('Please add at least one line item to the order.');
      return;
    }

    const billingAddress: B2CAddress = {
      id: `addr_b_${Date.now()}`,
      fullName: manualOrderContactPerson,
      phone: manualOrderMobile,
      street: manualOrderBillingStreet || 'Commercial Address',
      city: manualOrderBillingCity || 'Noida',
      state: manualOrderBillingState || 'Uttar Pradesh',
      pincode: manualOrderBillingPincode || '201301',
      addressType: 'work',
    };

    const shippingAddress: B2CAddress = manualOrderShippingSame
      ? billingAddress
      : {
          id: `addr_s_${Date.now()}`,
          fullName: manualOrderContactPerson,
          phone: manualOrderMobile,
          street: manualOrderShippingStreet || 'Commercial Delivery Address',
          city: manualOrderShippingCity || 'Noida',
          state: manualOrderShippingState || 'Uttar Pradesh',
          pincode: manualOrderShippingPincode || '201301',
          addressType: 'work',
        };

    const createdOrder = storageService.createManualB2BOrder(
      {
        source: manualOrderSource,
        businessId: manualOrderExistingBizId !== 'new' ? manualOrderExistingBizId : undefined,
        businessName: manualOrderBizName.trim(),
        contactPerson: manualOrderContactPerson.trim(),
        email: manualOrderEmail.trim(),
        mobile: manualOrderMobile.trim(),
        gstin: manualOrderGstin ? manualOrderGstin.trim().toUpperCase() : undefined,
        billingAddress,
        shippingAddress,
        items: manualOrderLineItems.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          hsn: it.hsn || '8471',
          quantity: Number(it.quantity) || 1,
          unitPrice: Number(it.unitPrice) || 0,
          discountPercent: Number(it.discountPercent) || 0,
          gstRate: 18,
        })),
        shippingFee: Number(manualOrderShippingFee) || 0,
        paymentTerms: manualOrderPaymentTerms,
        paymentMode: manualOrderPaymentMode,
        paymentStatus: manualOrderPaymentStatus,
        upfrontAmountPaid: Number(manualOrderUpfrontPaid) || 0,
        transactionReference: manualOrderTxnRef.trim(),
        bankName: manualOrderBankName.trim(),
        internalRemarks: manualOrderRemarks.trim(),
        orderStatus: isConfirm ? 'confirmed' : 'placed',
      },
      currentAdminUser?.name || 'Super Admin'
    );

    setShowManualOrderModal(false);
    onRefresh();
    alert(`Manual B2B Order #${createdOrder.orderNumber} created successfully via ${manualOrderSource.toUpperCase()}! ${isConfirm ? 'Order is Confirmed and Statutory Tax Invoice is available.' : 'Order saved as Draft (Awaiting Confirmation).'}`);
  };

  // Revise & Send Quotation State
  const [showReviseQuoteModal, setShowReviseQuoteModal] = useState(false);
  const [activeQuoteForRevision, setActiveQuoteForRevision] = useState<B2BQuotation | null>(null);
  const [reviseQuoteItems, setReviseQuoteItems] = useState<ManualQuoteLineItem[]>([]);
  const [reviseShippingCharges, setReviseShippingCharges] = useState<number>(0);
  const [revisePaymentTerms, setRevisePaymentTerms] = useState<string>('Prepaid');
  const [reviseDeliveryTerms, setReviseDeliveryTerms] = useState<string>('Ex-Warehouse Noida / Doorstep Delivery within 5-7 business days');
  const [reviseValidUntil, setReviseValidUntil] = useState<string>('');
  const [reviseAdminNotes, setReviseAdminNotes] = useState<string>('');

  const handleOpenReviseQuoteModal = (quote: B2BQuotation) => {
    setActiveQuoteForRevision(quote);
    if (quote.items && quote.items.length > 0) {
      setReviseQuoteItems(
        quote.items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          sku: it.sku || 'SKU',
          hsn: it.hsn || '8471',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          discountPercent: it.discountPercent || it.discount || 0,
        }))
      );
    } else {
      const prod = products.find((p) => p.id === quote.productId);
      setReviseQuoteItems([
        {
          productId: quote.productId || prod?.id || '',
          productName: quote.productName || prod?.name || 'Institutional Custom Batch',
          sku: quote.sku || prod?.sku || 'KM-INST-BATCH',
          hsn: prod?.hsn || '8471',
          quantity: quote.requestedQty || 5,
          unitPrice: quote.adminQuotation?.quotedUnitPrice || quote.targetUnitPrice || prod?.b2bWholesalePrice || 50000,
          discountPercent: 0,
        },
      ]);
    }
    setReviseShippingCharges(quote.shippingCharges !== undefined ? quote.shippingCharges : (quote.adminQuotation?.shippingCharges || 0));
    setRevisePaymentTerms(quote.paymentTerms || 'Prepaid');
    setReviseDeliveryTerms(quote.deliveryTerms || 'Ex-Warehouse Noida / Doorstep Delivery within 5-7 business days');
    setReviseValidUntil(quote.adminQuotation?.validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
    setReviseAdminNotes(quote.adminQuotation?.adminNotes || quote.notes || 'Revised commercial terms with 18% GST input tax credit.');
    setShowReviseQuoteModal(true);
  };

  const handleReviseQuoteProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...reviseQuoteItems];
    updated[index] = {
      ...updated[index],
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      hsn: prod.hsn || '8471',
      unitPrice: prod.b2bWholesalePrice,
    };
    setReviseQuoteItems(updated);
  };

  const handleAddReviseQuoteItem = () => {
    const firstP = products[0];
    setReviseQuoteItems([
      ...reviseQuoteItems,
      {
        productId: firstP?.id || '',
        productName: firstP?.name || 'Interactive Flat Panel 75 Inch 4K',
        sku: firstP?.sku || 'KM-IFP-75-PRO',
        hsn: firstP?.hsn || '8471',
        quantity: 1,
        unitPrice: firstP?.b2bWholesalePrice || 85000,
        discountPercent: 0,
      },
    ]);
  };

  const handleRemoveReviseQuoteItem = (index: number) => {
    if (reviseQuoteItems.length <= 1) {
      alert('At least one line item is required.');
      return;
    }
    setReviseQuoteItems(reviseQuoteItems.filter((_, i) => i !== index));
  };

  const handleSaveRevisedQuotation = () => {
    if (!activeQuoteForRevision) return;
    if (reviseQuoteItems.length === 0) {
      alert('At least one line item is required in the quotation.');
      return;
    }

    const processedItems: B2BQuotationItem[] = reviseQuoteItems.map((it) => {
      const disc = it.discountPercent || 0;
      const effRate = Math.round(it.unitPrice * (1 - disc / 100));
      const lineTaxable = effRate * it.quantity;
      const gstAmt = Math.round(lineTaxable * 0.18 * 100) / 100;
      return {
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        hsn: it.hsn || '8471',
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        discountPercent: disc,
        gstRate: 18,
        taxableAmount: lineTaxable,
        taxableValue: lineTaxable,
        gstAmount: gstAmt,
        total: lineTaxable + gstAmt,
      };
    });

    storageService.reviseB2BQuotation(
      activeQuoteForRevision.id,
      {
        items: processedItems,
        shippingCharges: Number(reviseShippingCharges) || 0,
        paymentTerms: revisePaymentTerms,
        deliveryTerms: reviseDeliveryTerms,
        validUntil: reviseValidUntil,
        adminNotes: reviseAdminNotes,
      },
      currentAdminUser?.name || 'Super Admin'
    );

    setShowReviseQuoteModal(false);
    onRefresh();
    alert(`Revised Quotation ${activeQuoteForRevision.rfqNumber} sent to client successfully! Status updated to "Revised Quotation Sent".`);
  };

  // Super Admin Self Password Change State
  const [showChangeSuperAdminPasswordModal, setShowChangeSuperAdminPasswordModal] = useState(false);
  const [superAdminCurrentPassword, setSuperAdminCurrentPassword] = useState('');
  const [superAdminNewPassword, setSuperAdminNewPassword] = useState('');
  const [superAdminConfirmPassword, setSuperAdminConfirmPassword] = useState('');
  const [superAdminPassError, setSuperAdminPassError] = useState<string | null>(null);
  const [superAdminPassSuccess, setSuperAdminPassSuccess] = useState<string | null>(null);

  // User Credentials Hub State
  const [credFilter, setCredFilter] = useState<'all' | 'admin' | 'b2b' | 'b2c'>('all');
  const [credSearch, setCredSearch] = useState('');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [credSuccessMsg, setCredSuccessMsg] = useState<string | null>(null);

  // Edit Credentials Modal State
  const [showEditCredModal, setShowEditCredModal] = useState(false);
  const [editingCredTarget, setEditingCredTarget] = useState<{
    type: 'admin' | 'b2b' | 'b2c';
    id: string;
    name: string;
    identifier: string;
    secondaryIdentifier: string;
    currentPassword?: string;
  } | null>(null);
  const [editCredForm, setEditCredForm] = useState({
    name: '',
    identifier: '',
    secondaryIdentifier: '',
    newPassword: '',
  });

  // OTP Reset Modal State
  const [showOtpResetModal, setShowOtpResetModal] = useState(false);
  const [otpResetTarget, setOtpResetTarget] = useState<{
    type: 'admin' | 'b2b' | 'b2c';
    id: string;
    name: string;
    identifier: string;
  } | null>(null);
  const [generatedOtpInfo, setGeneratedOtpInfo] = useState<{
    otp: string;
    expiresAt: string;
    targetIdentifier: string;
  } | null>(null);
  const [otpResetForm, setOtpResetForm] = useState({
    inputOtp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [otpResetMsg, setOtpResetMsg] = useState<{ success: boolean; text: string } | null>(null);

  const handleTogglePasswordReveal = (id: string) => {
    setRevealedPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPassword = (id: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenEditCred = (
    type: 'admin' | 'b2b' | 'b2c',
    id: string,
    name: string,
    identifier: string,
    secondaryIdentifier: string,
    currentPassword?: string
  ) => {
    setEditingCredTarget({ type, id, name, identifier, secondaryIdentifier, currentPassword });
    setEditCredForm({
      name,
      identifier,
      secondaryIdentifier,
      newPassword: currentPassword || '',
    });
    setShowEditCredModal(true);
  };

  const handleSaveCredSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCredTarget) return;

    if (editingCredTarget.type === 'admin') {
      storageService.updateAdminCredentials(
        editingCredTarget.id,
        editCredForm.identifier,
        editCredForm.secondaryIdentifier,
        editCredForm.newPassword
      );
      setAdminUsers(storageService.getAdminUsers());
    } else if (editingCredTarget.type === 'b2c') {
      storageService.updateB2CCredentials(
        editingCredTarget.id,
        editCredForm.identifier,
        editCredForm.secondaryIdentifier,
        editCredForm.newPassword,
        editCredForm.name
      );
    } else if (editingCredTarget.type === 'b2b') {
      storageService.updateB2BCredentials(
        editingCredTarget.id,
        editCredForm.identifier,
        editCredForm.secondaryIdentifier,
        editCredForm.newPassword,
        editCredForm.name
      );
    }

    onRefresh();
    setShowEditCredModal(false);
    setCredSuccessMsg(`Credentials for "${editCredForm.name}" were successfully updated!`);
    setTimeout(() => setCredSuccessMsg(null), 5000);
  };

  const handleOpenOtpReset = (
    type: 'admin' | 'b2b' | 'b2c',
    id: string,
    name: string,
    identifier: string
  ) => {
    setOtpResetTarget({ type, id, name, identifier });
    const otpRes = storageService.generatePasswordResetOtp(identifier, type);
    setGeneratedOtpInfo(otpRes);
    setOtpResetForm({ inputOtp: otpRes.otp, newPassword: '', confirmPassword: '' });
    setOtpResetMsg(null);
    setShowOtpResetModal(true);
  };

  const handleExecuteOtpReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpResetTarget) return;
    if (!otpResetForm.newPassword || otpResetForm.newPassword.length < 6) {
      setOtpResetMsg({ success: false, text: 'Password must be at least 6 characters long.' });
      return;
    }
    if (otpResetForm.newPassword !== otpResetForm.confirmPassword) {
      setOtpResetMsg({ success: false, text: 'New passwords do not match.' });
      return;
    }

    const res = storageService.resetPasswordWithOtp(
      otpResetTarget.identifier,
      otpResetForm.inputOtp,
      otpResetForm.newPassword
    );

    if (res.success) {
      onRefresh();
      setAdminUsers(storageService.getAdminUsers());
      setOtpResetMsg({ success: true, text: res.message });
      setTimeout(() => {
        setShowOtpResetModal(false);
        setCredSuccessMsg(res.message);
        setTimeout(() => setCredSuccessMsg(null), 5000);
      }, 1500);
    } else {
      setOtpResetMsg({ success: false, text: res.message });
    }
  };

  const handleSuperAdminChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuperAdminPassError(null);
    setSuperAdminPassSuccess(null);

    if (superAdminNewPassword.length < 6) {
      setSuperAdminPassError('New password must be at least 6 characters long.');
      return;
    }
    if (superAdminNewPassword !== superAdminConfirmPassword) {
      setSuperAdminPassError('Passwords do not match.');
      return;
    }

    const res = storageService.changeSuperAdminPassword(
      superAdminCurrentPassword,
      superAdminNewPassword
    );

    if (res.success) {
      setSuperAdminPassSuccess(res.message);
      setAdminUsers(storageService.getAdminUsers());
      onRefresh();
      setTimeout(() => {
        setShowChangeSuperAdminPasswordModal(false);
      }, 1800);
    } else {
      setSuperAdminPassError(res.message);
    }
  };

  // RFQ Response Modal
  const [activeRfqForQuote, setActiveRfqForQuote] = useState<B2BQuotation | null>(null);
  const [quotePrice, setQuotePrice] = useState<number>(0);
  const [quoteValidDate, setQuoteValidDate] = useState<string>('2026-10-15');
  const [quoteNotes, setQuoteNotes] = useState<string>('Standard commercial quotation with 18% GST and priority dispatch.');

  // Coupon Management State
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponFilter, setCouponFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponDescriptionInput, setCouponDescriptionInput] = useState('');
  const [couponTypeInput, setCouponTypeInput] = useState<'percent' | 'flat'>('percent');
  const [couponValueInput, setCouponValueInput] = useState<number>(10);
  const [couponMinOrderInput, setCouponMinOrderInput] = useState<number>(500);
  const [couponMaxDiscountInput, setCouponMaxDiscountInput] = useState<string>('');
  const [couponStartDateInput, setCouponStartDateInput] = useState<string>('');
  const [couponExpiryDateInput, setCouponExpiryDateInput] = useState<string>('');
  const [couponUsageLimitInput, setCouponUsageLimitInput] = useState<string>('');
  const [couponIsActiveInput, setCouponIsActiveInput] = useState<boolean>(true);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState<string | null>(null);

  // Separate B2C & B2B Order Management State
  const [b2cStatusFilter, setB2cStatusFilter] = useState<string>('all');
  const [b2cSearchQuery, setB2cSearchQuery] = useState('');

  const [b2bStatusFilter, setB2bStatusFilter] = useState<string>('all');
  const [b2bPaymentStatusFilter, setB2bPaymentStatusFilter] = useState<string>('all');
  const [b2bSourceFilter, setB2bSourceFilter] = useState<string>('all');
  const [b2bSearchQuery, setB2bSearchQuery] = useState('');
  const [selectedOrderForInspection, setSelectedOrderForInspection] = useState<
    { type: 'b2c'; order: B2COrder } | { type: 'b2b'; order: B2BOrder } | null
  >(null);
  const [orderRejectionModal, setOrderRejectionModal] = useState<
    { type: 'b2c' | 'b2b'; id: string; orderNumber: string } | null
  >(null);
  const [orderRejectionReason, setOrderRejectionReason] = useState('');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Role-based permissions
  const canManageCoupons =
    isSuperAdmin ||
    currentAdminUser?.role === 'super_admin' ||
    currentAdminUser?.userId === 'kogniti14' ||
    Boolean(currentAdminUser?.permissions?.canManageCoupons);

  const canConfirmOrders =
    isSuperAdmin ||
    currentAdminUser?.role === 'super_admin' ||
    currentAdminUser?.userId === 'kogniti14' ||
    Boolean(currentAdminUser?.permissions?.canConfirmOrders) ||
    currentAdminUser?.role === 'operations_admin';

  const canRejectOrders =
    isSuperAdmin ||
    currentAdminUser?.role === 'super_admin' ||
    currentAdminUser?.userId === 'kogniti14' ||
    Boolean(currentAdminUser?.permissions?.canRejectOrders) ||
    currentAdminUser?.role === 'operations_admin';

  // Calculations for KPI cards
  const b2cRevenue = b2cOrders.reduce((sum, o) => sum + o.total, 0);
  const b2bRevenue = b2bOrders.reduce((sum, o) => sum + o.grandTotal, 0);
  const totalRevenue = b2cRevenue + b2bRevenue;
  const pendingApprovals = businesses.filter((b) => b.status === 'pending').length;
  const pendingRfqs = quotations.filter((q) => q.status === 'submitted').length;
  const pendingAdminRequests = adminUsers.filter((u) => u.status === 'pending').length;

  const handleApproveBusiness = (bizId: string) => {
    storageService.updateBusinessStatus(bizId, 'approved');
    onRefresh();
  };

  const handleRejectBusiness = (bizId: string) => {
    storageService.updateBusinessStatus(bizId, 'rejected', 'Verification failed: Incomplete documents');
    onRefresh();
  };

  const handleUpdateB2COrderStatus = (orderId: string, newStatus: any) => {
    storageService.updateB2COrderStatus(orderId, newStatus);
    onRefresh();
  };

  const handleUpdateB2BOrderStatus = (orderId: string, newStatus: any) => {
    storageService.updateB2BOrderStatus(orderId, newStatus);
    onRefresh();
  };

  const handleSubmitAdminQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRfqForQuote) return;

    const qty = activeRfqForQuote.requestedQty || (activeRfqForQuote.items ? activeRfqForQuote.items.reduce((acc, it) => acc + it.quantity, 0) : 1);
    const totalTaxable = quotePrice * qty;
    const gstAmount = Math.round(totalTaxable * 0.18 * 100) / 100;
    const grandTotal = totalTaxable + gstAmount;

    activeRfqForQuote.adminQuotation = {
      quotedUnitPrice: quotePrice,
      totalTaxable,
      gstAmount,
      shippingCharges: 0,
      grandTotal,
      validUntil: quoteValidDate,
      adminNotes: quoteNotes,
      quotedAt: new Date().toISOString(),
    };
    activeRfqForQuote.status = 'quoted';

    storageService.saveB2BQuotation(activeRfqForQuote);
    setActiveRfqForQuote(null);
    onRefresh();
    alert(`Commercial proposal published to client ${activeRfqForQuote.businessName}!`);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    storageService.saveProduct(editingProduct);
    setShowProductModal(false);
    setEditingProduct(null);
    onRefresh();
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product from the catalog?')) {
      storageService.deleteProduct(id);
      onRefresh();
    }
  };

  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null);
    setCouponCodeInput('');
    setCouponDescriptionInput('');
    setCouponTypeInput('percent');
    setCouponValueInput(10);
    setCouponMinOrderInput(500);
    setCouponMaxDiscountInput('');
    setCouponStartDateInput(new Date().toISOString().slice(0, 10));
    setCouponExpiryDateInput('');
    setCouponUsageLimitInput('');
    setCouponIsActiveInput(true);
    setShowCouponModal(true);
  };

  const handleOpenEditCoupon = (c: Coupon) => {
    setEditingCoupon(c);
    setCouponCodeInput(c.code);
    setCouponDescriptionInput(c.description || '');
    setCouponTypeInput(c.discountType);
    setCouponValueInput(c.value);
    setCouponMinOrderInput(c.minOrderValue);
    setCouponMaxDiscountInput(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '');
    setCouponStartDateInput(c.startDate ? c.startDate.slice(0, 10) : '');
    setCouponExpiryDateInput(c.expiryDate ? c.expiryDate.slice(0, 10) : '');
    setCouponUsageLimitInput(c.usageLimit ? String(c.usageLimit) : '');
    setCouponIsActiveInput(c.isActive !== false);
    setShowCouponModal(true);
  };

  const handleSaveCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    const cleanCode = couponCodeInput.trim().toUpperCase();
    const couponData: Coupon = {
      id: editingCoupon?.id || `cpn_${Date.now()}`,
      code: cleanCode,
      description:
        couponDescriptionInput.trim() ||
        `${couponTypeInput === 'percent' ? `${couponValueInput}%` : `₹${couponValueInput}`} off on orders above ₹${couponMinOrderInput}`,
      discountType: couponTypeInput,
      value: Number(couponValueInput),
      minOrderValue: Number(couponMinOrderInput),
      maxDiscountAmount: couponMaxDiscountInput ? Number(couponMaxDiscountInput) : undefined,
      startDate: couponStartDateInput ? couponStartDateInput : undefined,
      expiryDate: couponExpiryDateInput ? couponExpiryDateInput : undefined,
      usageLimit: couponUsageLimitInput ? Number(couponUsageLimitInput) : undefined,
      usageCount: editingCoupon?.usageCount || 0,
      isActive: couponIsActiveInput,
      createdAt: editingCoupon?.createdAt || new Date().toISOString(),
      createdBy: currentAdminUser?.name || 'Super Admin',
    };

    storageService.saveCoupon(couponData);
    setShowCouponModal(false);
    onRefresh();
    setCouponSuccessMsg(`Coupon '${cleanCode}' ${editingCoupon ? 'updated' : 'created'} successfully!`);
    setTimeout(() => setCouponSuccessMsg(null), 3500);
  };

  const handleDeleteCoupon = (idOrCode: string) => {
    if (confirm('Are you sure you want to permanently remove this coupon?')) {
      storageService.deleteCoupon(idOrCode);
      onRefresh();
      setCouponSuccessMsg('Coupon deleted successfully.');
      setTimeout(() => setCouponSuccessMsg(null), 3500);
    }
  };

  const handleToggleCoupon = (idOrCode: string) => {
    storageService.toggleCouponStatus(idOrCode);
    onRefresh();
  };

  const handleConfirmOrder = (type: 'b2c' | 'b2b', id: string) => {
    const adminName = currentAdminUser?.name || 'Operations Lead';
    if (type === 'b2c') {
      const updated = storageService.confirmB2COrder(id, adminName);
      if (selectedOrderForInspection && selectedOrderForInspection.order.id === id && updated) {
        setSelectedOrderForInspection({ type: 'b2c', order: updated });
      }
    } else {
      const updated = storageService.confirmB2BOrder(id, adminName);
      if (selectedOrderForInspection && selectedOrderForInspection.order.id === id && updated) {
        setSelectedOrderForInspection({ type: 'b2b', order: updated });
      }
    }
    onRefresh();
    setOrderSuccessMsg('Order confirmed successfully! Customer portal status updated to "Order Confirmed".');
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  const handleOpenRejectOrderModal = (type: 'b2c' | 'b2b', id: string, orderNumber: string) => {
    setOrderRejectionModal({ type, id, orderNumber });
    setOrderRejectionReason('Verification criteria not met / Address unserviceable');
  };

  const handleConfirmOrderRejection = () => {
    if (!orderRejectionModal) return;
    const adminName = currentAdminUser?.name || 'Operations Lead';
    if (orderRejectionModal.type === 'b2c') {
      const updated = storageService.rejectB2COrder(orderRejectionModal.id, adminName, orderRejectionReason);
      if (selectedOrderForInspection && selectedOrderForInspection.order.id === orderRejectionModal.id && updated) {
        setSelectedOrderForInspection({ type: 'b2c', order: updated });
      }
    } else {
      const updated = storageService.rejectB2BOrder(orderRejectionModal.id, adminName, orderRejectionReason);
      if (selectedOrderForInspection && selectedOrderForInspection.order.id === orderRejectionModal.id && updated) {
        setSelectedOrderForInspection({ type: 'b2b', order: updated });
      }
    }
    setOrderRejectionModal(null);
    setOrderRejectionReason('');
    onRefresh();
    setOrderSuccessMsg('Order rejected. Customer portal status updated to "Order Rejected".');
    setTimeout(() => setOrderSuccessMsg(null), 4000);
  };

  const handleToggleStaffPermission = (
    staffId: string,
    permKey: 'canManageCoupons' | 'canConfirmOrders' | 'canRejectOrders'
  ) => {
    const staff = adminUsers.find((u) => u.id === staffId);
    if (!staff) return;
    const currentPerms = staff.permissions || {};
    staff.permissions = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey],
    };
    storageService.saveAdminUser(staff);
    refreshAdminUsers();
  };

  // Separate Filtered B2C Retail Orders
  const filteredB2COrders = b2cOrders.filter((o) => {
    if (b2cStatusFilter !== 'all' && o.orderStatus !== b2cStatusFilter) return false;
    if (b2cSearchQuery.trim()) {
      const q = b2cSearchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchCust = o.customerName.toLowerCase().includes(q);
      const matchEmail = (o.customerEmail || '').toLowerCase().includes(q);
      const matchPhone = (o.customerPhone || o.shippingAddress?.phone || '').toLowerCase().includes(q);
      if (!matchNum && !matchCust && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  // Separate Filtered B2B Institutional Orders
  const filteredB2BOrders = b2bOrders.filter((o) => {
    if (b2bStatusFilter !== 'all' && o.orderStatus !== b2bStatusFilter) return false;
    if (b2bPaymentStatusFilter !== 'all' && o.paymentStatus !== b2bPaymentStatusFilter) return false;
    if (b2bSourceFilter !== 'all') {
      const src = o.source || 'web';
      if (src !== b2bSourceFilter) return false;
    }
    if (b2bSearchQuery.trim()) {
      const q = b2bSearchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchPo = (o.poNumber || '').toLowerCase().includes(q);
      const matchBiz = o.businessName.toLowerCase().includes(q);
      const matchGstin = (o.gstin || '').toLowerCase().includes(q);
      const matchPhone = (o.billingAddress?.phone || o.shippingAddress?.phone || '').toLowerCase().includes(q);
      if (!matchNum && !matchPo && !matchBiz && !matchGstin && !matchPhone) return false;
    }
    return true;
  });

  const filteredCoupons = coupons.filter((c) => {
    const isExpired = c.expiryDate ? new Date(c.expiryDate).getTime() < Date.now() : false;
    const isInactive = c.isActive === false;
    if (couponFilter === 'active') return !isInactive && !isExpired;
    if (couponFilter === 'inactive') return isInactive;
    if (couponFilter === 'expired') return isExpired;
    return true;
  });

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '6rem' }}>
      {/* Admin Top Header */}
      <header
        style={{
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                height: '42px',
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '4px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img
                src="/logo.png"
                alt="Kogniti Minds"
                style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>
                Kogniti Minds Admin Control Center
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Enterprise ERP & Dual Commerce Orchestration
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hide-on-mobile">
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF' }}>
                {currentAdminUser?.name || 'Kogniti Super Admin'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                User ID: <span style={{ color: '#C084FC', fontWeight: 600 }}>@{currentAdminUser?.userId || 'superadmin'}</span> ({currentAdminUser?.department || 'Governance'})
              </div>
            </div>

            <span
              className={`badge ${isSuperAdmin ? 'badge-purple' : 'badge-blue'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              {isSuperAdmin
                ? '👑 Super Admin'
                : currentAdminUser?.role === 'operations_admin'
                ? '📦 Operations Admin'
                : currentAdminUser?.role === 'catalog_manager'
                ? '🏷️ Catalog Manager'
                : 'Staff Admin'}
            </span>

            {isSuperAdmin && (
              <button
                onClick={() => {
                  setSuperAdminCurrentPassword('');
                  setSuperAdminNewPassword('');
                  setSuperAdminConfirmPassword('');
                  setSuperAdminPassError(null);
                  setSuperAdminPassSuccess(null);
                  setShowChangeSuperAdminPasswordModal(true);
                }}
                className="btn btn-sm"
                style={{
                  background: 'rgba(147, 51, 234, 0.25)',
                  color: '#E9D5FF',
                  border: '1px solid rgba(147, 51, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <KeyRound size={14} /> Change My Password
              </button>
            )}

            <button
              onClick={onExitAdmin}
              className="btn btn-outline-b2b btn-sm"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.3)' }}
            >
              Exit to Store
            </button>

            <button
              onClick={() => {
                logout();
                onExitAdmin();
              }}
              className="btn btn-sm"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Sub-Navigation */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '0.5rem 0' }}>
        <div className="container flex items-center gap-6 overflow-x-auto" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'overview' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <BarChart3 size={16} /> Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'products' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'products' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Package size={16} /> Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'categories' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'categories' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <FolderTree size={16} /> Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('b2c_orders')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'b2c_orders' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'b2c_orders' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: activeTab === 'b2c_orders' ? 700 : 500,
            }}
          >
            <ShoppingCart size={16} /> B2C Orders ({b2cOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('b2b_orders')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'b2b_orders' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'b2b_orders' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: activeTab === 'b2b_orders' ? 700 : 500,
            }}
          >
            <Building2 size={16} /> B2B Orders ({b2bOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('rfqs')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'rfqs' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'rfqs' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: activeTab === 'rfqs' ? 700 : 500,
            }}
          >
            <FileText size={16} /> Quotations ({quotations.length}) {pendingRfqs > 0 && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{pendingRfqs}</span>}
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'verification' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'verification' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ShieldCheck size={16} /> B2B Verification {pendingApprovals > 0 && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{pendingApprovals}</span>}
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'coupons' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'coupons' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Tag size={16} /> Coupons & Marketing
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'approvals' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'approvals' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ShieldCheck size={16} /> Staff & Approvals {pendingAdminRequests > 0 && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{pendingAdminRequests}</span>}
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'credentials' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'credentials' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <KeyRound size={16} /> User Credentials ({adminUsers.length + businesses.length + b2cUsers.length})
            {isSuperAdmin && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>👑 Master Rights</span>}
          </button>
          <button
            onClick={() => setActiveTab('media')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'media' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'media' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ImageIcon size={16} /> Storefront Banners & Media
          </button>
          <button
            onClick={() => setActiveTab('razorpay')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'razorpay' ? '#0284C7' : 'var(--slate-600)',
              borderBottom: activeTab === 'razorpay' ? '2px solid #0284C7' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: activeTab === 'razorpay' ? 700 : 600,
            }}
          >
            <CreditCard size={16} /> Razorpay Gateway ({razorpayTransactions.length})
            <span
              style={{
                backgroundColor: razorpayConfig.mode === 'live' ? '#DCFCE7' : '#FEF3C7',
                color: razorpayConfig.mode === 'live' ? '#15803D' : '#B45309',
                fontSize: '0.62rem',
                fontWeight: 800,
                padding: '0.1rem 0.4rem',
                borderRadius: '4px',
                textTransform: 'uppercase',
              }}
            >
              {razorpayConfig.mode}
            </span>
          </button>
        </div>
      </div>

      {/* Main Admin Content Container */}
      <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
        {/* Banner Alert if any action was performed */}
        {adminSuccessMsg && (
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10B981',
              borderRadius: '10px',
              color: '#065F46',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <CheckCircle2 size={18} className="text-emerald-600" />
            {adminSuccessMsg}
          </div>
        )}

        {/* 1. Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total Platform Revenue</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.3rem 0' }}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-semibold" style={{ fontSize: '0.78rem' }}>
                  <TrendingUp size={14} /> +28.4% month-over-month
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>B2B Enterprise Volume</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', margin: '0.3rem 0' }}>
                  ₹{b2bRevenue.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {Math.round((b2bRevenue / (totalRevenue || 1)) * 100)}% of total turnover
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>B2C Consumer Volume</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10B981', margin: '0.3rem 0' }}>
                  ₹{b2cRevenue.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {b2cOrders.length} Individual transactions
                </div>
              </div>

              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Pending Action Items</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#D97706', margin: '0.3rem 0' }}>
                  {pendingApprovals + pendingRfqs + pendingAdminRequests}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {pendingAdminRequests} Staff, {pendingApprovals} B2B, {pendingRfqs} RFQs
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Recent B2C Orders */}
              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Recent Consumer (B2C) Orders
                </h3>
                <div className="flex flex-col gap-3">
                  {b2cOrders.slice(0, 3).map((o) => (
                    <div key={o.id} className="flex justify-between items-center" style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.orderNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{o.customerName} • {o.items.length} items</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{o.total.toLocaleString('en-IN')}</div>
                        <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{o.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent B2B Orders */}
              <div className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
                  Recent Institutional (B2B) Orders
                </h3>
                <div className="flex flex-col gap-3">
                  {b2bOrders.slice(0, 3).map((o) => (
                    <div key={o.id} className="flex justify-between items-center" style={{ padding: '0.75rem', background: 'var(--slate-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{o.orderNumber} ({o.poNumber})</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{o.businessName}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>₹{o.grandTotal.toLocaleString('en-IN')}</div>
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{o.paymentTerms}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Catalog Management</h2>
              <button
                onClick={() => {
                  setEditingProduct({
                    id: `km-new-${Date.now()}`,
                    name: '',
                    tagline: '',
                    sku: 'KM-PAP-',
                    hsn: '48025610',
                    category: categories[0]?.name || 'Sustainable & Agri-Waste-Based Paper',
                    b2cMrp: 499,
                    b2cPrice: 349,
                    b2bWholesalePrice: 240,
                    b2bMoq: 10,
                    b2bDiscountSlabs: [{ minQty: 10, maxQty: 49, discountPercent: 0, label: 'Base' }],
                    gstRate: 18,
                    stock: 500,
                    rating: 4.8,
                    reviewCount: 1,
                    images: ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'],
                    shortDescription: '',
                    description: '',
                    specifications: {},
                    features: [],
                    dimensions: '',
                    weight: '',
                    warranty: '2 Years Manufacturer Warranty',
                    leadTimeDays: 3,
                  });
                  setShowProductModal(true);
                }}
                className="btn btn-primary btn-sm"
              >
                <Plus size={15} /> Add New Product
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>B2C Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>B2B Wholesale</th>
                    <th style={{ padding: '0.75rem 1rem' }}>MOQ</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div className="flex items-center gap-3">
                          <img src={p.images[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                          <div>
                            <strong style={{ color: 'var(--slate-900)' }}>{p.name}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>SKU: {p.sku} | HSN: {p.hsn}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.category}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>₹{p.b2cPrice.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>₹{p.b2bWholesalePrice.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.b2bMoq} Units</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`badge ${p.stock > 20 ? 'badge-green' : 'badge-amber'}`}>
                          {p.stock} Units
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setShowProductModal(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.3rem 0.6rem' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.3rem 0.6rem', color: 'var(--rose-600)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2b. Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Category Management & Taxonomy</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Organize store catalog hierarchy, banner images, and dynamic storefront filters.
                </p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="btn btn-primary btn-sm"
              >
                <Plus size={15} /> Add New Category
              </button>
            </div>

            {categoryMsg && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{categoryMsg}</span>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {categories.map((cat) => {
                const productCount = products.filter((p) => p.category === cat.name).length;
                return (
                  <div
                    key={cat.id}
                    className="card"
                    style={{
                      padding: 0,
                      overflow: 'hidden',
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {/* Card Banner */}
                    <div
                      style={{
                        height: '130px',
                        backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.25) 100%), url(${cat.image || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <span
                          style={{
                            background: 'rgba(255, 255, 255, 0.25)',
                            backdropFilter: 'blur(6px)',
                            color: '#FFFFFF',
                            fontSize: '1.2rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {cat.icon || '📁'}
                        </span>
                        <span
                          style={{
                            background: 'rgba(15, 23, 42, 0.7)',
                            backdropFilter: 'blur(4px)',
                            color: '#CBD5E1',
                            fontSize: '0.72rem',
                            fontFamily: 'monospace',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          ID: {cat.id}
                        </span>
                      </div>

                      <div className="flex justify-between items-end">
                        {productCount === 0 ? (
                          <span
                            style={{
                              background: '#D97706',
                              color: '#FFFFFF',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.65rem',
                              borderRadius: '9999px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            ✨ Coming Soon (0 Products)
                          </span>
                        ) : (
                          <span
                            style={{
                              background: 'rgba(99, 102, 241, 0.9)',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '9999px',
                            }}
                          >
                            {productCount} {productCount === 1 ? 'Product' : 'Products'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                          {cat.name}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', lineHeight: 1.4, marginBottom: '1rem' }}>
                          {cat.description || 'No description provided.'}
                        </p>
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center justify-between"
                        style={{
                          paddingTop: '0.75rem',
                          borderTop: '1px solid var(--border-color)',
                          gap: '0.5rem',
                        }}
                      >
                        {productCount === 0 && (
                          <button
                            onClick={() => {
                              setEditingProduct({
                                id: `prod_${Date.now()}`,
                                name: '',
                                tagline: '',
                                sku: `KM-${cat.name.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase()}-01`,
                                hsn: '4802',
                                category: cat.name,
                                b2cMrp: 499,
                                b2cPrice: 349,
                                b2bWholesalePrice: 249,
                                b2bMoq: 20,
                                b2bDiscountSlabs: [
                                  { minQty: 20, maxQty: 50, discountPercent: 5, label: '5% Tier 1' },
                                  { minQty: 51, discountPercent: 12, label: '12% Tier 2' },
                                ],
                                gstRate: 18,
                                stock: 100,
                                rating: 4.8,
                                reviewCount: 1,
                                images: [],
                                shortDescription: '',
                                description: '',
                                specifications: {},
                                features: [],
                                dimensions: '',
                                weight: '',
                                warranty: '1 Year Warranty',
                                leadTimeDays: 3,
                              });
                              setShowProductModal(true);
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                            title="Add first product to launch this category live"
                          >
                            <Plus size={13} /> Add Product
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="btn btn-outline btn-sm"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                        >
                          <Edit size={14} /> Edit Category
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--danger)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0.4rem 0.6rem',
                          }}
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3A. B2C Orders Tab (Retail Only) */}
        {activeTab === 'b2c_orders' && (
          <div>
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Retail Order Governance (B2C)
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Manage orders placed by retail consumer customers, track dispatch, verify online payment statuses, and issue Section 31 Retail Tax Invoices.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-amber" style={{ fontSize: '0.78rem' }}>
                  🟡 {b2cOrders.filter((o) => o.orderStatus === 'placed').length} Awaiting Confirmation
                </span>
                <span className="badge badge-green" style={{ fontSize: '0.78rem' }}>
                  🟢 {b2cOrders.filter((o) => o.orderStatus === 'confirmed').length} Confirmed
                </span>
                <span className="badge badge-blue" style={{ fontSize: '0.78rem' }}>
                  🚚 {b2cOrders.filter((o) => ['shipped', 'delivered'].includes(o.orderStatus)).length} Shipped / Delivered
                </span>
              </div>
            </div>

            {orderSuccessMsg && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <CheckCircle2 size={18} /> {orderSuccessMsg}
              </div>
            )}

            {/* B2C Filter & Search Bar */}
            <div
              className="card"
              style={{
                padding: '1rem 1.25rem',
                background: '#FFFFFF',
                marginBottom: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)', marginRight: '0.25rem' }}>
                  Order Status:
                </div>
                <select
                  value={b2cStatusFilter}
                  onChange={(e) => setB2cStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                >
                  <option value="all">All Statuses ({b2cOrders.length})</option>
                  <option value="placed">🟡 Placed ({b2cOrders.filter((o) => o.orderStatus === 'placed').length})</option>
                  <option value="confirmed">🟢 Confirmed ({b2cOrders.filter((o) => o.orderStatus === 'confirmed').length})</option>
                  <option value="processing">🔵 Processing ({b2cOrders.filter((o) => o.orderStatus === 'processing').length})</option>
                  <option value="packed">📦 Packed ({b2cOrders.filter((o) => o.orderStatus === 'packed').length})</option>
                  <option value="shipped">🚚 Shipped ({b2cOrders.filter((o) => o.orderStatus === 'shipped').length})</option>
                  <option value="delivered">🏁 Delivered ({b2cOrders.filter((o) => o.orderStatus === 'delivered').length})</option>
                  <option value="rejected">🔴 Rejected ({b2cOrders.filter((o) => o.orderStatus === 'rejected').length})</option>
                </select>
              </div>

              <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '400px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  type="text"
                  placeholder="Search by Order #, customer name, phone, email..."
                  value={b2cSearchQuery}
                  onChange={(e) => setB2cSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.82rem', paddingBlock: '0.4rem' }}
                />
              </div>
            </div>

            {/* B2C Orders Table */}
            <div className="card" style={{ padding: 0, overflowX: 'auto', background: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Ref & Date</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Customer & Contact</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Destination</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Items</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Review & Confirmation</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredB2COrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                        <ShoppingCart size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-700)' }}>
                          No Retail Orders Found
                        </div>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          No retail B2C orders match the current filter or search criteria.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredB2COrders.map((o) => (
                      <tr
                        key={o.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          background: o.orderStatus === 'placed' ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{o.orderNumber}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{o.customerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {o.customerPhone || o.shippingAddress?.phone || 'No phone'}
                          </div>
                          {o.customerEmail && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>{o.customerEmail}</div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-700)' }}>
                            {o.shippingAddress?.city || 'Noida'}, {o.shippingAddress?.pincode || '201301'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                            {o.shippingAddress?.state || 'Uttar Pradesh'}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600 }}>{o.items.reduce((s, i) => s + i.quantity, 0)} Units</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                            {o.items.length} unique SKU{o.items.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.92rem' }}>
                            ₹{o.total.toLocaleString('en-IN')}
                          </div>
                          {o.discount > 0 && (
                            <div style={{ fontSize: '0.68rem', color: '#10B981', fontWeight: 600 }}>
                              Saved ₹{o.discount.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {o.paymentMethod}
                          </div>
                          <span
                            className={`badge ${
                              o.paymentStatus === 'paid'
                                ? 'badge-green'
                                : o.paymentStatus === 'pending'
                                ? 'badge-amber'
                                : 'badge-red'
                            }`}
                            style={{ fontSize: '0.65rem' }}
                          >
                            {o.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className={`badge ${
                              o.orderStatus === 'placed'
                                ? 'badge-amber'
                                : o.orderStatus === 'confirmed'
                                ? 'badge-green'
                                : o.orderStatus === 'delivered'
                                ? 'badge-green'
                                : o.orderStatus === 'rejected'
                                ? 'badge-red'
                                : 'badge-blue'
                            }`}
                            style={{ fontSize: '0.72rem', fontWeight: 700 }}
                          >
                            {o.orderStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div className="flex items-center justify-center gap-1.5">
                            {canConfirmOrders && o.orderStatus !== 'confirmed' && o.orderStatus !== 'delivered' && (
                              <button
                                onClick={() => handleConfirmOrder('b2c', o.id)}
                                className="btn btn-sm"
                                style={{
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  color: '#059669',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.35rem 0.65rem',
                                }}
                                title="Confirm this retail order and unlock official invoice"
                              >
                                <CheckCircle2 size={13} /> Confirm
                              </button>
                            )}

                            {canRejectOrders && o.orderStatus !== 'rejected' && o.orderStatus !== 'delivered' && (
                              <button
                                onClick={() => handleOpenRejectOrderModal('b2c', o.id, o.orderNumber)}
                                className="btn btn-sm"
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#DC2626',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.35rem 0.65rem',
                                }}
                                title="Reject order"
                              >
                                <XCircle size={13} /> Reject
                              </button>
                            )}

                            {o.orderStatus === 'confirmed' && (
                              <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                                ✓ Verified
                              </span>
                            )}
                            {o.orderStatus === 'rejected' && (
                              <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                                ✕ Declined
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderForInspection({ type: 'b2c', order: o })}
                              className="btn btn-sm"
                              style={{
                                background: 'var(--slate-100)',
                                color: 'var(--slate-800)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '0.35rem 0.65rem',
                              }}
                              title="Inspect Full Retail Order Details"
                            >
                              <Eye size={13} /> Inspect
                            </button>

                            {o.orderStatus === 'placed' ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#92400e',
                                  background: '#fef3c7',
                                  border: '1px solid #fde68a',
                                  borderRadius: '4px',
                                  padding: '0.3rem 0.5rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                }}
                                title="Official Statutory Tax Invoice generated upon order confirmation"
                              >
                                🔒 Invoice on Confirmation
                              </span>
                            ) : o.orderStatus === 'rejected' ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  fontWeight: 600,
                                  color: '#991b1b',
                                  background: '#fef2f2',
                                  border: '1px solid #fecaca',
                                  borderRadius: '4px',
                                  padding: '0.3rem 0.5rem',
                                }}
                              >
                                🚫 Rejected
                              </span>
                            ) : (
                              <button
                                onClick={() => setSelectedOrderForInvoice({ order: o, isB2B: false })}
                                className="btn btn-sm"
                                style={{
                                  background: 'rgba(2, 132, 199, 0.1)',
                                  color: '#0284C7',
                                  border: '1px solid rgba(2, 132, 199, 0.3)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.35rem 0.65rem',
                                }}
                                title="View Statutory Section 31 Tax Invoice"
                              >
                                <FileText size={13} /> Tax Invoice
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3B. B2B Orders Tab (Institutional / Bulk Only) */}
        {activeTab === 'b2b_orders' && (
          <div>
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Enterprise & Institutional B2B Orders
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Manage corporate, institutional, and bulk procurement orders. Track offline payments (NEFT/RTGS/Cheque), record multi-channel orders (Phone, WhatsApp, Sales Rep), and generate Section 31 Tax Invoices.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenManualOrderModal}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Plus size={16} /> Create Manual B2B Order
                </button>
              </div>
            </div>

            {/* KPI Metric Summary Row */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total B2B Orders</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '0.2rem' }}>
                  {b2bOrders.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.1rem' }}>
                  Institutional & Wholesale Volume
                </div>
              </div>

              <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Confirmed Orders</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>
                  {b2bOrders.filter((o) => o.orderStatus === 'confirmed').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.1rem' }}>
                  Tax Invoices Released
                </div>
              </div>

              <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Awaiting Confirmation</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: '0.2rem' }}>
                  {b2bOrders.filter((o) => o.orderStatus === 'placed').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#D97706', marginTop: '0.1rem' }}>
                  Requires Super Admin PO Verification
                </div>
              </div>

              <div className="card" style={{ padding: '1.1rem 1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total Receivables Due</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626', marginTop: '0.2rem' }}>
                  ₹{b2bOrders.reduce((sum, o) => sum + (o.amountDue !== undefined ? o.amountDue : (o.paymentStatus === 'paid' ? 0 : o.grandTotal)), 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '0.1rem' }}>
                  Pending Offline / Credit Settlement
                </div>
              </div>
            </div>

            {orderSuccessMsg && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <CheckCircle2 size={18} /> {orderSuccessMsg}
              </div>
            )}

            {/* B2B Filter & Search Bar */}
            <div
              className="card"
              style={{
                padding: '1rem 1.25rem',
                background: '#FFFFFF',
                marginBottom: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)' }}>Status:</div>
                <select
                  value={b2bStatusFilter}
                  onChange={(e) => setB2bStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                >
                  <option value="all">All Statuses ({b2bOrders.length})</option>
                  <option value="placed">🟡 Placed ({b2bOrders.filter((o) => o.orderStatus === 'placed').length})</option>
                  <option value="confirmed">🟢 Confirmed ({b2bOrders.filter((o) => o.orderStatus === 'confirmed').length})</option>
                  <option value="processing">🔵 Processing ({b2bOrders.filter((o) => o.orderStatus === 'processing').length})</option>
                  <option value="shipped">🚚 Shipped ({b2bOrders.filter((o) => o.orderStatus === 'shipped').length})</option>
                  <option value="delivered">🏁 Delivered ({b2bOrders.filter((o) => o.orderStatus === 'delivered').length})</option>
                  <option value="rejected">🔴 Rejected ({b2bOrders.filter((o) => o.orderStatus === 'rejected').length})</option>
                </select>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)', marginLeft: '0.5rem' }}>Payment:</div>
                <select
                  value={b2bPaymentStatusFilter}
                  onChange={(e) => setB2bPaymentStatusFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">🟢 Paid Full</option>
                  <option value="partially_paid">🟡 Partially Paid</option>
                  <option value="payment_due">🔴 Payment Due</option>
                </select>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)', marginLeft: '0.5rem' }}>Source:</div>
                <select
                  value={b2bSourceFilter}
                  onChange={(e) => setB2bSourceFilter(e.target.value)}
                  className="form-select"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                >
                  <option value="all">All Channels</option>
                  <option value="phone">📞 Phone Call</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="email">✉️ Email</option>
                  <option value="sales_rep">👔 Sales Representative</option>
                  <option value="direct_offline">🏬 Direct / Offline</option>
                  <option value="web">🌐 Web Portal</option>
                </select>
              </div>

              <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 260px', maxWidth: '400px' }}>
                <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input
                  type="text"
                  placeholder="Search by Order #, PO #, Business, GSTIN..."
                  value={b2bSearchQuery}
                  onChange={(e) => setB2bSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.2rem', fontSize: '0.82rem', paddingBlock: '0.4rem' }}
                />
              </div>
            </div>

            {/* B2B Orders Table */}
            <div className="card" style={{ padding: 0, overflowX: 'auto', background: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Ref & PO</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Business Entity & GSTIN</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Channel</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Line Items</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Grand Total (18% GST)</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payment Status & Balance</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>PO Verification</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredB2BOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--slate-400)' }}>
                        <Building2 size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-700)' }}>
                          No Institutional B2B Orders Found
                        </div>
                        <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          No business orders match the filter or search criteria.
                        </p>
                        <button onClick={handleOpenManualOrderModal} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                          <Plus size={14} /> Create New Manual B2B Order
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredB2BOrders.map((o) => {
                      const amountPaid = Number(o.amountPaid || (o.paymentStatus === 'paid' ? o.grandTotal : 0));
                      const amountDue = o.amountDue !== undefined ? o.amountDue : Math.max(0, o.grandTotal - amountPaid);
                      const sourceLabel =
                        o.source === 'phone'
                          ? '📞 Phone Call'
                          : o.source === 'whatsapp'
                          ? '💬 WhatsApp'
                          : o.source === 'email'
                          ? '✉️ Email'
                          : o.source === 'sales_rep'
                          ? '👔 Sales Rep'
                          : o.source === 'direct_offline'
                          ? '🏬 Direct Offline'
                          : '🌐 Web Order';

                      return (
                        <tr
                          key={o.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            background: o.orderStatus === 'placed' ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{o.orderNumber}</div>
                            <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 700 }}>
                              PO: {o.poNumber || 'N/A'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--slate-900)' }}>{o.businessName}</div>
                            {o.gstin && (
                              <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
                                GSTIN: {o.gstin}
                              </div>
                            )}
                            <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>
                              {o.billingAddress?.fullName || 'Business Desk'} • {o.billingAddress?.phone || 'N/A'}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className="badge"
                              style={{
                                background:
                                  o.source === 'whatsapp'
                                    ? 'rgba(16, 185, 129, 0.15)'
                                    : o.source === 'phone'
                                    ? 'rgba(2, 132, 199, 0.15)'
                                    : 'rgba(241, 245, 249, 1)',
                                color:
                                  o.source === 'whatsapp'
                                    ? '#065F46'
                                    : o.source === 'phone'
                                    ? '#0369A1'
                                    : 'var(--slate-700)',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                              }}
                            >
                              {sourceLabel}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 600 }}>{o.items.reduce((s, i) => s + i.quantity, 0)} Units</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {o.items[0]?.productName} {o.items.length > 1 ? `+ ${o.items.length - 1} more` : ''}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                              ₹{o.grandTotal.toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#0284C7' }}>
                              GST (18%): ₹{o.totalGst.toLocaleString('en-IN')}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div className="flex items-center gap-1" style={{ marginBottom: '0.2rem' }}>
                              <span
                                className={`badge ${
                                  o.paymentStatus === 'paid'
                                    ? 'badge-green'
                                    : o.paymentStatus === 'partially_paid'
                                    ? 'badge-amber'
                                    : 'badge-red'
                                }`}
                                style={{ fontSize: '0.68rem', fontWeight: 700 }}
                              >
                                {o.paymentStatus.replace('_', ' ').toUpperCase()}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--slate-500)', textTransform: 'uppercase' }}>
                                • {(o.paymentMode || o.paymentTerms || 'Bank Transfer').replace('_', ' ')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#059669' }}>
                              Paid: <strong>₹{amountPaid.toLocaleString('en-IN')}</strong>
                            </div>
                            {amountDue > 0 ? (
                              <div style={{ fontSize: '0.7rem', color: '#DC2626', fontWeight: 700 }}>
                                Due: ₹{amountDue.toLocaleString('en-IN')}
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.68rem', color: '#059669', fontWeight: 700 }}>
                                Fully Settled ✓
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span
                              className={`badge ${
                                o.orderStatus === 'placed'
                                  ? 'badge-amber'
                                  : o.orderStatus === 'confirmed'
                                  ? 'badge-green'
                                  : o.orderStatus === 'delivered'
                                  ? 'badge-green'
                                  : o.orderStatus === 'rejected'
                                  ? 'badge-red'
                                  : 'badge-blue'
                              }`}
                              style={{ fontSize: '0.72rem', fontWeight: 700 }}
                            >
                              {o.orderStatus.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                            <div className="flex items-center justify-center gap-1.5">
                              {canConfirmOrders && o.orderStatus !== 'confirmed' && o.orderStatus !== 'delivered' && (
                                <button
                                  onClick={() => handleConfirmOrder('b2b', o.id)}
                                  className="btn btn-sm"
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.12)',
                                    color: '#059669',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.35rem 0.65rem',
                                  }}
                                  title="Confirm PO and generate official tax invoice"
                                >
                                  <CheckCircle2 size={13} /> Confirm
                                </button>
                              )}

                              {canRejectOrders && o.orderStatus !== 'rejected' && o.orderStatus !== 'delivered' && (
                                <button
                                  onClick={() => handleOpenRejectOrderModal('b2b', o.id, o.orderNumber)}
                                  className="btn btn-sm"
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    color: '#DC2626',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.35rem 0.65rem',
                                  }}
                                  title="Reject PO"
                                >
                                  <XCircle size={13} /> Reject
                                </button>
                              )}

                              {o.orderStatus === 'confirmed' && (
                                <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                                  ✓ Verified
                                </span>
                              )}
                              {o.orderStatus === 'rejected' && (
                                <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: 600 }}>
                                  ✕ Declined
                                </span>
                              )}
                            </div>
                          </td>

                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Record Offline Payment Button (Restricted to Manual Orders Only) */}
                              {o.source && o.source !== 'web' ? (
                                <button
                                  onClick={() => handleOpenOfflinePayment(o)}
                                  className="btn btn-sm"
                                  style={{
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    color: '#059669',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.35rem 0.65rem',
                                  }}
                                  title="Record Manual Offline Payment (Bank Transfer / NEFT / Cheque / Cash)"
                                >
                                  <CreditCard size={13} /> Record Payment
                                </button>
                              ) : (
                                <span
                                  className="badge"
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    color: '#2563EB',
                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                    fontSize: '0.7rem',
                                    padding: '0.35rem 0.65rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontWeight: 700,
                                  }}
                                  title="Automated Website Order: Processed via Razorpay Gateway. Manual alteration disabled."
                                >
                                  <Lock size={11} /> Razorpay Online
                                </span>
                              )}

                              <button
                                onClick={() => setSelectedOrderForInspection({ type: 'b2b', order: o })}
                                className="btn btn-sm"
                                style={{
                                  background: 'var(--slate-100)',
                                  color: 'var(--slate-800)',
                                  border: '1px solid var(--border-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '0.35rem 0.65rem',
                                }}
                                title="Inspect Full B2B Order Details"
                              >
                                <Eye size={13} /> Inspect
                              </button>

                              {o.orderStatus === 'placed' ? (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: '#92400e',
                                    background: '#fef3c7',
                                    border: '1px solid #fde68a',
                                    borderRadius: '4px',
                                    padding: '0.3rem 0.5rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.2rem',
                                  }}
                                  title="Official Statutory Tax Invoice generated upon order confirmation"
                                >
                                  🔒 Invoice Pending
                                </span>
                              ) : o.orderStatus === 'rejected' ? (
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    color: '#991b1b',
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '4px',
                                    padding: '0.3rem 0.5rem',
                                  }}
                                >
                                  🚫 Rejected
                                </span>
                              ) : (
                                <button
                                  onClick={() => setSelectedOrderForInvoice({ order: o, isB2B: true })}
                                  className="btn btn-sm"
                                  style={{
                                    background: 'rgba(2, 132, 199, 0.1)',
                                    color: '#0284C7',
                                    border: '1px solid rgba(2, 132, 199, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    padding: '0.35rem 0.65rem',
                                  }}
                                  title="View Official Statutory Section 31 B2B Tax Invoice"
                                >
                                  <FileText size={13} /> Tax Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. B2B Verification Tab */}
        {activeTab === 'verification' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              B2B Business Compliance & GST Verification
            </h2>

            <div className="flex flex-col gap-3">
              {businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="card"
                  style={{
                    padding: '1.5rem',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: 'var(--slate-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Building2 size={20} className="text-slate-700" />
                      </div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{biz.companyName}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                          GSTIN: <strong style={{ color: 'var(--primary)' }}>{biz.gstin}</strong> • PAN: {biz.pan} • Sector: {biz.businessType}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          biz.status === 'approved'
                            ? 'badge-green'
                            : biz.status === 'pending'
                            ? 'badge-amber'
                            : 'badge-dark'
                        }`}
                      >
                        {biz.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ color: 'var(--slate-400)' }}>Contact Person:</span>
                      <div style={{ fontWeight: 600 }}>{biz.contactPerson}</div>
                      <div>{biz.businessEmail} • {biz.mobile}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--slate-400)' }}>Registered Location:</span>
                      <div style={{ fontWeight: 600 }}>{biz.billingAddress.city}, {biz.billingAddress.state}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--slate-400)' }}>Documents Submitted:</span>
                      <div style={{ fontWeight: 600 }}>{biz.documents.length} Attachment(s)</div>
                    </div>
                  </div>

                  {biz.status === 'pending' && (
                    <div className="flex gap-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => handleApproveBusiness(biz.id)}
                        className="btn btn-sm btn-primary"
                      >
                        <CheckCircle2 size={14} /> Approve Verified Business Account
                      </button>
                      <button
                        onClick={() => handleRejectBusiness(biz.id)}
                        className="btn btn-sm btn-outline"
                        style={{ color: 'var(--rose-600)' }}
                      >
                        <XCircle size={14} /> Reject Application
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. RFQs Desk Tab */}
        {activeTab === 'rfqs' && (
          <div>
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  B2B Quotations & Proposals Desk
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Create manual institutional proposals, configure line items with 18% GST, manage RFQs, and convert accepted quotations directly into confirmed B2B orders.
                </p>
              </div>

              <button
                onClick={handleOpenManualQuoteModal}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
              >
                <Plus size={16} /> Create Manual B2B Quotation
              </button>
            </div>

            {quotations.length === 0 ? (
              <div className="card" style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#FFFFFF' }}>
                <p style={{ color: 'var(--slate-500)', marginBottom: '1rem' }}>No quotations or RFQs logged yet.</p>
                <button onClick={handleOpenManualQuoteModal} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Create First B2B Quotation
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {quotations.map((q) => (
                  <div key={q.id} className="card" style={{ padding: '1.5rem', background: '#FFFFFF', border: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{q.rfqNumber}</strong>
                        <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginLeft: '0.5rem', fontWeight: 600 }}>
                          Client: {q.businessName} ({q.contactPerson})
                        </span>
                        {q.gstin && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 700 }}>
                            GSTIN: {q.gstin}
                          </span>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.15rem' }}>
                          Phone: {q.phone || 'N/A'} | Email: {q.email || 'N/A'} | Created: {q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN') : (q.submittedAt ? new Date(q.submittedAt).toLocaleDateString('en-IN') : 'N/A')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {q.status === 'converted_to_order' ? (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            ✅ CONVERTED TO ORDER ({q.convertedOrderId})
                          </span>
                        ) : q.status === 'revised_quoted' ? (
                          <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 700, background: '#F3E8FF', color: '#7E22CE', border: '1px solid #D8B4FE' }}>
                            🔄 REVISED QUOTATION SENT
                          </span>
                        ) : q.status === 'revision_requested' ? (
                          <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 700, background: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
                            ⚠️ REVISION REQUESTED
                          </span>
                        ) : q.status === 'quoted' ? (
                          <span className="badge badge-blue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            PROPOSAL ISSUED
                          </span>
                        ) : q.status === 'accepted' ? (
                          <span className="badge badge-green" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            ACCEPTED BY CLIENT
                          </span>
                        ) : q.status === 'under_review' ? (
                          <span className="badge badge-amber" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            UNDER REVIEW
                          </span>
                        ) : q.status === 'draft' ? (
                          <span className="badge" style={{ fontSize: '0.75rem', fontWeight: 700, background: '#F1F5F9', color: '#475569' }}>
                            DRAFT
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {q.status.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Revision Tracker Pill */}
                    {q.revisions && q.revisions.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#7E22CE', fontWeight: 600, marginBottom: '0.75rem', background: '#FAF5FF', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px dashed #D8B4FE', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🔄</span>
                        <span>
                          Quotation has been revised <strong>{q.revisions.length} time{q.revisions.length !== 1 ? 's' : ''}</strong>. Last revision: ₹{q.revisions[q.revisions.length - 1].newGrandTotal.toLocaleString('en-IN')} by {q.revisions[q.revisions.length - 1].revisedBy}.
                        </span>
                      </div>
                    )}

                    {/* Quotation Line Items or Summary */}
                    {q.items && q.items.length > 0 ? (
                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                          Itemized Line Items ({q.items.length} Product{q.items.length !== 1 ? 's' : ''}):
                        </div>
                        <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                            <thead>
                              <tr style={{ background: 'var(--slate-50)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '0.4rem 0.6rem' }}>Product</th>
                                <th style={{ padding: '0.4rem 0.6rem' }}>HSN</th>
                                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Agreed Rate (₹)</th>
                                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>GST</th>
                                <th style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>Total (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {q.items.map((it, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                  <td style={{ padding: '0.4rem 0.6rem', fontWeight: 600 }}>{it.productName}</td>
                                  <td style={{ padding: '0.4rem 0.6rem', color: 'var(--slate-500)' }}>{it.hsn || '8471'}</td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'center' }}>{it.quantity}</td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>₹{it.unitPrice.toLocaleString('en-IN')}</td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right' }}>{it.gstRate || 18}%</td>
                                  <td style={{ padding: '0.4rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>₹{it.total.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        <div>
                          <span style={{ color: 'var(--slate-400)' }}>Product Requested:</span>
                          <div style={{ fontWeight: 700 }}>{q.productName}</div>
                          <div>SKU: {q.sku}</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-400)' }}>Volume & Target:</span>
                          <div><strong>{q.requestedQty} Units</strong> @ Target ₹{q.targetUnitPrice} / unit</div>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-400)' }}>Destination:</span>
                          <div>PIN: {q.deliveryPincode} • By: {q.requiredByDate}</div>
                        </div>
                      </div>
                    )}

                    {/* Financial Figures */}
                    {q.adminQuotation && (
                      <div
                        style={{
                          background: 'var(--slate-50)',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          fontSize: '0.85rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>Taxable Base: </span>
                          <strong>₹{q.adminQuotation.totalTaxable.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>GST (18%): </span>
                          <strong style={{ color: '#0284C7' }}>₹{q.adminQuotation.gstAmount.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>Freight / Shipping: </span>
                          <strong>{q.adminQuotation.shippingCharges ? `₹${q.adminQuotation.shippingCharges.toLocaleString('en-IN')}` : 'FREE'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--slate-500)' }}>Quotation Grand Total: </span>
                          <strong style={{ color: '#059669', fontSize: '1rem' }}>₹{q.adminQuotation.grandTotal.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', maxWidth: '500px' }}>
                        {q.specialRequirements ? `Customer Req: "${q.specialRequirements}"` : (q.notes ? `Terms: ${q.notes}` : 'Standard commercial terms apply.')}
                        {q.paymentTerms && <div style={{ fontSize: '0.72rem', color: '#0284C7', marginTop: '0.15rem' }}>Terms: {q.paymentTerms} • Delivery: {q.deliveryTerms || 'Doorstep Delivery'}</div>}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Revise Quotation Button */}
                        {q.status !== 'converted_to_order' && (
                          <button
                            onClick={() => handleOpenReviseQuoteModal(q)}
                            className="btn btn-sm"
                            style={{
                              background: '#7E22CE',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: 700,
                            }}
                            title="Revise quantities, pricing, discounts, 18% GST, freight, and terms before sending to client"
                          >
                            <Edit size={13} /> Revise Quotation
                          </button>
                        )}

                        {/* Convert to B2B Order Button */}
                        {q.status !== 'converted_to_order' && (
                          <button
                            onClick={() => handleConvertQuotationToOrder(q.id)}
                            className="btn btn-sm"
                            style={{
                              background: '#059669',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontWeight: 700,
                            }}
                            title="Convert this quotation directly into a confirmed B2B order"
                          >
                            ⚡ Convert to B2B Order
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteQuotation(q.id, q.rfqNumber)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: '#DC2626', borderColor: '#DC2626' }}
                          title="Delete Quotation"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. Coupons & Marketing Tab */}
        {activeTab === 'coupons' && (
          <div>
            <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Promotions & Coupon Governance
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Super Admin & Operations Desk: Configure discount codes, percentage caps, order minimums, and validity schedules.
                </p>
              </div>

              {canManageCoupons && (
                <button
                  onClick={handleOpenCreateCoupon}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Plus size={16} /> Create New Coupon
                </button>
              )}
            </div>

            {couponSuccessMsg && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#065F46',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                }}
              >
                <CheckCircle2 size={18} /> {couponSuccessMsg}
              </div>
            )}

            {/* Metrics */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total Configured Coupons</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                  {coupons.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Promotions across system</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Active Coupons</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', margin: '0.2rem 0' }}>
                  {coupons.filter((c) => c.isActive !== false && (!c.expiryDate || new Date(c.expiryDate).getTime() >= Date.now())).length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Live & eligible at checkout</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total Redemptions</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB', margin: '0.2rem 0' }}>
                  {coupons.reduce((sum, c) => sum + (c.usageCount || 0), 0)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Customer checkout applications</div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="card" style={{ padding: '0.75rem 1.25rem', background: '#FFFFFF', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-600)', marginRight: '0.5rem' }}>
                Filter:
              </div>
              {(['all', 'active', 'inactive', 'expired'] as const).map((filterMode) => (
                <button
                  key={filterMode}
                  onClick={() => setCouponFilter(filterMode)}
                  className="btn btn-sm"
                  style={{
                    background: couponFilter === filterMode ? 'var(--primary)' : 'var(--slate-100)',
                    color: couponFilter === filterMode ? '#FFF' : 'var(--slate-700)',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {filterMode}
                </button>
              ))}
            </div>

            {/* Coupons List / Cards */}
            {filteredCoupons.length === 0 ? (
              <div
                className="card"
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  color: 'var(--slate-500)',
                }}
              >
                <Tag size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)' }}>
                  No Coupons Found
                </div>
                <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                  {coupons.length === 0
                    ? 'No promotional coupons have been created yet. Click "+ Create New Coupon" to configure your first discount code.'
                    : 'No coupons match the selected filter.'}
                </p>
                {canManageCoupons && (
                  <button
                    onClick={handleOpenCreateCoupon}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Plus size={14} /> Create Coupon
                  </button>
                )}
              </div>
            ) : (
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {filteredCoupons.map((c) => {
                  const isExpired = c.expiryDate ? new Date(c.expiryDate).getTime() < Date.now() : false;
                  const isInactive = c.isActive === false;

                  return (
                    <div
                      key={c.id || c.code}
                      className="card"
                      style={{
                        padding: '1.25rem',
                        background: '#FFFFFF',
                        border: isExpired
                          ? '1px solid var(--border-color)'
                          : isInactive
                          ? '1px dashed var(--slate-300)'
                          : '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                          <div className="flex items-center gap-2">
                            <span
                              style={{
                                background: 'var(--slate-900)',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '6px',
                                letterSpacing: '0.05em',
                                fontFamily: 'monospace',
                              }}
                            >
                              {c.code}
                            </span>
                          </div>

                          <div>
                            {isExpired ? (
                              <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>
                                EXPIRED
                              </span>
                            ) : isInactive ? (
                              <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                                DISABLED
                              </span>
                            ) : (
                              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>
                          {c.discountType === 'percent' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                          {c.maxDiscountAmount && c.discountType === 'percent' && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 500, marginLeft: '0.4rem' }}>
                              (Capped at ₹{c.maxDiscountAmount})
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', marginBottom: '0.75rem', minHeight: '36px' }}>
                          {c.description || 'Promotional coupon applicable on qualified order totals.'}
                        </p>

                        <div
                          style={{
                            background: 'var(--slate-50)',
                            borderRadius: '8px',
                            padding: '0.6rem 0.75rem',
                            fontSize: '0.75rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            marginBottom: '1rem',
                          }}
                        >
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--slate-500)' }}>Min Cart Value:</span>
                            <strong>₹{c.minOrderValue.toLocaleString('en-IN')}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--slate-500)' }}>Validity:</span>
                            <span>
                              {c.startDate ? new Date(c.startDate).toLocaleDateString('en-IN') : 'Anytime'} →{' '}
                              {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN') : 'No Expiry'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--slate-500)' }}>Redemptions:</span>
                            <span>
                              <strong>{c.usageCount || 0}</strong>
                              {c.usageLimit ? ` / ${c.usageLimit} limit` : ' (Unlimited)'}
                            </span>
                          </div>
                          {c.createdBy && (
                            <div className="flex justify-between">
                              <span style={{ color: 'var(--slate-500)' }}>Created By:</span>
                              <span style={{ color: 'var(--slate-700)' }}>{c.createdBy}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      {canManageCoupons && (
                        <div
                          className="flex justify-between items-center"
                          style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}
                        >
                          <button
                            onClick={() => handleToggleCoupon(c.id || c.code)}
                            className="btn btn-sm"
                            style={{
                              background: c.isActive !== false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: c.isActive !== false ? '#DC2626' : '#059669',
                              border: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {c.isActive !== false ? 'Disable' : 'Enable'}
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditCoupon(c)}
                              className="btn btn-secondary btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
                            >
                              <Edit size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(c.id || c.code)}
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--danger)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.3rem 0.5rem',
                              }}
                              title="Delete Coupon"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 7. Staff Governance & Super Admin Approvals Tab */}
        {activeTab === 'approvals' && (
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Admin Staff Governance & Approvals
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Super Admin approval workflow for staff registration requests and security access control
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`badge ${isSuperAdmin ? 'badge-purple' : 'badge-blue'}`} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>
                  {isSuperAdmin ? '👑 Super Admin Authority Active' : 'Staff View'}
                </span>
              </div>
            </div>

            {/* Governance Authority Banner */}
            <div
              style={{
                background: isSuperAdmin
                  ? 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(30, 41, 59, 0.05) 100%)'
                  : 'rgba(245, 158, 11, 0.1)',
                border: isSuperAdmin ? '1px solid rgba(147, 51, 234, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: isSuperAdmin ? 'var(--primary)' : '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                {isSuperAdmin ? <ShieldCheck size={22} /> : <Lock size={22} />}
              </div>
              <div style={{ fontSize: '0.88rem', lineHeight: '1.5' }}>
                <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  {isSuperAdmin
                    ? 'Super Admin Approval Desk is Active'
                    : 'Restricted Governance Privilege Notice'}
                </div>
                <div style={{ color: 'var(--slate-600)' }}>
                  {isSuperAdmin
                    ? 'As the Super Admin, you have supreme authority to review incoming staff registration requests, verify departmental credentials, and grant operational portal access.'
                    : 'Only the Super Admin (@superadmin) holds authorization rights to approve or reject new administrative personnel. You can view the roster below.'}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total Registered Staff</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', margin: '0.2rem 0' }}>
                  {adminUsers.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>System personnel database</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Active & Approved Admins</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981', margin: '0.2rem 0' }}>
                  {adminUsers.filter((u) => u.status === 'approved').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Authorized to access console</div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Pending Super Admin Approval</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#D97706', margin: '0.2rem 0' }}>
                  {pendingAdminRequests}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                  {pendingAdminRequests > 0 ? 'Requires immediate review' : 'All requests processed'}
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Rejected / Suspended</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EF4444', margin: '0.2rem 0' }}>
                  {adminUsers.filter((u) => u.status === 'rejected').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>Denied authorization</div>
              </div>
            </div>

            {/* 1. Pending Approvals Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} className="text-amber-500" />
                  Pending Staff Authorization Requests ({pendingAdminRequests})
                </h3>
                {pendingAdminRequests > 0 && (
                  <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                    Super Admin Action Required
                  </span>
                )}
              </div>

              {pendingAdminRequests === 0 ? (
                <div
                  className="card"
                  style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    background: '#FFFFFF',
                    color: 'var(--slate-500)',
                  }}
                >
                  <CheckCircle2 size={36} className="text-emerald-500" style={{ margin: '0 auto 0.75rem' }} />
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)' }}>
                    No Pending Staff Requests
                  </div>
                  <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                    All administrative staff registrations have been reviewed. New registration requests will appear here for Super Admin approval.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {adminUsers
                    .filter((u) => u.status === 'pending')
                    .map((applicant) => (
                      <div
                        key={applicant.id}
                        className="card"
                        style={{
                          padding: '1.5rem',
                          background: '#FFFFFF',
                          border: '1.5px solid #F59E0B',
                          borderRadius: '12px',
                          boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08)',
                        }}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-3" style={{ marginBottom: '1rem' }}>
                          <div>
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                                {applicant.name}
                              </span>
                              <span style={{ fontSize: '0.82rem', color: '#9333EA', fontWeight: 700, background: 'rgba(147, 51, 234, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                                @{applicant.userId}
                              </span>
                              <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                                PENDING APPROVAL
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                              Work Email: <span style={{ color: 'var(--slate-700)', fontWeight: 600 }}>{applicant.email}</span>
                            </div>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)', textAlign: 'right' }}>
                            Applied on: {new Date(applicant.registeredAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>

                        <div
                          className="grid"
                          style={{
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '1rem',
                            padding: '1rem',
                            background: 'var(--slate-50)',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            marginBottom: '1.25rem',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.72rem' }}>
                              Department
                            </span>
                            <strong style={{ color: 'var(--slate-800)' }}>{applicant.department}</strong>
                          </div>

                          <div>
                            <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.72rem' }}>
                              Requested Security Role
                            </span>
                            <strong style={{ color: 'var(--slate-800)', textTransform: 'capitalize' }}>
                              {applicant.role.replace('_', ' ')}
                            </strong>
                          </div>

                          <div>
                            <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.72rem' }}>
                              Access Level
                            </span>
                            <strong style={{ color: '#2563EB' }}>
                              {applicant.role === 'catalog_manager' ? 'Catalog, Products & Slabbing' : 'Fulfillment, Orders & Dispatch'}
                            </strong>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center flex-wrap gap-3" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                            🛡️ Super Admin authorization will enable this user to log in with password.
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRejectAdmin(applicant.id)}
                              className="btn btn-outline-b2b btn-sm"
                              style={{ color: '#EF4444', borderColor: '#FCA5A5' }}
                            >
                              <UserX size={15} /> Reject Request
                            </button>
                            <button
                              onClick={() => handleApproveAdmin(applicant.id)}
                              className="btn btn-primary btn-sm"
                              style={{ background: '#10B981', borderColor: '#10B981' }}
                            >
                              <UserCheck size={15} /> Approve Staff Access
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 2. Authorized Staff Directory */}
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={20} className="text-emerald-600" />
                  Authorized Administrative Personnel ({adminUsers.filter((u) => u.status === 'approved').length})
                </h3>
              </div>

              <div className="card" style={{ background: '#FFFFFF', padding: '0', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>Administrator</th>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>User ID</th>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>Department</th>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>Role</th>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>Operational Permissions</th>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>Approval Status</th>
                        <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>Authorized By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers
                        .filter((u) => u.status === 'approved')
                        .map((staff) => (
                          <tr key={staff.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{staff.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{staff.email}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <code style={{ background: 'var(--slate-100)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 600 }}>
                                @{staff.userId}
                              </code>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: 'var(--slate-700)' }}>
                              {staff.department}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span
                                className={`badge ${staff.role === 'super_admin' ? 'badge-purple' : 'badge-blue'}`}
                                style={{ fontSize: '0.72rem' }}
                              >
                                {staff.role === 'super_admin' ? '👑 Super Admin' : staff.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              {staff.role === 'super_admin' ? (
                                <span style={{ fontSize: '0.75rem', color: '#9333EA', fontWeight: 700 }}>
                                  👑 Root (Unrestricted)
                                </span>
                              ) : (
                                <div className="flex flex-col gap-1.5" style={{ fontSize: '0.72rem' }}>
                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      cursor: isSuperAdmin ? 'pointer' : 'default',
                                      fontWeight: staff.permissions?.canManageCoupons ? 700 : 500,
                                      color: staff.permissions?.canManageCoupons ? '#059669' : 'var(--slate-500)',
                                    }}
                                    onClick={() => isSuperAdmin && handleToggleStaffPermission(staff.id, 'canManageCoupons')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(staff.permissions?.canManageCoupons)}
                                      disabled={!isSuperAdmin}
                                      readOnly
                                      style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
                                    />
                                    Manage Coupons
                                  </label>

                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      cursor: isSuperAdmin ? 'pointer' : 'default',
                                      fontWeight: staff.permissions?.canConfirmOrders ? 700 : 500,
                                      color: staff.permissions?.canConfirmOrders ? '#059669' : 'var(--slate-500)',
                                    }}
                                    onClick={() => isSuperAdmin && handleToggleStaffPermission(staff.id, 'canConfirmOrders')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(staff.permissions?.canConfirmOrders)}
                                      disabled={!isSuperAdmin}
                                      readOnly
                                      style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
                                    />
                                    Confirm Orders
                                  </label>

                                  <label
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      cursor: isSuperAdmin ? 'pointer' : 'default',
                                      fontWeight: staff.permissions?.canRejectOrders ? 700 : 500,
                                      color: staff.permissions?.canRejectOrders ? '#DC2626' : 'var(--slate-500)',
                                    }}
                                    onClick={() => isSuperAdmin && handleToggleStaffPermission(staff.id, 'canRejectOrders')}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={Boolean(staff.permissions?.canRejectOrders)}
                                      disabled={!isSuperAdmin}
                                      readOnly
                                      style={{ cursor: isSuperAdmin ? 'pointer' : 'default' }}
                                    />
                                    Reject Orders
                                  </label>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>
                                ✓ ACTIVE & APPROVED
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                              {staff.role === 'super_admin' ? (
                                <strong style={{ color: '#9333EA' }}>Permanent Root</strong>
                              ) : (
                                <div>
                                  By: <strong>@{staff.approvedBy || 'superadmin'}</strong>
                                  <div style={{ color: 'var(--slate-400)' }}>
                                    {staff.approvedAt ? new Date(staff.approvedAt).toLocaleDateString('en-IN') : 'Verified'}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 8. User Credentials & Master Security Hub Tab */}
        {activeTab === 'credentials' && (
          <div>
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
              <div>
                <div className="flex items-center gap-2">
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                    }}
                  >
                    <KeyRound size={20} />
                  </div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    Enterprise Credential Control & Master Security Hub
                  </h2>
                </div>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Super Admin authorization center: inspect cleartext credentials, edit user identifiers, directly override passwords, and trigger verified OTP resets across all system accounts.
                </p>
              </div>

              {isSuperAdmin && (
                <button
                  onClick={() => {
                    setSuperAdminCurrentPassword('');
                    setSuperAdminNewPassword('');
                    setSuperAdminConfirmPassword('');
                    setSuperAdminPassError(null);
                    setSuperAdminPassSuccess(null);
                    setShowChangeSuperAdminPasswordModal(true);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Lock size={15} /> Change Super Admin Password
                </button>
              )}
            </div>

            {/* Notification Banner if action performed */}
            {credSuccessMsg && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <CheckCircle2 size={18} className="text-emerald-600" />
                <strong>{credSuccessMsg}</strong>
              </div>
            )}

            {/* Firebase Live Auth Status Banner */}
            <div
              style={{
                background: isFirebaseConfigured() ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                border: isFirebaseConfigured() ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={20} style={{ color: isFirebaseConfigured() ? '#10B981' : '#3B82F6' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--slate-800)' }}>
                    Firebase Authentication Engine: {isFirebaseConfigured() ? '⚡ Production Live Mode' : '🧪 Fallback / Sandbox Mode'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {isFirebaseConfigured()
                      ? 'Connected to Google Firebase Cloud Auth. Email/Password, Google Sign-In popups, and secure resets active.'
                      : 'Mock / sandbox fallback active with 100% feature parity. Provide live keys in .env to connect live project.'}
                  </div>
                </div>
              </div>
              <span
                className={`badge ${isFirebaseConfigured() ? 'badge-green' : 'badge-blue'}`}
                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
              >
                {isFirebaseConfigured() ? 'Firebase 12.19.0 Live' : 'Demo Sandbox Active'}
              </span>
            </div>

            {/* Super Admin Rights Notice Card */}
            <div
              className="card"
              style={{
                marginBottom: '1.5rem',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(79, 70, 229, 0.05) 100%)',
                border: '1px solid rgba(147, 51, 234, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF',
                  flexShrink: 0,
                }}
              >
                <Shield size={22} />
              </div>
              <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--slate-700)' }}>
                <strong style={{ color: '#9333EA', fontSize: '0.92rem' }}>
                  {isSuperAdmin ? 'Elevated Governance Privilege Enabled' : 'Auditor / Staff Visibility Mode'}
                </strong>
                <div style={{ marginTop: '0.2rem', color: 'var(--slate-600)' }}>
                  {isSuperAdmin
                    ? 'You have complete visibility rights to reveal passwords, reassign login IDs, and perform cryptographic password resets on any administrative staff member, corporate B2B procurement account, or retail customer.'
                    : 'Credential modification and cleartext disclosure rights are restricted to the Super Admin (@superadmin).'}
                </div>
              </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div
              className="flex justify-between items-center flex-wrap gap-3"
              style={{ marginBottom: '1.25rem' }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setCredFilter('all')}
                  className={`btn btn-sm ${credFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  All Accounts ({adminUsers.length + businesses.length + b2cUsers.length})
                </button>
                <button
                  onClick={() => setCredFilter('admin')}
                  className={`btn btn-sm ${credFilter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  🛡️ Admin Staff ({adminUsers.length})
                </button>
                <button
                  onClick={() => setCredFilter('b2b')}
                  className={`btn btn-sm ${credFilter === 'b2b' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  🏢 B2B Corporate ({businesses.length})
                </button>
                <button
                  onClick={() => setCredFilter('b2c')}
                  className={`btn btn-sm ${credFilter === 'b2c' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  🛍️ B2C Customers ({b2cUsers.length})
                </button>
              </div>

              <div style={{ position: 'relative', width: '280px' }}>
                <Search
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--slate-400)' }}
                />
                <input
                  type="text"
                  placeholder="Search user, ID, email..."
                  value={credSearch}
                  onChange={(e) => setCredSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '36px', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Consolidated User Credentials Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr
                      style={{
                        background: 'var(--slate-50)',
                        borderBottom: '1px solid var(--border-color)',
                        textAlign: 'left',
                      }}
                    >
                      <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>
                        User / Entity
                      </th>
                      <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>
                        Account Type
                      </th>
                      <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>
                        Primary Login ID / Identifier
                      </th>
                      <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>
                        Password (Show / Hide Rights)
                      </th>
                      <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700 }}>
                        Status
                      </th>
                      <th style={{ padding: '0.85rem 1rem', color: 'var(--slate-600)', fontWeight: 700, textAlign: 'right' }}>
                        Super Admin Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 1. Admins */}
                    {(credFilter === 'all' || credFilter === 'admin') &&
                      adminUsers
                        .filter((u) => {
                          if (!credSearch.trim()) return true;
                          const q = credSearch.toLowerCase();
                          return (
                            u.name.toLowerCase().includes(q) ||
                            u.userId.toLowerCase().includes(q) ||
                            u.email.toLowerCase().includes(q)
                          );
                        })
                        .map((u) => {
                          const isRevealed = !!revealedPasswords[`admin_${u.id}`];
                          const pwd = u.password || 'AdminOps@123';
                          return (
                            <tr key={`admin_${u.id}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{u.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                  Dept: {u.department}
                                </div>
                                {u.firebaseUid && (
                                  <div style={{ fontSize: '0.68rem', color: '#9333EA', marginTop: '0.2rem' }}>
                                    🔥 Firebase UID: <code style={{ fontSize: '0.65rem' }}>{u.firebaseUid.slice(0, 10)}...</code>
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className={`badge ${u.role === 'super_admin' ? 'badge-purple' : 'badge-blue'}`}
                                  style={{ fontSize: '0.72rem' }}
                                >
                                  {u.role === 'super_admin' ? '👑 Super Admin' : u.role.replace('_', ' ')}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <code
                                  style={{
                                    background: 'var(--slate-100)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    color: '#9333EA',
                                  }}
                                >
                                  @{u.userId}
                                </code>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.15rem' }}>
                                  {u.email}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div className="flex items-center gap-2">
                                  {isRevealed ? (
                                    <span
                                      style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#047857',
                                        background: '#D1FAE5',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {pwd}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        letterSpacing: '2px',
                                        color: 'var(--slate-400)',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      ••••••••••••
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleTogglePasswordReveal(`admin_${u.id}`)}
                                    className="btn btn-sm"
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'var(--slate-100)',
                                      color: 'var(--slate-600)',
                                    }}
                                    title={isRevealed ? 'Hide Password' : 'Show Password'}
                                  >
                                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>

                                  {isRevealed && (
                                    <button
                                      onClick={() => handleCopyPassword(`admin_${u.id}`, pwd)}
                                      className="btn btn-sm"
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        background: copiedId === `admin_${u.id}` ? '#D1FAE5' : 'var(--slate-100)',
                                        color: copiedId === `admin_${u.id}` ? '#047857' : 'var(--slate-600)',
                                      }}
                                      title="Copy Password"
                                    >
                                      {copiedId === `admin_${u.id}` ? <Check size={13} /> : <Copy size={13} />}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className={`badge ${
                                    u.status === 'approved'
                                      ? 'badge-green'
                                      : u.status === 'pending'
                                      ? 'badge-amber'
                                      : 'badge-dark'
                                  }`}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {u.status.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleOpenEditCred(
                                        'admin',
                                        u.id,
                                        u.name,
                                        u.userId,
                                        u.email,
                                        u.password
                                      )
                                    }
                                    className="btn btn-sm btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                  >
                                    Edit ID / Pass
                                  </button>
                                  <button
                                    onClick={() => handleOpenOtpReset('admin', u.id, u.name, u.userId)}
                                    className="btn btn-sm"
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.35rem 0.65rem',
                                      background: 'rgba(147, 51, 234, 0.1)',
                                      color: '#9333EA',
                                      border: '1px solid rgba(147, 51, 234, 0.25)',
                                    }}
                                  >
                                    Reset via OTP
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                    {/* 2. B2B Businesses */}
                    {(credFilter === 'all' || credFilter === 'b2b') &&
                      businesses
                        .filter((b) => {
                          if (!credSearch.trim()) return true;
                          const q = credSearch.toLowerCase();
                          return (
                            b.companyName.toLowerCase().includes(q) ||
                            b.businessEmail.toLowerCase().includes(q) ||
                            b.mobile.includes(q) ||
                            b.gstin.toLowerCase().includes(q)
                          );
                        })
                        .map((b) => {
                          const isRevealed = !!revealedPasswords[`b2b_${b.id}`];
                          const pwd = b.password || 'B2bEdu@123';
                          return (
                            <tr key={`b2b_${b.id}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{b.companyName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                  Contact: {b.contactPerson} ({b.businessType})
                                </div>
                                {b.firebaseUid && (
                                  <div style={{ fontSize: '0.68rem', color: '#D97706', marginTop: '0.2rem' }}>
                                    🔥 {b.authProvider === 'firebase_google' ? 'Google Auth' : 'Firebase'}: <code style={{ fontSize: '0.65rem' }}>{b.firebaseUid.slice(0, 10)}...</code>
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span className="badge badge-amber" style={{ fontSize: '0.72rem' }}>
                                  🏢 B2B Corporate Entity
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{b.businessEmail}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.15rem' }}>
                                  Mobile: {b.mobile} • GSTIN: {b.gstin}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div className="flex items-center gap-2">
                                  {isRevealed ? (
                                    <span
                                      style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#047857',
                                        background: '#D1FAE5',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {pwd}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        letterSpacing: '2px',
                                        color: 'var(--slate-400)',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      ••••••••••••
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleTogglePasswordReveal(`b2b_${b.id}`)}
                                    className="btn btn-sm"
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'var(--slate-100)',
                                      color: 'var(--slate-600)',
                                    }}
                                    title={isRevealed ? 'Hide Password' : 'Show Password'}
                                  >
                                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>

                                  {isRevealed && (
                                    <button
                                      onClick={() => handleCopyPassword(`b2b_${b.id}`, pwd)}
                                      className="btn btn-sm"
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        background: copiedId === `b2b_${b.id}` ? '#D1FAE5' : 'var(--slate-100)',
                                        color: copiedId === `b2b_${b.id}` ? '#047857' : 'var(--slate-600)',
                                      }}
                                      title="Copy Password"
                                    >
                                      {copiedId === `b2b_${b.id}` ? <Check size={13} /> : <Copy size={13} />}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span
                                  className={`badge ${
                                    b.status === 'approved'
                                      ? 'badge-green'
                                      : b.status === 'pending'
                                      ? 'badge-amber'
                                      : 'badge-dark'
                                  }`}
                                  style={{ fontSize: '0.7rem' }}
                                >
                                  {b.status.toUpperCase()}
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleOpenEditCred(
                                        'b2b',
                                        b.id,
                                        b.companyName,
                                        b.businessEmail,
                                        b.mobile,
                                        b.password
                                      )
                                    }
                                    className="btn btn-sm btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                  >
                                    Edit ID / Pass
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleOpenOtpReset('b2b', b.id, b.companyName, b.businessEmail)
                                    }
                                    className="btn btn-sm"
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.35rem 0.65rem',
                                      background: 'rgba(217, 119, 6, 0.1)',
                                      color: '#D97706',
                                      border: '1px solid rgba(217, 119, 6, 0.25)',
                                    }}
                                  >
                                    Reset via OTP
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                    {/* 3. B2C Customers */}
                    {(credFilter === 'all' || credFilter === 'b2c') &&
                      b2cUsers
                        .filter((c) => {
                          if (!credSearch.trim()) return true;
                          const q = credSearch.toLowerCase();
                          return (
                            c.name.toLowerCase().includes(q) ||
                            c.email.toLowerCase().includes(q) ||
                            c.phone.includes(q)
                          );
                        })
                        .map((c) => {
                          const isRevealed = !!revealedPasswords[`b2c_${c.id}`];
                          const pwd = c.password || 'Customer@123';
                          return (
                            <tr key={`b2c_${c.id}`} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{c.name}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                                  Member since: {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                </div>
                                {c.firebaseUid && (
                                  <div style={{ fontSize: '0.68rem', color: '#10B981', marginTop: '0.2rem' }}>
                                    🔥 {c.authProvider === 'firebase_google' ? 'Google Auth' : 'Firebase'}: <code style={{ fontSize: '0.65rem' }}>{c.firebaseUid.slice(0, 10)}...</code>
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>
                                  🛍️ B2C Customer
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{c.email}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', marginTop: '0.15rem' }}>
                                  Phone: {c.phone}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <div className="flex items-center gap-2">
                                  {isRevealed ? (
                                    <span
                                      style={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        color: '#047857',
                                        background: '#D1FAE5',
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {pwd}
                                    </span>
                                  ) : (
                                    <span
                                      style={{
                                        letterSpacing: '2px',
                                        color: 'var(--slate-400)',
                                        fontSize: '0.9rem',
                                      }}
                                    >
                                      ••••••••••••
                                    </span>
                                  )}

                                  <button
                                    onClick={() => handleTogglePasswordReveal(`b2c_${c.id}`)}
                                    className="btn btn-sm"
                                    style={{
                                      padding: '0.25rem 0.5rem',
                                      background: 'var(--slate-100)',
                                      color: 'var(--slate-600)',
                                    }}
                                    title={isRevealed ? 'Hide Password' : 'Show Password'}
                                  >
                                    {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>

                                  {isRevealed && (
                                    <button
                                      onClick={() => handleCopyPassword(`b2c_${c.id}`, pwd)}
                                      className="btn btn-sm"
                                      style={{
                                        padding: '0.25rem 0.5rem',
                                        background: copiedId === `b2c_${c.id}` ? '#D1FAE5' : 'var(--slate-100)',
                                        color: copiedId === `b2c_${c.id}` ? '#047857' : 'var(--slate-600)',
                                      }}
                                      title="Copy Password"
                                    >
                                      {copiedId === `b2c_${c.id}` ? <Check size={13} /> : <Copy size={13} />}
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td style={{ padding: '0.85rem 1rem' }}>
                                <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                                  ACTIVE
                                </span>
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() =>
                                      handleOpenEditCred(
                                        'b2c',
                                        c.id,
                                        c.name,
                                        c.email,
                                        c.phone,
                                        c.password
                                      )
                                    }
                                    className="btn btn-sm btn-outline"
                                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                                  >
                                    Edit ID / Pass
                                  </button>
                                  <button
                                    onClick={() => handleOpenOtpReset('b2c', c.id, c.name, c.email)}
                                    className="btn btn-sm"
                                    style={{
                                      fontSize: '0.75rem',
                                      padding: '0.35rem 0.65rem',
                                      background: 'rgba(2, 132, 199, 0.1)',
                                      color: '#0284C7',
                                      border: '1px solid rgba(2, 132, 199, 0.25)',
                                    }}
                                  >
                                    Reset via OTP
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Storefront Banners & Media Tab */}
        {activeTab === 'media' && (
          <div>
            <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: '2rem' }}>
              <div>
                <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>
                  Media Asset Management
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Storefront Banners & Promotional Media</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                  Upload high-resolution promotional banners, hero graphics, and official platform logos directly from your device.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {mediaSavedMsg && (
                  <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} /> Media Saved & Applied!
                  </span>
                )}
                <button
                  onClick={handleSaveSiteMedia}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Check size={16} /> Save Media Assets
                </button>
              </div>
            </div>

            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {/* Homepage Hero Banner */}
              <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  1. Homepage Hero Visual Banner
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                  Primary high-impact visual presented on the right side of the B2C Homepage Hero section.
                </p>
                <ImageUpload
                  label="Hero Banner Image"
                  helperText="Recommended 1200x800px. JPG, PNG, or WebP."
                  aspectRatio="banner"
                  value={siteMedia.heroBanner || ''}
                  onChange={(val) => {
                    const img = typeof val === 'string' ? val : val[0] || '';
                    setSiteMedia({ ...siteMedia, heroBanner: img });
                  }}
                />
              </div>

              {/* Brand Value Assurance Banner */}
              <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  2. Brand Value Assurance Banner
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                  Horizontal banner highlighting pan-India delivery, GST invoicing, and institutional pricing.
                </p>
                <ImageUpload
                  label="Assurance Banner Image"
                  helperText="Recommended 1200x320px. JPG, PNG, or WebP."
                  aspectRatio="banner"
                  value={siteMedia.assuranceBanner || ''}
                  onChange={(val) => {
                    const img = typeof val === 'string' ? val : val[0] || '';
                    setSiteMedia({ ...siteMedia, assuranceBanner: img });
                  }}
                />
              </div>

              {/* Official Brand Logo */}
              <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  3. Official Platform Brand Logo
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                  Transparent PNG / SVG logo displayed on top navigations, invoice printouts, and footers.
                </p>
                <ImageUpload
                  label="Brand Logo"
                  helperText="Recommended transparent PNG or WebP. Square or 4:3 proportion."
                  aspectRatio="square"
                  value={siteMedia.logo || ''}
                  onChange={(val) => {
                    const img = typeof val === 'string' ? val : val[0] || '';
                    setSiteMedia({ ...siteMedia, logo: img });
                  }}
                />
              </div>

              {/* GeM & ONDC Platform Logos */}
              <div className="card" style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  4. GeM & ONDC Accreditations
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
                  Official trust badge images shown in "Available On" hero blocks and portal footers.
                </p>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <ImageUpload
                    label="GeM Logo"
                    helperText="GeM emblem"
                    aspectRatio="square"
                    value={siteMedia.gemLogo || ''}
                    onChange={(val) => {
                      const img = typeof val === 'string' ? val : val[0] || '';
                      setSiteMedia({ ...siteMedia, gemLogo: img });
                    }}
                  />
                  <ImageUpload
                    label="ONDC Logo"
                    helperText="ONDC emblem"
                    aspectRatio="square"
                    value={siteMedia.ondcLogo || ''}
                    onChange={(val) => {
                      const img = typeof val === 'string' ? val : val[0] || '';
                      setSiteMedia({ ...siteMedia, ondcLogo: img });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Razorpay Payment Gateway & Live Transactions Ledger Tab */}
        {activeTab === 'razorpay' && (
          <div>
            <div className="flex items-center justify-between gap-4 flex-wrap" style={{ marginBottom: '2rem' }}>
              <div>
                <span
                  style={{
                    backgroundColor: '#E0F2FE',
                    color: '#0284C7',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '0.4rem',
                  }}
                >
                  Official Payment Gateway Integration
                </span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Razorpay Control Center & Transaction Ledger</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                  Manage merchant API credentials, toggle live vs sandbox test environment, customize checkout themes, and review real-time transaction settlements.
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setAdminTestCheckoutOpen(true)}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <CreditCard size={15} /> Test Checkout Modal
                </button>
                <button
                  type="button"
                  onClick={refreshRazorpayTransactions}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
                >
                  <RefreshCw size={15} /> Refresh Ledger
                </button>
                {rzpSavedMsg && (
                  <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={14} /> Settings Saved!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveRazorpayConfig}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  }}
                >
                  <Check size={16} /> Save Gateway Config
                </button>
              </div>
            </div>

            {/* Razorpay Gateway Analytics KPIs */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem',
              }}
            >
              <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Total Captured Revenue
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', marginTop: '0.25rem' }}>
                  ₹{razorpayTransactions.reduce((acc, t) => acc + (t.status === 'captured' ? t.amount : 0), 0).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '0.2rem', fontWeight: 600 }}>
                  ✓ 100% Settled & Reconciled
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Settled Transactions
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0F172A', marginTop: '0.25rem' }}>
                  {razorpayTransactions.length}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  B2C Consumer & B2B Procurement
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Gateway Environment
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.25rem', color: razorpayConfig.mode === 'live' ? '#16A34A' : '#D97706' }}>
                  {razorpayConfig.mode === 'live' ? '🟢 LIVE PRODUCTION' : '🟡 SANDBOX TEST'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Active Key: <code>{razorpayConfig.keyId.slice(0, 14)}...</code>
                </div>
              </div>

              <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Instruments Online
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginTop: '0.25rem' }}>
                  UPI, Cards, NetBanking, NEFT
                </div>
                <div style={{ fontSize: '0.75rem', color: '#0284C7', marginTop: '0.2rem', fontWeight: 600 }}>
                  Instant Automated Settlement
                </div>
              </div>
            </div>

            {/* Split Grid: Settings Form & Transaction History */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                gap: '1.75rem',
                marginBottom: '2rem',
                alignItems: 'start',
              }}
            >
              {/* Configuration Form Card */}
              <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                  <ShieldCheck size={20} className="text-sky-600" />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Razorpay API Credentials & Settings</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Gateway Environment Mode</label>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setRazorpayConfig({ ...razorpayConfig, mode: 'test' })}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: razorpayConfig.mode === 'test' ? '2px solid #D97706' : '1px solid #CBD5E1',
                        background: razorpayConfig.mode === 'test' ? '#FEF3C7' : '#FFFFFF',
                        color: razorpayConfig.mode === 'test' ? '#92400E' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🟡 Test Mode (Sandbox)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRazorpayConfig({ ...razorpayConfig, mode: 'live' })}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: razorpayConfig.mode === 'live' ? '2px solid #16A34A' : '1px solid #CBD5E1',
                        background: razorpayConfig.mode === 'live' ? '#DCFCE7' : '#FFFFFF',
                        color: razorpayConfig.mode === 'live' ? '#15803D' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      🟢 Live Production
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Razorpay Key ID *</label>
                  <input
                    type="text"
                    value={razorpayConfig.keyId}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keyId: e.target.value.trim() })}
                    placeholder="rzp_test_... or rzp_live_..."
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}
                    required
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                    Provided in your Razorpay Dashboard &gt; Settings &gt; API Keys
                  </span>
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center">
                    <label className="form-label">Razorpay Key Secret (Server-Side)</label>
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                      style={{ fontSize: '0.75rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showKeySecret ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showKeySecret ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showKeySecret ? 'text' : 'password'}
                    value={razorpayConfig.keySecret || ''}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, keySecret: e.target.value.trim() })}
                    placeholder="Enter Key Secret"
                    className="form-input"
                    style={{ fontFamily: 'monospace', fontSize: '0.88rem' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Merchant Name Displayed on Checkout</label>
                  <input
                    type="text"
                    value={razorpayConfig.merchantName}
                    onChange={(e) => setRazorpayConfig({ ...razorpayConfig, merchantName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Checkout Modal Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={razorpayConfig.themeColor}
                      onChange={(e) => setRazorpayConfig({ ...razorpayConfig, themeColor: e.target.value })}
                      style={{ width: '42px', height: '38px', borderRadius: '6px', border: '1px solid #CBD5E1', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={razorpayConfig.themeColor}
                      onChange={(e) => setRazorpayConfig({ ...razorpayConfig, themeColor: e.target.value })}
                      className="form-input"
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <label className="form-label" style={{ marginBottom: '0.6rem' }}>Enabled Payment Methods</label>
                  <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem' }}>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={razorpayConfig.enabledMethods?.upi ?? true}
                        onChange={(e) =>
                          setRazorpayConfig({
                            ...razorpayConfig,
                            enabledMethods: { ...razorpayConfig.enabledMethods, upi: e.target.checked },
                          })
                        }
                      />
                      <span>UPI (GPay / PhonePe)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={razorpayConfig.enabledMethods?.card ?? true}
                        onChange={(e) =>
                          setRazorpayConfig({
                            ...razorpayConfig,
                            enabledMethods: { ...razorpayConfig.enabledMethods, card: e.target.checked },
                          })
                        }
                      />
                      <span>Credit / Debit Cards</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={razorpayConfig.enabledMethods?.netbanking ?? true}
                        onChange={(e) =>
                          setRazorpayConfig({
                            ...razorpayConfig,
                            enabledMethods: { ...razorpayConfig.enabledMethods, netbanking: e.target.checked },
                          })
                        }
                      />
                      <span>Net Banking (50+ Banks)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={razorpayConfig.enabledMethods?.wallet ?? true}
                        onChange={(e) =>
                          setRazorpayConfig({
                            ...razorpayConfig,
                            enabledMethods: { ...razorpayConfig.enabledMethods, wallet: e.target.checked },
                          })
                        }
                      />
                      <span>Wallets (Paytm/CRED)</span>
                    </label>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={handleSaveRazorpayConfig}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                  >
                    Save Gateway Configuration
                  </button>
                </div>
              </div>

              {/* Instructions & Help Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    background: '#0F172A',
                    color: '#FFFFFF',
                    border: '1px solid #1E293B',
                  }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: '0.8rem' }}>
                    <Lock size={18} className="text-sky-400" />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF' }}>
                      Razorpay Production Verification Checklist
                    </h4>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: '1.6' }}>
                    <p style={{ marginBottom: '0.6rem' }}>
                      To accept live Indian Rupee (INR) payments into Kogniti Minds Private Limited's HDFC Bank Current Account:
                    </p>
                    <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <li>Ensure Company KYC is approved on Razorpay Dashboard using CIN <code>U46496UP2024PTC213997</code> & GSTIN <code>09AALCK4750F1ZC</code>.</li>
                      <li>Generate Live API Keys (starting with <code>rzp_live_...</code>) under <strong>Settings &gt; API Keys</strong>.</li>
                      <li>Paste the Live Key ID above and switch environment mode to <strong>🟢 Live Production</strong>.</li>
                      <li>All B2C orders and B2B invoices will automatically capture funds via Razorpay.</li>
                    </ul>
                  </div>
                </div>

                {/* Webhook & Auto-Reconciliation Info */}
                <div
                  className="card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.4rem' }}>
                    Automated Webhook & Smart Collect Status
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.5', marginBottom: '0.8rem' }}>
                    Razorpay Smart Collect automatically reconciles virtual account NEFT / RTGS transfers against B2B commercial purchase orders without manual entry.
                  </p>
                  <div style={{ fontSize: '0.78rem', background: '#FFFFFF', padding: '0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                    <div><strong>Webhook Endpoint:</strong> <code>https://kognitiminds.com/api/razorpay-webhook</code></div>
                    <div style={{ marginTop: '0.25rem' }}><strong>Subscribed Events:</strong> <code>payment.captured</code>, <code>order.paid</code></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Transaction Ledger Table */}
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-lg)', background: '#FFFFFF' }}>
              <div className="flex justify-between items-center flex-wrap gap-3" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Live Transactions Ledger & Settlement Log</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                    Audited ledger of all payment attempts, customer names, methods, and bank transaction references
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div style={{ position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--slate-400)' }} />
                    <input
                      type="text"
                      placeholder="Search payment ID, order #, or customer..."
                      value={rzpSearchQuery}
                      onChange={(e) => setRzpSearchQuery(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '2rem', fontSize: '0.82rem', width: '280px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--slate-50)', borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem' }}>Payment ID</th>
                      <th style={{ padding: '0.75rem' }}>Order Ref</th>
                      <th style={{ padding: '0.75rem' }}>Portal</th>
                      <th style={{ padding: '0.75rem' }}>Customer & Contact</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.75rem' }}>Method & Bank RRN</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Gateway Mode</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.75rem' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {razorpayTransactions
                      .filter((t) => {
                        if (!rzpSearchQuery) return true;
                        const q = rzpSearchQuery.toLowerCase();
                        return (
                          t.paymentId.toLowerCase().includes(q) ||
                          t.orderNumber.toLowerCase().includes(q) ||
                          t.customerName.toLowerCase().includes(q) ||
                          t.customerEmail.toLowerCase().includes(q) ||
                          t.bankRrn.toLowerCase().includes(q)
                        );
                      })
                      .map((t) => (
                        <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#0284C7' }}>
                            {t.paymentId}
                          </td>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                            {t.orderNumber}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span
                              className={`badge ${t.orderType === 'b2b' ? 'badge-purple' : 'badge-blue'}`}
                              style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}
                            >
                              {t.orderType.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{t.customerName}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>{t.customerEmail} • {t.customerPhone}</div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 800, color: 'var(--slate-900)' }}>
                            ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <div style={{ fontWeight: 600 }}>{t.method}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontFamily: 'monospace' }}>
                              RRN: {t.bankRrn}
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span
                              style={{
                                backgroundColor: t.gatewayMode === 'live' ? '#DCFCE7' : '#FEF3C7',
                                color: t.gatewayMode === 'live' ? '#15803D' : '#B45309',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {t.gatewayMode}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                            <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                              <CheckCircle2 size={12} /> CAPTURED
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.76rem', color: 'var(--slate-500)' }}>
                            {new Date(t.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RFQ Formulate Modal */}
      {activeRfqForQuote && (
        <div className="modal-overlay" onClick={() => setActiveRfqForQuote(null)}>
          <div className="modal-content" style={{ maxWidth: '520px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Issue Quotation for {activeRfqForQuote.rfqNumber}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
              Client: {activeRfqForQuote.businessName} • Requested {activeRfqForQuote.requestedQty} units
            </p>

            <form onSubmit={handleSubmitAdminQuote}>
              <div className="form-group">
                <label className="form-label">Quoted Unit Rate (₹ Excl. 18% GST)</label>
                <input
                  type="number"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quotation Validity Expiry Date</label>
                <input
                  type="date"
                  value={quoteValidDate}
                  onChange={(e) => setQuoteValidDate(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Terms & Proposal Notes</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setActiveRfqForQuote(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Send size={15} /> Send Quotation to Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Edit Modal */}
      {showProductModal && editingProduct && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" style={{ maxWidth: '650px', padding: '2rem' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Add / Edit Catalog Product
            </h3>

            <form onSubmit={handleSaveProduct}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">HSN Code (GST)</label>
                  <input
                    type="text"
                    value={editingProduct.hsn}
                    onChange={(e) => setEditingProduct({ ...editingProduct, hsn: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="form-select"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">B2C MRP (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.b2cMrp}
                    onChange={(e) => setEditingProduct({ ...editingProduct, b2cMrp: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">B2C Sale Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.b2cPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, b2cPrice: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">B2B Wholesale Price (₹)</label>
                  <input
                    type="number"
                    value={editingProduct.b2bWholesalePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, b2bWholesalePrice: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">B2B MOQ (Units)</label>
                  <input
                    type="number"
                    value={editingProduct.b2bMoq}
                    onChange={(e) => setEditingProduct({ ...editingProduct, b2bMoq: Number(e.target.value) })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <ImageUpload
                  label="Product Images (Upload Directly from Device)"
                  helperText="Upload product photos from device (JPG, PNG, WebP). The first image serves as the main catalog cover photo."
                  value={editingProduct.images}
                  multiple={true}
                  maxFiles={5}
                  onChange={(val) => {
                    const imgs = Array.isArray(val) ? val.filter(Boolean) : val ? [val] : [];
                    setEditingProduct({ ...editingProduct, images: imgs });
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.shortDescription}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px', width: '100%' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  {categoryForm.isNew ? 'Create New Category' : `Edit Category: ${categoryOriginalName}`}
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  {categoryForm.isNew
                    ? 'Define a new taxonomy group for the B2C & B2B storefronts.'
                    : 'Changes to category name will automatically synchronize all linked products.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCategoryForm((prev) => ({
                      ...prev,
                      name: newName,
                      id: prev.isNew ? newName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.id,
                    }));
                  }}
                  placeholder="e.g. Sustainable & Agri-Waste-Based Paper, Notebooks"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Slug / ID *</label>
                  <input
                    type="text"
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    placeholder="e.g. notebooks-journals"
                    className="form-input"
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>Used as unique internal key</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Icon / Emoji</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="🪑, 📺, 🤖"
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: '1.1rem' }}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>Emoji or symbol</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows={2}
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Short overview of what products belong in this category..."
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <ImageUpload
                  label="Category Cover Banner Image (Upload Directly from Device)"
                  helperText="Upload category card banner or cover photo directly from your device (JPG, PNG, WebP)."
                  value={categoryForm.image}
                  aspectRatio="banner"
                  onChange={(val) => {
                    const img = Array.isArray(val) ? val[0] || '' : val;
                    setCategoryForm({ ...categoryForm, image: img });
                  }}
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {categoryForm.isNew ? 'Create Category' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Statutory GST Tax Invoice Modal */}
      {selectedOrderForInvoice && (
        <OrderInvoiceModal
          order={selectedOrderForInvoice.order}
          isB2B={selectedOrderForInvoice.isB2B}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}

      {/* 1. Change Super Admin Password Modal */}
      {showChangeSuperAdminPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowChangeSuperAdminPasswordModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                  }}
                >
                  <Lock size={16} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Change Super Admin Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChangeSuperAdminPasswordModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {superAdminPassError && (
              <div
                style={{
                  background: 'var(--rose-50)',
                  border: '1px solid var(--rose-100)',
                  color: 'var(--rose-600)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{superAdminPassError}</span>
              </div>
            )}

            {superAdminPassSuccess && (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{superAdminPassSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSuperAdminChangePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current Super Admin Password *</label>
                <input
                  type="password"
                  value={superAdminCurrentPassword}
                  onChange={(e) => setSuperAdminCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password * (Min. 6 chars)</label>
                <input
                  type="password"
                  value={superAdminNewPassword}
                  onChange={(e) => setSuperAdminNewPassword(e.target.value)}
                  placeholder="Enter secure new password"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  value={superAdminConfirmPassword}
                  onChange={(e) => setSuperAdminConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input"
                  required
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowChangeSuperAdminPasswordModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Super Admin Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Edit User Credentials Modal */}
      {showEditCredModal && editingCredTarget && (
        <div className="modal-overlay" onClick={() => setShowEditCredModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Edit User ID & Credentials
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Super Admin direct credential override for {editingCredTarget.name} ({editingCredTarget.type.toUpperCase()})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCredModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCredSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Account / Display Name</label>
                <input
                  type="text"
                  value={editCredForm.name}
                  onChange={(e) => setEditCredForm({ ...editCredForm, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingCredTarget.type === 'admin' ? 'Administrative User ID *' : 'Primary Login Email *'}
                </label>
                <input
                  type="text"
                  value={editCredForm.identifier}
                  onChange={(e) => setEditCredForm({ ...editCredForm, identifier: e.target.value })}
                  className="form-input"
                  required
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                  {editingCredTarget.type === 'admin'
                    ? 'Unique login handle without spaces (e.g. admin_ops)'
                    : 'Registered email used for authentication'}
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingCredTarget.type === 'admin' ? 'Official Work Email *' : 'Contact Mobile / Phone *'}
                </label>
                <input
                  type="text"
                  value={editCredForm.secondaryIdentifier}
                  onChange={(e) => setEditCredForm({ ...editCredForm, secondaryIdentifier: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Set New Password (Direct Super Admin Override)</label>
                <input
                  type="text"
                  value={editCredForm.newPassword}
                  onChange={(e) => setEditCredForm({ ...editCredForm, newPassword: e.target.value })}
                  placeholder="Leave as is or enter new password"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontWeight: 600 }}
                  required
                />
                <span style={{ fontSize: '0.72rem', color: '#047857' }}>
                  ✓ Super Admin has master privilege to set cleartext passwords directly
                </span>
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowEditCredModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Trigger OTP Password Reset Modal */}
      {showOtpResetModal && otpResetTarget && (
        <div className="modal-overlay" onClick={() => setShowOtpResetModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  OTP-Authenticated Password Reset
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Cryptographic OTP verification for {otpResetTarget.name} ({otpResetTarget.identifier})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpResetModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Simulated Live OTP Dispatch Notice */}
            {generatedOtpInfo && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #EDE9FE 0%, #E0E7FF 100%)',
                  border: '1.5px solid #8B5CF6',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.12)',
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    ✨ Live OTP Dispatch Simulation
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#7C3AED' }}>Valid for 10 minutes</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#4C1D95', lineHeight: 1.4 }}>
                  Verification OTP generated for <strong>{generatedOtpInfo.targetIdentifier}</strong>:
                </div>
                <div className="flex items-center gap-3" style={{ marginTop: '0.5rem' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '1.4rem',
                      fontWeight: 900,
                      letterSpacing: '4px',
                      background: '#FFFFFF',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '8px',
                      color: '#6D28D9',
                      border: '1px solid #C4B5FD',
                    }}
                  >
                    {generatedOtpInfo.otp}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOtpResetForm({ ...otpResetForm, inputOtp: generatedOtpInfo.otp })}
                    className="btn btn-sm"
                    style={{ background: '#7C3AED', color: '#FFFFFF', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              </div>
            )}

            {otpResetMsg && (
              <div
                style={{
                  background: otpResetMsg.success ? '#ECFDF5' : 'var(--rose-50)',
                  border: `1px solid ${otpResetMsg.success ? '#A7F3D0' : 'var(--rose-100)'}`,
                  color: otpResetMsg.success ? '#065F46' : 'var(--rose-600)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {otpResetMsg.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{otpResetMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleExecuteOtpReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">6-Digit Verification OTP *</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpResetForm.inputOtp}
                  onChange={(e) => setOtpResetForm({ ...otpResetForm, inputOtp: e.target.value })}
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '2px', fontWeight: 700 }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password * (Min. 6 chars)</label>
                <input
                  type="password"
                  value={otpResetForm.newPassword}
                  onChange={(e) => setOtpResetForm({ ...otpResetForm, newPassword: e.target.value })}
                  placeholder="Enter secure new password"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password *</label>
                <input
                  type="password"
                  value={otpResetForm.confirmPassword}
                  onChange={(e) => setOtpResetForm({ ...otpResetForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="form-input"
                  required
                />
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" onClick={() => setShowOtpResetModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Verify OTP & Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Test Razorpay Checkout Modal */}
      {adminTestCheckoutOpen && (
        <RazorpayCheckoutModal
          isOpen={adminTestCheckoutOpen}
          onClose={() => setAdminTestCheckoutOpen(false)}
          amount={1599}
          orderNumber={`KM-TEST-${Math.floor(1000 + Math.random() * 9000)}`}
          customerName="Admin Portal Tester"
          customerEmail="admin@kognitiminds.com"
          customerPhone="9931648595"
          description="Admin Gateway Diagnostic Test Transaction"
          isB2B={false}
          onSuccess={(response) => {
            refreshRazorpayTransactions();
            alert(`Test payment successful! Captured ID: ${response.razorpay_payment_id}`);
          }}
        />
      )}

      {/* 1. Complete Order Inspection Modal */}
      {selectedOrderForInspection && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    Order {selectedOrderForInspection.order.orderNumber}
                  </h3>
                  <span className={`badge ${selectedOrderForInspection.type === 'b2b' ? 'badge-dark' : 'badge-blue'}`} style={{ fontSize: '0.75rem' }}>
                    {selectedOrderForInspection.type === 'b2b' ? 'B2B Institutional' : 'B2C Retail'}
                  </span>
                  {selectedOrderForInspection.order.orderStatus === 'placed' && (
                    <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                      🟡 ORDER PLACED (NEEDS REVIEW)
                    </span>
                  )}
                  {selectedOrderForInspection.order.orderStatus === 'confirmed' && (
                    <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                      🟢 ORDER CONFIRMED
                    </span>
                  )}
                  {selectedOrderForInspection.order.orderStatus === 'rejected' && (
                    <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>
                      🔴 ORDER REJECTED
                    </span>
                  )}
                  {['processing', 'packed', 'shipped', 'delivered'].includes(selectedOrderForInspection.order.orderStatus) && (
                    <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                      {selectedOrderForInspection.order.orderStatus.toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                  Placed on {new Date(selectedOrderForInspection.order.createdAt).toLocaleString('en-IN', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForInspection(null)}
                style={{
                  background: 'var(--slate-100)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--slate-600)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Rejection Alert if rejected */}
            {selectedOrderForInspection.order.orderStatus === 'rejected' && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <XCircle size={20} className="text-red-500" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 800, color: '#991B1B' }}>Order Rejected by Admin Desk</div>
                  <div style={{ color: '#7F1D1D', marginTop: '0.2rem' }}>
                    Reason: <strong>{selectedOrderForInspection.order.rejectionReason || 'Verification criteria not met.'}</strong>
                  </div>
                  {selectedOrderForInspection.order.rejectedBy && (
                    <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '0.25rem' }}>
                      Declined by: {selectedOrderForInspection.order.rejectedBy} on{' '}
                      {selectedOrderForInspection.order.rejectedAt
                        ? new Date(selectedOrderForInspection.order.rejectedAt).toLocaleString('en-IN')
                        : 'Recorded'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confirmation Alert if confirmed */}
            {selectedOrderForInspection.order.orderStatus === 'confirmed' && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1.5px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <CheckCircle2 size={18} className="text-emerald-600" />
                <div style={{ fontSize: '0.85rem', color: '#065F46' }}>
                  <strong>Order Confirmed & Approved for Dispatch</strong>
                  {selectedOrderForInspection.order.confirmedBy && (
                    <span> — Confirmed by {selectedOrderForInspection.order.confirmedBy}</span>
                  )}
                </div>
              </div>
            )}

            {/* Customer & Address Details Grid */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={15} /> Customer & Contact Details
                </div>
                <div>
                  <strong>
                    {selectedOrderForInspection.type === 'b2b'
                      ? (selectedOrderForInspection.order as B2BOrder).businessName
                      : (selectedOrderForInspection.order as B2COrder).customerName}
                  </strong>
                </div>
                {selectedOrderForInspection.type === 'b2b' && (
                  <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                    GSTIN: <code>{(selectedOrderForInspection.order as B2BOrder).gstin || 'N/A'}</code>
                  </div>
                )}
                <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                  Email: {selectedOrderForInspection.type === 'b2b'
                    ? (selectedOrderForInspection.order as B2BOrder).businessName + ' Enterprise'
                    : (selectedOrderForInspection.order as B2COrder).customerEmail || 'N/A'}
                </div>
                <div style={{ color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                  Phone: {selectedOrderForInspection.type === 'b2b'
                    ? (selectedOrderForInspection.order as B2BOrder).billingAddress?.phone || 'N/A'
                    : (selectedOrderForInspection.order as B2COrder).customerPhone || (selectedOrderForInspection.order as B2COrder).shippingAddress?.phone || 'N/A'}
                </div>
              </div>

              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Truck size={15} /> Shipping & Delivery Address
                </div>
                {selectedOrderForInspection.type === 'b2b' ? (
                  <div>
                    <div>{(selectedOrderForInspection.order as B2BOrder).shippingAddress?.street}</div>
                    <div>
                      {(selectedOrderForInspection.order as B2BOrder).shippingAddress?.city},{' '}
                      {(selectedOrderForInspection.order as B2BOrder).shippingAddress?.state} -{' '}
                      {(selectedOrderForInspection.order as B2BOrder).shippingAddress?.pincode}
                    </div>
                    <div style={{ color: 'var(--slate-500)', marginTop: '0.2rem' }}>India</div>
                  </div>
                ) : (
                  <div>
                    <div>{(selectedOrderForInspection.order as B2COrder).shippingAddress?.street}</div>
                    <div>
                      {(selectedOrderForInspection.order as B2COrder).shippingAddress?.city},{' '}
                      {(selectedOrderForInspection.order as B2COrder).shippingAddress?.state} -{' '}
                      {(selectedOrderForInspection.order as B2COrder).shippingAddress?.pincode}
                    </div>
                    <div style={{ color: 'var(--slate-500)', marginTop: '0.2rem' }}>India</div>
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CreditCard size={15} /> Payment Gateway & Settlement Audit
                  </span>
                  {selectedOrderForInspection.type === 'b2b' && (
                    (selectedOrderForInspection.order as B2BOrder).source &&
                    (selectedOrderForInspection.order as B2BOrder).source !== 'web' ? (
                      <button
                        onClick={() => handleOpenOfflinePayment(selectedOrderForInspection.order as B2BOrder)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', background: '#059669', borderColor: '#059669' }}
                      >
                        💰 Record Payment
                      </button>
                    ) : (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#2563EB',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          fontSize: '0.7rem',
                          padding: '0.2rem 0.5rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                        title="Automated Website Order: Processed via Razorpay Gateway. Manual alteration disabled."
                      >
                        <Lock size={11} /> Razorpay Online Gateway
                      </span>
                    )
                  )}
                </div>
                <div className="flex justify-between" style={{ marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Method / Channel:</span>
                  <strong>
                    {selectedOrderForInspection.type === 'b2b'
                      ? ((selectedOrderForInspection.order as B2BOrder).paymentMode
                          ? (selectedOrderForInspection.order as B2BOrder).paymentMode?.replace('_', ' ').toUpperCase()
                          : (selectedOrderForInspection.order as B2BOrder).paymentTerms || 'PREPAID')
                      : (selectedOrderForInspection.order as B2COrder).paymentMethod === 'razorpay'
                      ? 'Razorpay Online'
                      : (selectedOrderForInspection.order as B2COrder).paymentMethod.toUpperCase()}
                  </strong>
                </div>
                <div className="flex justify-between" style={{ marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--slate-500)' }}>Payment Status:</span>
                  <span
                    className={`badge ${
                      selectedOrderForInspection.order.paymentStatus === 'paid'
                        ? 'badge-green'
                        : selectedOrderForInspection.order.paymentStatus === 'partially_paid'
                        ? 'badge-blue'
                        : 'badge-amber'
                    }`}
                    style={{ fontSize: '0.7rem' }}
                  >
                    {selectedOrderForInspection.order.paymentStatus.toUpperCase()}
                  </span>
                </div>

                {selectedOrderForInspection.type === 'b2b' && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="flex justify-between" style={{ marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--slate-500)' }}>Order Total:</span>
                      <strong>₹{(selectedOrderForInspection.order as B2BOrder).grandTotal.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex justify-between" style={{ marginBottom: '0.2rem' }}>
                      <span style={{ color: 'var(--slate-500)' }}>Amount Paid:</span>
                      <strong style={{ color: '#059669' }}>
                        ₹{((selectedOrderForInspection.order as B2BOrder).amountPaid || ((selectedOrderForInspection.order as B2BOrder).paymentStatus === 'paid' ? (selectedOrderForInspection.order as B2BOrder).grandTotal : 0)).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: 'var(--slate-500)' }}>Remaining Balance Due:</span>
                      <strong style={{ color: ((selectedOrderForInspection.order as B2BOrder).amountDue || 0) > 0 ? '#DC2626' : '#059669' }}>
                        ₹{((selectedOrderForInspection.order as B2BOrder).amountDue !== undefined ? (selectedOrderForInspection.order as B2BOrder).amountDue : ((selectedOrderForInspection.order as B2BOrder).paymentStatus === 'paid' ? 0 : (selectedOrderForInspection.order as B2BOrder).grandTotal))?.toLocaleString('en-IN')}
                      </strong>
                    </div>

                    {(selectedOrderForInspection.order as B2BOrder).paymentRecords && (selectedOrderForInspection.order as B2BOrder).paymentRecords!.length > 0 && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--slate-600)' }}>
                        <strong>Payment History ({(selectedOrderForInspection.order as B2BOrder).paymentRecords!.length} logged):</strong>
                        {(selectedOrderForInspection.order as B2BOrder).paymentRecords!.map((rec, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.15rem', color: 'var(--slate-500)' }}>
                            <span>• {rec.paymentDate}: ₹{rec.amount.toLocaleString('en-IN')} ({rec.paymentMode.replace('_', ' ').toUpperCase()})</span>
                            <span>{rec.transactionReference || rec.transactionRef || rec.chequeNumber || ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedOrderForInspection.order.paymentDetails?.transactionId && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--slate-600)' }}>
                    Payment ID: <code style={{ background: 'var(--slate-200)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{selectedOrderForInspection.order.paymentDetails.transactionId}</code>
                  </div>
                )}
              </div>
            </div>

            {/* Products Table */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Product</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Unit Price</th>
                    <th style={{ padding: '0.65rem 0.85rem' }}>Qty</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrderForInspection.order.items.map((item, idx) => {
                    const unitPrice =
                      selectedOrderForInspection.type === 'b2b'
                        ? (item as B2BOrderItemSummary).effectiveUnitPrice || (item as B2BOrderItemSummary).wholesalePrice
                        : (item as OrderItemSummary).unitPrice;

                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>{item.productName}</div>
                            {item.sku && <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>SKU: {item.sku}</div>}
                          </div>
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>₹{unitPrice.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.65rem 0.85rem', fontWeight: 700 }}>{item.quantity}</td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 700 }}>
                          ₹{item.total.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <div style={{ width: '100%', maxWidth: '320px', fontSize: '0.85rem' }}>
                <div className="flex justify-between" style={{ padding: '0.3rem 0', color: 'var(--slate-600)' }}>
                  <span>Subtotal (Taxable):</span>
                  <span>
                    ₹
                    {(selectedOrderForInspection.type === 'b2b'
                      ? (selectedOrderForInspection.order as B2BOrder).taxableAmount
                      : (selectedOrderForInspection.order as B2COrder).subtotal
                    ).toLocaleString('en-IN')}
                  </span>
                </div>

                {selectedOrderForInspection.type === 'b2c' && (selectedOrderForInspection.order as B2COrder).discount > 0 && (
                  <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#059669', fontWeight: 600 }}>
                    <span>
                      Coupon Discount {(selectedOrderForInspection.order as B2COrder).couponCode ? `(${(selectedOrderForInspection.order as B2COrder).couponCode})` : ''}:
                    </span>
                    <span>-₹{(selectedOrderForInspection.order as B2COrder).discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {selectedOrderForInspection.type === 'b2b' && (selectedOrderForInspection.order as B2BOrder).bulkDiscountTotal > 0 && (
                  <div className="flex justify-between" style={{ padding: '0.3rem 0', color: '#059669', fontWeight: 600 }}>
                    <span>Bulk Tier Discount:</span>
                    <span>-₹{(selectedOrderForInspection.order as B2BOrder).bulkDiscountTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between" style={{ padding: '0.3rem 0', color: 'var(--slate-600)' }}>
                  <span>GST / Tax:</span>
                  <span>
                    ₹
                    {(selectedOrderForInspection.type === 'b2b'
                      ? (selectedOrderForInspection.order as B2BOrder).totalGst
                      : (selectedOrderForInspection.order as B2COrder).gstAmount
                    ).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between" style={{ padding: '0.3rem 0', color: 'var(--slate-600)' }}>
                  <span>Shipping Charges:</span>
                  <span>
                    {(selectedOrderForInspection.type === 'b2b'
                      ? (selectedOrderForInspection.order as B2BOrder).shippingFee
                      : (selectedOrderForInspection.order as B2COrder).shippingFee
                    ) === 0 ? (
                      <span style={{ color: '#059669', fontWeight: 600 }}>FREE</span>
                    ) : (
                      `₹${(selectedOrderForInspection.type === 'b2b'
                        ? (selectedOrderForInspection.order as B2BOrder).shippingFee
                        : (selectedOrderForInspection.order as B2COrder).shippingFee
                      ).toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>

                <div
                  className="flex justify-between"
                  style={{
                    padding: '0.6rem 0',
                    borderTop: '1.5px solid var(--border-color)',
                    marginTop: '0.4rem',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--slate-900)',
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>
                    ₹
                    {(selectedOrderForInspection.type === 'b2b'
                      ? (selectedOrderForInspection.order as B2BOrder).grandTotal
                      : (selectedOrderForInspection.order as B2COrder).total
                    ).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div
              className="flex justify-between items-center flex-wrap gap-3"
              style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}
            >
              <div className="flex items-center gap-2">
                {canConfirmOrders && selectedOrderForInspection.order.orderStatus !== 'confirmed' && selectedOrderForInspection.order.orderStatus !== 'delivered' && (
                  <button
                    onClick={() => handleConfirmOrder(selectedOrderForInspection.type, selectedOrderForInspection.order.id)}
                    className="btn btn-primary"
                    style={{ background: '#059669', borderColor: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <CheckCircle2 size={16} /> Confirm Order
                  </button>
                )}

                {canRejectOrders && selectedOrderForInspection.order.orderStatus !== 'rejected' && selectedOrderForInspection.order.orderStatus !== 'delivered' && (
                  <button
                    onClick={() => {
                      handleOpenRejectOrderModal(
                        selectedOrderForInspection.type,
                        selectedOrderForInspection.order.id,
                        selectedOrderForInspection.order.orderNumber
                      );
                    }}
                    className="btn btn-secondary"
                    style={{ color: '#DC2626', borderColor: '#DC2626', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <XCircle size={16} /> Reject Order
                  </button>
                )}

                {/* View Official Tax Invoice (Confirmation Gated) */}
                {selectedOrderForInspection.order.orderStatus !== 'placed' && selectedOrderForInspection.order.orderStatus !== 'rejected' ? (
                  <button
                    onClick={() => {
                      setSelectedOrderForInvoice({
                        order: selectedOrderForInspection.order,
                        isB2B: selectedOrderForInspection.type === 'b2b',
                      });
                    }}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <FileText size={16} /> View Tax Invoice
                  </button>
                ) : (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#92400e',
                      background: '#fef3c7',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      padding: '0.45rem 0.65rem',
                    }}
                  >
                    🔒 Invoice on Confirmation
                  </span>
                )}

                {selectedOrderForInspection.type === 'b2b' && (
                  (selectedOrderForInspection.order as B2BOrder).source &&
                  (selectedOrderForInspection.order as B2BOrder).source !== 'web' ? (
                    <button
                      onClick={() => handleOpenOfflinePayment(selectedOrderForInspection.order as B2BOrder)}
                      className="btn btn-primary"
                      style={{ background: '#0284C7', borderColor: '#0284C7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                      <CreditCard size={16} /> Record Offline Payment
                    </button>
                  ) : (
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#2563EB',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        padding: '0.5rem 0.85rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                      title="Automated Website Order: Payments are processed via Razorpay online gateway."
                    >
                      <Lock size={14} /> Razorpay Online Gateway (Manual Alteration Prohibited)
                    </span>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrderForInspection(null)}
                className="btn btn-secondary"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Order Rejection Reason Modal */}
      {orderRejectionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '500px',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Reject Order {orderRejectionModal.orderNumber}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  This will mark the order as Rejected and update the customer tracking status.
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Select Standard Reason</label>
              <select
                onChange={(e) => setOrderRejectionReason(e.target.value)}
                className="form-select"
                defaultValue="Verification criteria not met / Address unserviceable"
              >
                <option value="Verification criteria not met / Address unserviceable">
                  Verification criteria not met / Address unserviceable
                </option>
                <option value="Inventory stock unavailable or discontinued">
                  Inventory stock unavailable or discontinued
                </option>
                <option value="Compliance or GST documentation incomplete">
                  Compliance or GST documentation incomplete
                </option>
                <option value="Customer requested cancellation prior to dispatch">
                  Customer requested cancellation prior to dispatch
                </option>
                <option value="Other administrative grounds">
                  Other administrative grounds
                </option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Detailed Notes / Custom Reason</label>
              <textarea
                value={orderRejectionReason}
                onChange={(e) => setOrderRejectionReason(e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Specify precise reason for rejecting this order..."
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrderRejectionModal(null);
                  setOrderRejectionReason('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOrderRejection}
                className="btn btn-primary"
                style={{ background: '#DC2626', borderColor: '#DC2626' }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create / Edit Coupon Modal */}
      {showCouponModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1060,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--slate-500)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCouponSubmit}>
              <div className="form-group">
                <label className="form-label">Coupon Code *</label>
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. FESTIVE20, DIWALI500"
                  className="form-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description / Offer Details</label>
                <input
                  type="text"
                  value={couponDescriptionInput}
                  onChange={(e) => setCouponDescriptionInput(e.target.value)}
                  placeholder="e.g. 20% discount on orders above ₹1,000"
                  className="form-input"
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Discount Type *</label>
                  <select
                    value={couponTypeInput}
                    onChange={(e) => setCouponTypeInput(e.target.value as 'percent' | 'flat')}
                    className="form-select"
                  >
                    <option value="percent">Percentage (% OFF)</option>
                    <option value="flat">Fixed Flat Amount (₹ OFF)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Discount Value {couponTypeInput === 'percent' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={couponTypeInput === 'percent' ? 100 : 100000}
                    value={couponValueInput}
                    onChange={(e) => setCouponValueInput(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Min Cart Value (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={couponMinOrderInput}
                    onChange={(e) => setCouponMinOrderInput(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={couponTypeInput === 'percent' ? 'Optional cap (e.g. 500)' : 'N/A for flat'}
                    value={couponMaxDiscountInput}
                    onChange={(e) => setCouponMaxDiscountInput(e.target.value)}
                    className="form-input"
                    disabled={couponTypeInput === 'flat'}
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    value={couponStartDateInput}
                    onChange={(e) => setCouponStartDateInput(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={couponExpiryDateInput}
                    onChange={(e) => setCouponExpiryDateInput(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
                <div className="form-group">
                  <label className="form-label">Usage Limit (Total times)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited if left empty"
                    value={couponUsageLimitInput}
                    onChange={(e) => setCouponUsageLimitInput(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={couponIsActiveInput}
                      onChange={(e) => setCouponIsActiveInput(e.target.checked)}
                    />
                    Coupon Active for Checkout
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCoupon ? 'Update Coupon' : 'Create & Activate Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record B2B Offline Payment Modal */}
      {showOfflinePaymentModal && orderForOfflinePayment && (
        <div className="modal-overlay" onClick={() => setShowOfflinePaymentModal(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '540px', padding: '2rem', background: '#FFFFFF' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(2, 132, 199, 0.12)',
                    color: '#0284C7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                    Record Offline Payment
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    Order #{orderForOfflinePayment.orderNumber} • {orderForOfflinePayment.businessName}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfflinePaymentModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Financial Overview Card */}
            <div
              style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.82rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ color: 'var(--slate-500)', fontSize: '0.72rem' }}>Order Grand Total</div>
                <div style={{ fontWeight: 800, color: 'var(--slate-900)', fontSize: '0.95rem' }}>
                  ₹{orderForOfflinePayment.grandTotal.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--slate-500)', fontSize: '0.72rem' }}>Already Settled</div>
                <div style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                  ₹{((orderForOfflinePayment.amountPaid || (orderForOfflinePayment.paymentStatus === 'paid' ? orderForOfflinePayment.grandTotal : 0))).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--slate-500)', fontSize: '0.72rem' }}>Current Balance Due</div>
                <div
                  style={{
                    fontWeight: 800,
                    color:
                      ((orderForOfflinePayment.amountDue !== undefined
                        ? orderForOfflinePayment.amountDue
                        : (orderForOfflinePayment.paymentStatus === 'paid' ? 0 : orderForOfflinePayment.grandTotal))) > 0
                        ? '#DC2626'
                        : '#059669',
                    fontSize: '0.95rem',
                  }}
                >
                  ₹{((orderForOfflinePayment.amountDue !== undefined
                    ? orderForOfflinePayment.amountDue
                    : (orderForOfflinePayment.paymentStatus === 'paid' ? 0 : orderForOfflinePayment.grandTotal))).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveOfflinePayment}>
              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Amount Received (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={offlinePaymentAmount}
                    onChange={(e) => setOfflinePaymentAmount(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Settlement Date *</label>
                  <input
                    type="date"
                    value={offlinePaymentDate}
                    onChange={(e) => setOfflinePaymentDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Mode / Channel *</label>
                  <select
                    value={offlinePaymentMode}
                    onChange={(e) => setOfflinePaymentMode(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="bank_transfer">Bank Transfer / NEFT</option>
                    <option value="rtgs">RTGS</option>
                    <option value="imps">IMPS</option>
                    <option value="cheque">Cheque</option>
                    <option value="razorpay">Online – Razorpay</option>
                    <option value="other">Other / Commercial Credit</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Transaction / UTR Reference No.</label>
                  <input
                    type="text"
                    value={offlinePaymentRef}
                    onChange={(e) => setOfflinePaymentRef(e.target.value)}
                    placeholder="e.g. UTR1234567890"
                    className="form-input"
                  />
                </div>
              </div>

              {offlinePaymentMode === 'cheque' && (
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Cheque Number *</label>
                    <input
                      type="text"
                      value={offlinePaymentChequeNo}
                      onChange={(e) => setOfflinePaymentChequeNo(e.target.value)}
                      placeholder="e.g. CHQ004521"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Drawee Bank Name</label>
                    <input
                      type="text"
                      value={offlinePaymentBank}
                      onChange={(e) => setOfflinePaymentBank(e.target.value)}
                      placeholder="e.g. HDFC Bank Ltd"
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {offlinePaymentMode !== 'cheque' && (
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Remitting Bank Name</label>
                  <input
                    type="text"
                    value={offlinePaymentBank}
                    onChange={(e) => setOfflinePaymentBank(e.target.value)}
                    placeholder="e.g. State Bank of India"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Internal Accounting Notes / Remarks</label>
                <textarea
                  rows={2}
                  value={offlinePaymentNotes}
                  onChange={(e) => setOfflinePaymentNotes(e.target.value)}
                  placeholder="e.g. Verified with bank statement by Accounts Desk"
                  className="form-textarea"
                />
              </div>

              <div className="flex justify-end gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowOfflinePaymentModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#0284C7', borderColor: '#0284C7' }}
                >
                  Save Payment & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual B2B Quotation Creation Modal */}
      {showManualQuoteModal && (
        <div className="modal-overlay" onClick={() => setShowManualQuoteModal(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '920px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Create Manual B2B Quotation (Institutional Proposal)
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Generate official institutional proposals with itemized products, 18% GST calculation, and commercial terms.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualQuoteModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={22} className="text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveManualQuotation(false);
              }}
            >
              {/* Section 1: Business Details */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  1. Business & Client Profile
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company / Institution Name *</label>
                    <input
                      type="text"
                      value={quoteBusinessName}
                      onChange={(e) => setQuoteBusinessName(e.target.value)}
                      placeholder="e.g. Apex Learning Solutions Pvt Ltd"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Contact Person *</label>
                    <input
                      type="text"
                      value={quoteContactPerson}
                      onChange={(e) => setQuoteContactPerson(e.target.value)}
                      placeholder="e.g. Vikram Sharma (Procurement Head)"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone / Mobile *</label>
                    <input
                      type="tel"
                      value={quoteContactPhone}
                      onChange={(e) => setQuoteContactPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      value={quoteContactEmail}
                      onChange={(e) => setQuoteContactEmail(e.target.value)}
                      placeholder="e.g. procurement@apexlearning.in"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Client GSTIN (15 Digits)</label>
                    <input
                      type="text"
                      value={quoteGstin}
                      onChange={(e) => setQuoteGstin(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                      placeholder="e.g. 07AAACE1234F1Z8"
                      className="form-input"
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Addresses */}
              <div style={{ marginBottom: '1.5rem', background: 'var(--slate-50)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  2. Billing & Delivery Locations
                </div>
                <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Billing Street Address</label>
                    <input
                      type="text"
                      value={quoteBillingStreet}
                      onChange={(e) => setQuoteBillingStreet(e.target.value)}
                      placeholder="Plot No. 42, Tech Zone IV"
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={quoteBillingCity}
                      onChange={(e) => setQuoteBillingCity(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={quoteBillingState}
                      onChange={(e) => setQuoteBillingState(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pincode</label>
                    <input
                      type="text"
                      value={quoteBillingPincode}
                      onChange={(e) => setQuoteBillingPincode(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={quoteShippingSameAsBilling}
                      onChange={(e) => setQuoteShippingSameAsBilling(e.target.checked)}
                    />
                    Shipping address is identical to Billing address
                  </label>
                </div>

                {!quoteShippingSameAsBilling && (
                  <div className="grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Shipping Street Address</label>
                      <input
                        type="text"
                        value={quoteShippingStreet}
                        onChange={(e) => setQuoteShippingStreet(e.target.value)}
                        placeholder="Warehouse 3, Logistic Park"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Shipping City</label>
                      <input
                        type="text"
                        value={quoteShippingCity}
                        onChange={(e) => setQuoteShippingCity(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Shipping State</label>
                      <input
                        type="text"
                        value={quoteShippingState}
                        onChange={(e) => setQuoteShippingState(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Shipping Pincode</label>
                      <input
                        type="text"
                        value={quoteShippingPincode}
                        onChange={(e) => setQuoteShippingPincode(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Line Items */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Quotation Line Items (18% Statutory GST Applied)
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="btn btn-secondary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem' }}
                  >
                    <Plus size={14} /> Add Line Item
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-100)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.6rem 0.75rem' }}>Product Selection</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '90px' }}>HSN</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '80px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '120px', textAlign: 'right' }}>Agreed Unit ₹</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '70px', textAlign: 'center' }}>Disc %</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '80px', textAlign: 'center' }}>GST Rate</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '110px', textAlign: 'right' }}>Line Total ₹</th>
                        <th style={{ padding: '0.6rem 0.5rem', width: '40px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {quoteLineItems.map((item, idx) => {
                        const taxable = Math.round(item.quantity * item.unitPrice * (1 - item.discountPercent / 100) * 100) / 100;
                        const gst = Math.round(taxable * 0.18 * 100) / 100;
                        const lineTotal = taxable + gst;

                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <select
                                value={item.productId}
                                onChange={(e) => handleLineItemProductChange(idx, e.target.value)}
                                className="form-select"
                                style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Wholesale: ₹{(p.b2bWholesalePrice || (p as any).wholesalePrice || 0).toLocaleString('en-IN')})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input
                                type="text"
                                value={item.hsn}
                                onChange={(e) => {
                                  const upd = [...quoteLineItems];
                                  upd[idx].hsn = e.target.value;
                                  setQuoteLineItems(upd);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.78rem', padding: '0.35rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => {
                                  const upd = [...quoteLineItems];
                                  upd[idx].quantity = Math.max(1, Number(e.target.value));
                                  setQuoteLineItems(upd);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.78rem', padding: '0.35rem', textAlign: 'center' }}
                                required
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input
                                type="number"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const upd = [...quoteLineItems];
                                  upd[idx].unitPrice = Math.max(0, Number(e.target.value));
                                  setQuoteLineItems(upd);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.78rem', padding: '0.35rem', textAlign: 'right' }}
                                required
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={item.discountPercent}
                                onChange={(e) => {
                                  const upd = [...quoteLineItems];
                                  upd[idx].discountPercent = Math.min(100, Math.max(0, Number(e.target.value)));
                                  setQuoteLineItems(upd);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.78rem', padding: '0.35rem', textAlign: 'center' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: '#0284C7' }}>
                              18%
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--slate-900)' }}>
                              ₹{lineTotal.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                              {quoteLineItems.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLineItem(idx)}
                                  style={{ color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer' }}
                                  title="Remove line"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Commercial & Delivery Terms */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  4. Commercial Terms & Logistics
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Payment Terms</label>
                    <select
                      value={quotePaymentTerms}
                      onChange={(e) => setQuotePaymentTerms(e.target.value)}
                      className="form-select"
                    >
                      <option value="Prepaid">100% Advance Prepaid (Online / RTGS)</option>
                      <option value="Net 15">Net 15 Days Commercial Credit</option>
                      <option value="Net 30">Net 30 Days Commercial Credit</option>
                      <option value="Net 45">Net 45 Days Commercial Credit</option>
                      <option value="50% Advance / 50% on Delivery">50% Advance / 50% on Delivery</option>
                      <option value="Custom Commercial Terms">Custom Commercial Terms</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Delivery & Dispatch Terms</label>
                    <input
                      type="text"
                      value={quoteDeliveryTerms}
                      onChange={(e) => setQuoteDeliveryTerms(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Shipping / Freight Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={quoteShippingFee}
                      onChange={(e) => setQuoteShippingFee(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quotation Validity (Days)</label>
                    <input
                      type="number"
                      min="1"
                      value={quoteProposalValidDays}
                      onChange={(e) => setQuoteProposalValidDays(Number(e.target.value))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Proposal Notes / Specifications</label>
                  <textarea
                    rows={2}
                    value={quoteProposalNotes}
                    onChange={(e) => setQuoteProposalNotes(e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>

              {/* Section 5: Real-time Live Calculation Summary */}
              {(() => {
                const totalTaxable = quoteLineItems.reduce(
                  (acc, it) => acc + (it.quantity * it.unitPrice * (1 - it.discountPercent / 100)),
                  0
                );
                const totalGst = Math.round(totalTaxable * 0.18 * 100) / 100;
                const grandTotal = totalTaxable + totalGst + (Number(quoteShippingFee) || 0);

                return (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
                      border: '1.5px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '1rem 1.5rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total Taxable Value</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                        ₹{Math.round(totalTaxable).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#0284C7', fontWeight: 600 }}>Statutory GST (18%)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284C7' }}>
                        ₹{totalGst.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Freight / Shipping</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-800)' }}>
                        {quoteShippingFee ? `₹${Number(quoteShippingFee).toLocaleString('en-IN')}` : 'FREE'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>Grand Total (Incl. 18% GST)</div>
                      <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>
                        ₹{Math.round(grandTotal).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Section 6: Action Buttons */}
              <div className="flex justify-between items-center flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowManualQuoteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="btn btn-outline"
                    style={{ fontWeight: 700 }}
                  >
                    Save as Active Quotation
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveManualQuotation(true)}
                    className="btn btn-primary"
                    style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
                  >
                    ⚡ Save & Convert to Confirmed B2B Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual B2B Order Creation Modal (Phone / WhatsApp / Offline Channels) */}
      {showManualOrderModal && (
        <div className="modal-overlay" onClick={() => setShowManualOrderModal(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '960px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Create Manual B2B Order (Direct Sales & Offline Desk)
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Record orders placed through Phone Calls, WhatsApp, Email, or Sales Representatives with full GST & partial payment accounting.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManualOrderModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={22} className="text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveManualB2BOrder(false);
              }}
            >
              {/* Channel & Source Selection */}
              <div style={{ marginBottom: '1.5rem', background: 'var(--slate-50)', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  1. Order Intake Channel & Source *
                </div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {(
                    [
                      { id: 'phone', label: '📞 Phone Call' },
                      { id: 'whatsapp', label: '💬 WhatsApp' },
                      { id: 'email', label: '✉️ Email' },
                      { id: 'sales_rep', label: '👔 Sales Representative' },
                      { id: 'direct_offline', label: '🏬 Direct / Offline' },
                      { id: 'other', label: '📄 Other' },
                    ] as const
                  ).map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => setManualOrderSource(src.id)}
                      className="btn"
                      style={{
                        background: manualOrderSource === src.id ? 'var(--primary)' : '#FFFFFF',
                        color: manualOrderSource === src.id ? '#FFFFFF' : 'var(--slate-700)',
                        border: manualOrderSource === src.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '0.5rem 0.75rem',
                        justifyContent: 'center',
                      }}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Business & Customer Profile */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    2. Business & Customer Profile
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>Select Client:</span>
                    <select
                      value={manualOrderExistingBizId}
                      onChange={(e) => handleSelectManualOrderBusiness(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.6rem', width: 'auto' }}
                    >
                      <option value="new">+ Register New Business Record</option>
                      {businesses.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.companyName || b.legalName} ({b.gstin || 'No GSTIN'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company / Institution Name *</label>
                    <input
                      type="text"
                      value={manualOrderBizName}
                      onChange={(e) => setManualOrderBizName(e.target.value)}
                      placeholder="e.g. Apex Learning Solutions Pvt Ltd"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Contact Person Name *</label>
                    <input
                      type="text"
                      value={manualOrderContactPerson}
                      onChange={(e) => setManualOrderContactPerson(e.target.value)}
                      placeholder="e.g. Rajiv Menon"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Mobile Number (Login Identifier) *</label>
                    <input
                      type="tel"
                      value={manualOrderMobile}
                      onChange={(e) => setManualOrderMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Business Email</label>
                    <input
                      type="email"
                      value={manualOrderEmail}
                      onChange={(e) => setManualOrderEmail(e.target.value)}
                      placeholder="e.g. procurement@apex.com"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Client GSTIN (15 Digits)</label>
                    <input
                      type="text"
                      value={manualOrderGstin}
                      onChange={(e) => setManualOrderGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 09AAECK1234F1Z5"
                      maxLength={15}
                      className="form-input"
                      style={{ letterSpacing: '0.05em', fontWeight: 600 }}
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                  <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                      Billing Address:
                    </div>
                    <input
                      type="text"
                      placeholder="Street / Office Address"
                      value={manualOrderBillingStreet}
                      onChange={(e) => setManualOrderBillingStreet(e.target.value)}
                      className="form-input"
                      style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}
                    />
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                      <input
                        type="text"
                        placeholder="City"
                        value={manualOrderBillingCity}
                        onChange={(e) => setManualOrderBillingCity(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        value={manualOrderBillingState}
                        onChange={(e) => setManualOrderBillingState(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        placeholder="PIN"
                        value={manualOrderBillingPincode}
                        onChange={(e) => setManualOrderBillingPincode(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ background: 'var(--slate-50)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div className="flex justify-between items-center" style={{ marginBottom: '0.4rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--slate-700)' }}>Shipping Address:</div>
                      <label style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={manualOrderShippingSame}
                          onChange={(e) => setManualOrderShippingSame(e.target.checked)}
                        />
                        Same as Billing
                      </label>
                    </div>
                    {!manualOrderShippingSame ? (
                      <>
                        <input
                          type="text"
                          placeholder="Delivery Street / Warehouse Address"
                          value={manualOrderShippingStreet}
                          onChange={(e) => setManualOrderShippingStreet(e.target.value)}
                          className="form-input"
                          style={{ fontSize: '0.8rem', marginBottom: '0.4rem' }}
                        />
                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem' }}>
                          <input
                            type="text"
                            placeholder="City"
                            value={manualOrderShippingCity}
                            onChange={(e) => setManualOrderShippingCity(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.8rem' }}
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={manualOrderShippingState}
                            onChange={(e) => setManualOrderShippingState(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.8rem' }}
                          />
                          <input
                            type="text"
                            placeholder="PIN"
                            value={manualOrderShippingPincode}
                            onChange={(e) => setManualOrderShippingPincode(e.target.value)}
                            className="form-input"
                            style={{ fontSize: '0.8rem' }}
                          />
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontStyle: 'italic', paddingTop: '0.75rem' }}>
                        ✓ Shipping address matches Billing Address.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Line Items Builder */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    3. Line Items & Commercial Pricing (18% GST Applicable)
                  </div>
                  <button
                    type="button"
                    onClick={handleAddManualOrderLineItem}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Plus size={13} /> Add Product Line
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.6rem 0.75rem', width: '38%' }}>Product</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '12%' }}>Quantity</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '18%' }}>Agreed Rate (₹)</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '12%' }}>Disc %</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '14%', textAlign: 'right' }}>Taxable Base</th>
                        <th style={{ padding: '0.6rem 0.75rem', width: '6%', textAlign: 'center' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {manualOrderLineItems.map((item, idx) => {
                        const lineTaxable = Math.round(item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100));
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <select
                                value={item.productId}
                                onChange={(e) => handleManualOrderProductChange(idx, e.target.value)}
                                className="form-select"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Wholesale: ₹{p.b2bWholesalePrice.toLocaleString('en-IN')})
                                  </option>
                                ))}
                              </select>
                              <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', marginTop: '0.2rem' }}>
                                SKU: {item.sku} | HSN: {item.hsn}
                              </div>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  const updated = [...manualOrderLineItems];
                                  updated[idx].quantity = val;
                                  setManualOrderLineItems(updated);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const updated = [...manualOrderLineItems];
                                  updated[idx].unitPrice = val;
                                  setManualOrderLineItems(updated);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={item.discountPercent}
                                onChange={(e) => {
                                  const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                  const updated = [...manualOrderLineItems];
                                  updated[idx].discountPercent = val;
                                  setManualOrderLineItems(updated);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                              ₹{lineTaxable.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveManualOrderLineItem(idx)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.4rem', color: '#DC2626' }}
                                title="Remove line item"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 4: Commercial & Payment Terms */}
              <div style={{ marginBottom: '1.5rem', background: 'var(--slate-50)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
                  4. Commercial Payment Terms & Offline Settlement
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Payment Terms</label>
                    <select
                      value={manualOrderPaymentTerms}
                      onChange={(e) => setManualOrderPaymentTerms(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <option value="Net 30">Net 30 (Commercial Credit)</option>
                      <option value="Net 15">Net 15</option>
                      <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                      <option value="100% Advance (Prepaid)">100% Advance (Prepaid)</option>
                      <option value="Immediate COD / Delivery">Immediate COD / Delivery</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Payment Mode *</label>
                    <select
                      value={manualOrderPaymentMode}
                      onChange={(e) => setManualOrderPaymentMode(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <option value="bank_transfer">Bank Transfer / NEFT</option>
                      <option value="rtgs">RTGS</option>
                      <option value="imps">IMPS</option>
                      <option value="cheque">Cheque</option>
                      <option value="razorpay">Online – Razorpay</option>
                      <option value="cash_offline">Cash / Offline Settlement</option>
                      <option value="other">Other / Corporate Credit</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Payment Status *</label>
                    <select
                      value={manualOrderPaymentStatus}
                      onChange={(e) => setManualOrderPaymentStatus(e.target.value as any)}
                      className="form-select"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <option value="payment_due">🔴 Payment Due (Unsettled)</option>
                      <option value="partially_paid">🟡 Partially Paid (Upfront Deposit)</option>
                      <option value="paid">🟢 Paid in Full</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Freight / Shipping Charges (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={manualOrderShippingFee}
                      onChange={(e) => setManualOrderShippingFee(parseFloat(e.target.value) || 0)}
                      className="form-input"
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {manualOrderPaymentStatus !== 'payment_due' && (
                  <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.75rem', background: '#FFFFFF', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Amount Paid Upfront (₹) *</label>
                      <input
                        type="number"
                        min={0}
                        value={manualOrderUpfrontPaid}
                        onChange={(e) => setManualOrderUpfrontPaid(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 50000"
                        className="form-input"
                        style={{ fontSize: '0.82rem', fontWeight: 700 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Transaction / Cheque / UTR Ref</label>
                      <input
                        type="text"
                        value={manualOrderTxnRef}
                        onChange={(e) => setManualOrderTxnRef(e.target.value)}
                        placeholder="e.g. UTR99881122"
                        className="form-input"
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Remitting / Drawee Bank</label>
                      <input
                        type="text"
                        value={manualOrderBankName}
                        onChange={(e) => setManualOrderBankName(e.target.value)}
                        placeholder="e.g. State Bank of India"
                        className="form-input"
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  <label className="form-label">Internal Remarks & Order Notes</label>
                  <textarea
                    rows={2}
                    value={manualOrderRemarks}
                    onChange={(e) => setManualOrderRemarks(e.target.value)}
                    placeholder="e.g. Order finalized via sales representative phone call. Delivery expected next Tuesday."
                    className="form-textarea"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* Section 5: Order Financial Summary */}
              {(() => {
                const totalTaxable = manualOrderLineItems.reduce(
                  (sum, it) => sum + Math.round(it.quantity * it.unitPrice * (1 - (it.discountPercent || 0) / 100)),
                  0
                );
                const totalGst = Math.round(totalTaxable * 0.18 * 100) / 100;
                const shipping = Number(manualOrderShippingFee) || 0;
                const grandTotal = totalTaxable + totalGst + shipping;
                const paid = manualOrderPaymentStatus === 'paid' ? grandTotal : (Number(manualOrderUpfrontPaid) || 0);
                const due = Math.max(0, grandTotal - paid);

                return (
                  <div
                    style={{
                      background: 'var(--slate-900)',
                      color: '#FFFFFF',
                      padding: '1.25rem',
                      borderRadius: '8px',
                      marginBottom: '1.5rem',
                    }}
                  >
                    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>Taxable Subtotal</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹{totalTaxable.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>18% GST (CGST+SGST)</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38BDF8' }}>₹{totalGst.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>Freight / Shipping</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{shipping > 0 ? `₹${shipping.toLocaleString('en-IN')}` : 'FREE'}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>Grand Total</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34D399' }}>₹{grandTotal.toLocaleString('en-IN')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase' }}>Remaining Due</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: due > 0 ? '#F87171' : '#34D399' }}>
                          {due > 0 ? `₹${due.toLocaleString('en-IN')}` : 'PAID IN FULL'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex justify-between items-center flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowManualOrderModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="btn btn-outline"
                    style={{ fontWeight: 700 }}
                  >
                    Save as Draft (Unconfirmed)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveManualB2BOrder(true)}
                    className="btn btn-primary"
                    style={{ background: '#059669', borderColor: '#059669', fontWeight: 700 }}
                  >
                    ⚡ Create & Confirm Order (Instant Invoice)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revise & Send Quotation Modal */}
      {showReviseQuoteModal && activeQuoteForRevision && (
        <div className="modal-overlay" onClick={() => setShowReviseQuoteModal(false)}>
          <div
            className="modal-content"
            style={{
              maxWidth: '920px',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem',
              background: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Revise & Send Quotation — {activeQuoteForRevision.rfqNumber}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                  Admin / Super Admin Proposal Review: Adjust products, volume, unit rates, discounts, 18% GST, freight, and commercial terms before issuing to customer.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReviseQuoteModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={22} className="text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveRevisedQuotation();
              }}
            >
              {/* Client & RFQ Original Request Header */}
              <div style={{ marginBottom: '1.25rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '0.5rem' }}>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>
                      {activeQuoteForRevision.businessName}
                    </strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginLeft: '0.5rem' }}>
                      ({activeQuoteForRevision.contactPerson} • {activeQuoteForRevision.phone})
                    </span>
                  </div>
                  {activeQuoteForRevision.gstin && (
                    <span className="badge badge-dark" style={{ fontSize: '0.72rem' }}>
                      GSTIN: {activeQuoteForRevision.gstin}
                    </span>
                  )}
                </div>

                {/* Original Customer Request Box */}
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '0.75rem', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 700, color: '#1E40AF', marginBottom: '0.25rem' }}>
                    📋 Original Customer Request (RFQ):
                  </div>
                  <div style={{ color: '#1E3A8A' }}>
                    Requested Volume: <strong>{activeQuoteForRevision.requestedQty || activeQuoteForRevision.items?.reduce((s, i) => s + i.quantity, 0) || 1} Units</strong>
                    {activeQuoteForRevision.targetUnitPrice ? ` • Target Unit Price: ₹${activeQuoteForRevision.targetUnitPrice.toLocaleString('en-IN')}` : ''}
                    {activeQuoteForRevision.deliveryPincode ? ` • Delivery PIN: ${activeQuoteForRevision.deliveryPincode}` : ''}
                  </div>
                  {activeQuoteForRevision.specialRequirements && (
                    <div style={{ marginTop: '0.25rem', fontStyle: 'italic', color: '#1E3A8A' }}>
                      "{activeQuoteForRevision.specialRequirements}"
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items Revision */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div className="flex justify-between items-center" style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                    Revise Products, Quantities & Agreed Unit Pricing
                  </div>
                  <button
                    type="button"
                    onClick={handleAddReviseQuoteItem}
                    className="btn btn-sm btn-outline"
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    <Plus size={13} /> Add Line Item
                  </button>
                </div>

                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Product</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '12%' }}>Quantity</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '20%' }}>Unit Price (₹)</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '12%' }}>Disc %</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '16%', textAlign: 'right' }}>Taxable Total</th>
                        <th style={{ padding: '0.5rem 0.75rem', width: '6%' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviseQuoteItems.map((item, idx) => {
                        const taxable = Math.round(item.quantity * item.unitPrice * (1 - (item.discountPercent || 0) / 100));
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <select
                                value={item.productId}
                                onChange={(e) => handleReviseQuoteProductChange(idx, e.target.value)}
                                className="form-select"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (Base Wholesale: ₹{p.b2bWholesalePrice.toLocaleString('en-IN')})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = Math.max(1, parseInt(e.target.value) || 1);
                                  const updated = [...reviseQuoteItems];
                                  updated[idx].quantity = val;
                                  setReviseQuoteItems(updated);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                min={0}
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const updated = [...reviseQuoteItems];
                                  updated[idx].unitPrice = val;
                                  setReviseQuoteItems(updated);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem' }}>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={item.discountPercent}
                                onChange={(e) => {
                                  const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                                  const updated = [...reviseQuoteItems];
                                  updated[idx].discountPercent = val;
                                  setReviseQuoteItems(updated);
                                }}
                                className="form-input"
                                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                              ₹{taxable.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveReviseQuoteItem(idx)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.35rem', color: '#DC2626' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Freight / Shipping Charges (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={reviseShippingCharges}
                    onChange={(e) => setReviseShippingCharges(parseFloat(e.target.value) || 0)}
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Payment Terms</label>
                  <input
                    type="text"
                    value={revisePaymentTerms}
                    onChange={(e) => setRevisePaymentTerms(e.target.value)}
                    placeholder="e.g. Net 30 Commercial Credit"
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Delivery Timeline / Terms</label>
                  <input
                    type="text"
                    value={reviseDeliveryTerms}
                    onChange={(e) => setReviseDeliveryTerms(e.target.value)}
                    placeholder="e.g. Doorstep Delivery in 5-7 days"
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Quotation Validity Until</label>
                  <input
                    type="date"
                    value={reviseValidUntil}
                    onChange={(e) => setReviseValidUntil(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Admin Notes / Revision Remarks for Client *</label>
                <textarea
                  rows={2}
                  value={reviseAdminNotes}
                  onChange={(e) => setReviseAdminNotes(e.target.value)}
                  placeholder="e.g. Revised quote with 10% institutional tier discount and free factory dispatch."
                  className="form-textarea"
                  style={{ fontSize: '0.82rem' }}
                  required
                />
              </div>

              {/* Financial Calculation Bar */}
              {(() => {
                const totalTaxable = reviseQuoteItems.reduce(
                  (s, it) => s + Math.round(it.quantity * it.unitPrice * (1 - (it.discountPercent || 0) / 100)),
                  0
                );
                const gst = Math.round(totalTaxable * 0.18 * 100) / 100;
                const shipping = Number(reviseShippingCharges) || 0;
                const grandTotal = totalTaxable + gst + shipping;

                return (
                  <div
                    style={{
                      background: 'var(--slate-900)',
                      color: '#FFFFFF',
                      padding: '1rem',
                      borderRadius: '8px',
                      marginBottom: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>TAXABLE BASE: </span>
                      <strong style={{ fontSize: '1rem' }}>₹{totalTaxable.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>18% GST: </span>
                      <strong style={{ fontSize: '1rem', color: '#38BDF8' }}>₹{gst.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>FREIGHT: </span>
                      <strong style={{ fontSize: '1rem' }}>{shipping > 0 ? `₹${shipping.toLocaleString('en-IN')}` : 'FREE'}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>NEW QUOTED TOTAL: </span>
                      <strong style={{ fontSize: '1.2rem', color: '#34D399' }}>₹{grandTotal.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowReviseQuoteModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#7E22CE', borderColor: '#7E22CE', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                >
                  <Send size={15} /> Send Revised Quotation to Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

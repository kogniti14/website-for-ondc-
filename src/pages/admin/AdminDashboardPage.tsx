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
} from 'lucide-react';
import { Product, B2COrder, B2BOrder, B2BBusiness, B2BQuotation, Coupon, AdminUser, Category, B2CUser, SiteMedia } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { B2BInvoiceModal } from '../../components/b2b/B2BInvoiceModal';
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
    'overview' | 'products' | 'categories' | 'orders' | 'verification' | 'rfqs' | 'coupons' | 'approvals' | 'credentials' | 'media' | 'razorpay'
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

  // Selected B2B Order for Tax Invoice
  const [selectedB2bOrderForInvoice, setSelectedB2bOrderForInvoice] = useState<B2BOrder | null>(null);

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

  // Coupon Add State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponVal, setNewCouponVal] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(2000);

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

    const totalTaxable = quotePrice * activeRfqForQuote.requestedQty;
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

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    storageService.saveCoupon({
      code: newCouponCode.toUpperCase(),
      discountType: 'percent',
      value: newCouponVal,
      minOrderValue: newCouponMin,
      description: `${newCouponVal}% off on orders above ₹${newCouponMin}`,
    });
    setNewCouponCode('');
    onRefresh();
  };

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
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '0.5rem 0.2rem',
              color: activeTab === 'orders' ? 'var(--primary)' : 'var(--slate-600)',
              borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <ShoppingCart size={16} /> Orders ({b2cOrders.length + b2bOrders.length})
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
            <Building2 size={16} /> B2B Verification {pendingApprovals > 0 && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{pendingApprovals}</span>}
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
            }}
          >
            <FileText size={16} /> RFQ Quotations {pendingRfqs > 0 && <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{pendingRfqs}</span>}
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
                    gstRate: 12,
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

        {/* 3. Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>All Order Dispatches</h2>

            <div className="card" style={{ padding: 0, overflow: 'hidden', background: '#FFFFFF' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order Ref</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Channel</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Customer / Entity</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Current Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Update Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Tax Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {/* B2B Orders */}
                  {b2bOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(37, 99, 235, 0.02)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong>{o.orderNumber}</strong>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>PO: {o.poNumber}</div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-dark">B2B Institutional</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{o.businessName}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        ₹{o.grandTotal.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-amber">{o.orderStatus}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateB2BOrderStatus(o.id, e.target.value)}
                          className="form-select"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button
                          onClick={() => setSelectedB2bOrderForInvoice(o)}
                          className="btn btn-sm"
                          style={{
                            background: 'rgba(2, 132, 199, 0.1)',
                            color: '#0284C7',
                            border: '1px solid rgba(2, 132, 199, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        >
                          <FileText size={13} /> View B2B Invoice
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* B2C Orders */}
                  {b2cOrders.map((o) => (
                    <tr key={o.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <strong>{o.orderNumber}</strong>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-blue">B2C Retail</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>{o.customerName}</td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>
                        ₹{o.total.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="badge badge-green">{o.orderStatus}</span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleUpdateB2COrderStatus(o.id, e.target.value)}
                          className="form-select"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                        >
                          <option value="placed">Placed</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Retail GST</span>
                      </td>
                    </tr>
                  ))}
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              B2B Quotations Desk (Commercial Proposals)
            </h2>

            <div className="flex flex-col gap-3">
              {quotations.map((q) => (
                <div key={q.id} className="card" style={{ padding: '1.5rem', background: '#FFFFFF' }}>
                  <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem' }}>{q.rfqNumber}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginLeft: '0.5rem' }}>
                        From: {q.businessName} ({q.contactPerson})
                      </span>
                    </div>
                    <span className={`badge ${q.status === 'quoted' ? 'badge-green' : 'badge-amber'}`}>
                      {q.status.toUpperCase()}
                    </span>
                  </div>

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

                  <div className="flex justify-between items-center" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', maxWidth: '500px' }}>
                      "{q.specialRequirements}"
                    </div>

                    <button
                      onClick={() => {
                        setActiveRfqForQuote(q);
                        setQuotePrice(q.targetUnitPrice);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Send size={14} /> {q.status === 'quoted' ? 'Update Quotation' : 'Formulate Proposal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Coupons & Marketing Tab */}
        {activeTab === 'coupons' && (
          <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Marketing & Coupons</h2>
            </div>

            <form onSubmit={handleCreateCoupon} className="card" style={{ padding: '1.25rem', background: '#FFFFFF', marginBottom: '1.5rem' }}>
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE20"
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Discount %</label>
                  <input
                    type="number"
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Min Cart Value (₹)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="form-input"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Plus size={16} /> Create Coupon
                </button>
              </div>
            </form>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {coupons.map((c) => (
                <div key={c.code} className="card" style={{ padding: '1.25rem', background: '#FFFFFF' }}>
                  <div className="flex justify-between items-center">
                    <span className="badge badge-amber" style={{ fontSize: '0.85rem' }}>
                      {c.code}
                    </span>
                    <strong style={{ color: 'var(--primary)' }}>{c.value}% OFF</strong>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '0.5rem 0' }}>
                    {c.description}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    Min order threshold: ₹{c.minOrderValue.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
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

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={razorpayConfig.enabledMethods?.cod ?? true}
                        onChange={(e) =>
                          setRazorpayConfig({
                            ...razorpayConfig,
                            enabledMethods: { ...razorpayConfig.enabledMethods, cod: e.target.checked },
                          })
                        }
                      />
                      <span>Cash on Delivery (B2C)</span>
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

      {/* Printable B2B GST Tax Invoice Modal */}
      {selectedB2bOrderForInvoice && (
        <B2BInvoiceModal
          order={selectedB2bOrderForInvoice}
          onClose={() => setSelectedB2bOrderForInvoice(null)}
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
    </div>
  );
};

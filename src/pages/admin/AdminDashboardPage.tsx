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
  Lock,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react';
import { Product, B2COrder, B2BOrder, B2BBusiness, B2BQuotation, Coupon, AdminUser } from '../../types';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardPageProps {
  products: Product[];
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
    'overview' | 'products' | 'orders' | 'verification' | 'rfqs' | 'coupons' | 'approvals'
  >('overview');

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
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #9333EA 0%, #7E22CE 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={22} className="text-white" />
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
                    sku: 'KM-HW-',
                    hsn: '84213920',
                    category: 'Ergonomic Furniture',
                    b2cMrp: 10000,
                    b2cPrice: 7500,
                    b2bWholesalePrice: 5500,
                    b2bMoq: 5,
                    b2bDiscountSlabs: [{ minQty: 5, maxQty: 19, discountPercent: 0, label: 'Base' }],
                    gstRate: 18,
                    stock: 50,
                    rating: 4.8,
                    reviewCount: 1,
                    images: ['https://images.unsplash.com/photo-1580481077195-77626359b35b?auto=format&fit=crop&w=800&q=80'],
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
              Add / Edit Catalog Hardware
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
                    <option value="Ergonomic Furniture">Ergonomic Furniture</option>
                    <option value="Smart EdTech & Display">Smart EdTech & Display</option>
                    <option value="Enterprise Security & IT">Enterprise Security & IT</option>
                    <option value="Office Wellness & Hygiene">Office Wellness & Hygiene</option>
                    <option value="Corporate Gifts & Supplies">Corporate Gifts & Supplies</option>
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
                <label className="form-label">Image URL</label>
                <input
                  type="text"
                  value={editingProduct.images[0] || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="form-input"
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
    </div>
  );
};

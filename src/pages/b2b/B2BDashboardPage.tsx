import React, { useState } from 'react';
import {
  Building2,
  Package,
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  ArrowRight,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { B2BOrder, B2BQuotation } from '../../types';
import { storageService } from '../../services/storageService';
import { B2BInvoiceModal } from '../../components/b2b/B2BInvoiceModal';

interface B2BDashboardPageProps {
  b2bOrders: B2BOrder[];
  quotations: B2BQuotation[];
  onRefresh: () => void;
  setB2bTab: (tab: string) => void;
}

export const B2BDashboardPage: React.FC<B2BDashboardPageProps> = ({
  b2bOrders,
  quotations,
  onRefresh,
  setB2bTab,
}) => {
  const { b2bBusiness, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'quotations' | 'orders' | 'invoices'>('quotations');
  const [selectedQuotation, setSelectedQuotation] = useState<B2BQuotation | null>(null);
  const [selectedB2bInvoice, setSelectedB2bInvoice] = useState<B2BOrder | null>(null);

  const isApproved = b2bBusiness?.status === 'approved';

  const handleAcceptQuotation = (q: B2BQuotation) => {
    if (!q.adminQuotation) return;

    // Convert quotation into an official B2B Order!
    const newOrder: B2BOrder = {
      id: `b2b_ord_${Date.now()}`,
      orderNumber: `KM-B2B-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      poNumber: `PO-${b2bBusiness?.companyName.slice(0, 3).toUpperCase() || 'KM'}-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessId: b2bBusiness?.id || 'biz_demo',
      businessName: b2bBusiness?.companyName || q.businessName,
      gstin: b2bBusiness?.gstin || '29AAACE1234F1Z8',
      shippingAddress: b2bBusiness?.shippingAddress || {
        id: 'saddr',
        fullName: q.businessName,
        phone: q.phone,
        street: 'Commercial Facility',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: q.deliveryPincode,
        addressType: 'work',
      },
      billingAddress: b2bBusiness?.billingAddress || {
        id: 'baddr',
        fullName: q.businessName,
        phone: q.phone,
        street: 'Registered Corporate Office',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: q.deliveryPincode,
        addressType: 'work',
      },
      items: [
        {
          productId: q.productId,
          productName: q.productName,
          sku: q.sku,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
          quantity: q.requestedQty,
          wholesalePrice: q.adminQuotation.quotedUnitPrice,
          tierDiscountPercent: 0,
          effectiveUnitPrice: q.adminQuotation.quotedUnitPrice,
          hsn: '85258900',
          gstRate: 18,
          total: q.adminQuotation.totalTaxable,
        },
      ],
      subtotal: q.adminQuotation.totalTaxable,
      bulkDiscountTotal: 0,
      taxableAmount: q.adminQuotation.totalTaxable,
      cgst: Math.round((q.adminQuotation.gstAmount / 2) * 100) / 100,
      sgst: Math.round((q.adminQuotation.gstAmount / 2) * 100) / 100,
      igst: 0,
      totalGst: q.adminQuotation.gstAmount,
      shippingFee: q.adminQuotation.shippingCharges,
      grandTotal: q.adminQuotation.grandTotal,
      paymentTerms: 'Net 30',
      paymentStatus: 'credit_approved',
      orderStatus: 'confirmed',
      trackingNumber: `BLUEDART-${Math.floor(100000 + Math.random() * 900000)}`,
      courierPartner: 'Blue Dart Freight',
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'PO ISSUED VIA QUOTATION',
          timestamp: new Date().toLocaleTimeString('en-IN'),
          note: `Quotation ${q.rfqNumber} accepted and converted into active B2B Order`,
        },
      ],
    };

    storageService.saveB2BOrder(newOrder);

    // Update Quotation status to ordered
    q.status = 'ordered';
    storageService.saveB2BQuotation(q);

    onRefresh();
    setActiveTab('orders');
    alert(`Quotation ${q.rfqNumber} successfully accepted! Converted to B2B Order ${newOrder.orderNumber}.`);
  };

  const handleRejectQuotation = (q: B2BQuotation) => {
    q.status = 'rejected';
    storageService.saveB2BQuotation(q);
    onRefresh();
  };

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#E2E8F0', minHeight: '100vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2.5rem' }}>
          <div>
            <div className="flex items-center gap-3">
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                {b2bBusiness?.companyName || 'EduTech Solutions Pvt Ltd'}
              </h1>
              {isApproved ? (
                <span className="badge badge-green" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                  <CheckCircle2 size={13} /> Verified Business Partner
                </span>
              ) : (
                <span className="badge badge-amber" style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
                  <Clock size={13} /> Verification Pending (24h)
                </span>
              )}
              <span
                style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34D399',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  padding: '0.25rem 0.7rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  letterSpacing: '0.03em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Tag size={12} /> DIRECT MANUFACTURER PRICING
              </span>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.35rem' }}>
              GSTIN: <strong>{b2bBusiness?.gstin || '29AAACE1234F1Z8'}</strong> • Type: {b2bBusiness?.businessType || 'Corporate Office'} • Payment Terms: {b2bBusiness?.paymentTerms || 'Net 30'}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setB2bTab('rfq')}
              className="btn btn-amber btn-sm"
              style={{ borderRadius: 'var(--radius-full)' }}
            >
              <FileText size={15} /> Request New RFQ
            </button>
            <button
              onClick={() => setB2bTab('catalog')}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#FFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              Wholesale Catalog
            </button>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: '280px 1fr',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Sidebar Nav & Account Manager Info */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Nav Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <button
                  onClick={() => setActiveTab('quotations')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'quotations' ? 'var(--primary)' : 'transparent',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> Quotations & RFQs
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                    {quotations.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'orders' ? 'var(--primary)' : 'transparent',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Package size={16} /> B2B Orders & POs
                  </span>
                  <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                    {b2bOrders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('invoices')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'invoices' ? 'var(--primary)' : 'transparent',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} /> Tax Invoices (GST & ITC)
                  </span>
                  <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                    {b2bOrders.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: activeTab === 'profile' ? 'var(--primary)' : 'transparent',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Building2 size={16} /> Business Entity Details
                </button>
              </div>
            </div>

            {/* Dedicated Key Account Manager Card */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem', fontWeight: 700 }}>
                Dedicated Relationship Manager
              </div>

              <div className="flex items-center gap-3" style={{ marginBottom: '0.85rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                  }}
                >
                  RS
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#FFFFFF' }}>
                    {b2bBusiness?.accountManager.name || 'Rohan Saxena'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#38BDF8' }}>
                    {b2bBusiness?.accountManager.designation || 'Sr. Institutional Key Account Lead'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem', color: '#CBD5E1' }}>
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-blue-400" />
                  <span>{b2bBusiness?.accountManager.email || 'rohan.saxena@kognitiminds.com'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-emerald-400" />
                  <span>{b2bBusiness?.accountManager.phone || '+91 99100 88221'}</span>
                </div>
              </div>
            </div>

            {/* Credit Line Box */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>Pre-Approved Institutional Credit</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399', margin: '0.2rem 0' }}>
                ₹{(b2bBusiness?.creditLimit || 500000).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                Payment Terms: <strong>{b2bBusiness?.paymentTerms || 'Net 30'}</strong> against formal Purchase Order
              </div>
            </div>
          </aside>

          {/* Main Display Desk */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
            }}
          >
            {/* 1. Quotations Tab */}
            {activeTab === 'quotations' && (
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                      Commercial Quotations (RFQ Desk)
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                      Review admin commercial proposals, negotiate terms, and convert accepted quotes to orders.
                    </p>
                  </div>
                </div>

                {quotations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                    <FileText size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
                    <div>No quotations submitted yet.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {quotations.map((q) => (
                      <div
                        key={q.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.5rem',
                        }}
                      >
                        <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '0.85rem' }}>
                          <div className="flex items-center gap-3">
                            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#FFFFFF' }}>
                              {q.rfqNumber}
                            </span>
                            <span
                              className={`badge ${
                                q.status === 'quoted'
                                  ? 'badge-green'
                                  : q.status === 'ordered'
                                  ? 'badge-blue'
                                  : 'badge-amber'
                              }`}
                              style={{ fontSize: '0.72rem' }}
                            >
                              {q.status.toUpperCase()}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                            Submitted on {new Date(q.submittedAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Product Requested</span>
                            <strong style={{ color: '#FFFFFF' }}>{q.productName}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>SKU: {q.sku}</div>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Requested Volume</span>
                            <strong style={{ color: '#FFFFFF' }}>{q.requestedQty} Units</strong>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Client Target Price</span>
                            <strong style={{ color: '#FBBF24' }}>₹{q.targetUnitPrice.toLocaleString('en-IN')} / unit</strong>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Destination PIN</span>
                            <strong style={{ color: '#FFFFFF' }}>{q.deliveryPincode}</strong>
                          </div>
                        </div>

                        {/* Admin Issued Official Proposal */}
                        {q.adminQuotation && (
                          <div
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              borderRadius: 'var(--radius-md)',
                              padding: '1.25rem',
                              marginTop: '1rem',
                            }}
                          >
                            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '0.5rem' }}>
                              <span style={{ fontWeight: 800, color: '#34D399', fontSize: '0.95rem' }}>
                                ✓ Official Quotation Approved by Kogniti Desk
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                                Valid until: {q.adminQuotation.validUntil}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-4 flex-wrap" style={{ margin: '0.6rem 0' }}>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Approved Unit Rate: </span>
                                <strong style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>
                                  ₹{q.adminQuotation.quotedUnitPrice.toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Taxable Total: </span>
                                <strong style={{ color: '#FFFFFF' }}>
                                  ₹{q.adminQuotation.totalTaxable.toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>GST (18% ITC): </span>
                                <strong style={{ color: '#38BDF8' }}>
                                  ₹{q.adminQuotation.gstAmount.toLocaleString('en-IN')}
                                </strong>
                              </div>
                              <div>
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Grand Total: </span>
                                <strong style={{ fontSize: '1.25rem', color: '#34D399' }}>
                                  ₹{q.adminQuotation.grandTotal.toLocaleString('en-IN')}
                                </strong>
                              </div>
                            </div>

                            <p style={{ fontSize: '0.78rem', color: '#CBD5E1', fontStyle: 'italic', marginBottom: '1rem' }}>
                              "{q.adminQuotation.adminNotes}"
                            </p>

                            {q.status === 'quoted' && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleAcceptQuotation(q)}
                                  className="btn btn-amber btn-sm"
                                >
                                  <Check size={14} /> Accept Quotation & Convert to Order
                                </button>
                                <button
                                  onClick={() => handleRejectQuotation(q)}
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171' }}
                                >
                                  <X size={14} /> Decline
                                </button>
                              </div>
                            )}

                            {q.status === 'ordered' && (
                              <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700 }}>
                                ✓ Accepted & Converted to B2B Order. View under B2B Orders.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. B2B Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem' }}>
                  Institutional B2B Orders & Purchase Orders
                </h3>

                {b2bOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                    No B2B orders yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {b2bOrders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.5rem',
                        }}
                      >
                        <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                          <div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF' }}>
                              Order: {ord.orderNumber}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                              PO Reference: <strong>{ord.poNumber}</strong> • Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="badge badge-green">
                              {ord.orderStatus.toUpperCase()}
                            </span>
                            <span className="badge badge-amber">
                              Payment: {ord.paymentTerms}
                            </span>
                          </div>
                        </div>

                        {/* Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-2" style={{ fontSize: '0.85rem' }}>
                              <div>
                                <strong style={{ color: '#FFFFFF' }}>{item.productName}</strong>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                  Qty: {item.quantity} Units × ₹{item.effectiveUnitPrice.toLocaleString('en-IN')} | HSN: {item.hsn}
                                </div>
                              </div>
                              <div style={{ fontWeight: 800, color: '#38BDF8' }}>
                                ₹{item.total.toLocaleString('en-IN')}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order & Invoice Actions */}
                        <div
                          className="flex justify-between items-center flex-wrap gap-3"
                          style={{
                            paddingTop: '0.85rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            fontSize: '0.85rem',
                          }}
                        >
                          <div>
                            <span style={{ color: '#94A3B8' }}>Dispatch Carrier: </span>
                            <strong>{ord.courierPartner} (AWB: {ord.trackingNumber})</strong>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-baseline gap-2">
                              <span style={{ color: '#94A3B8' }}>Total:</span>
                              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>
                                ₹{ord.grandTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            <button
                              onClick={() => setSelectedB2bInvoice(ord)}
                              className="btn btn-outline-b2b btn-sm"
                              style={{
                                color: '#38BDF8',
                                borderColor: 'rgba(56, 189, 248, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                fontWeight: 700,
                              }}
                            >
                              <FileText size={14} /> Generate B2B Tax Invoice
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. B2B Tax Invoices & ITC Tab */}
            {activeTab === 'invoices' && (
              <div>
                <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF' }}>
                      Commercial GST Tax Invoices & Input Tax Credit (ITC)
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                      Official Section 31 statutory invoices for institutional procurement and tax credit reconciliation
                    </p>
                  </div>
                </div>

                {/* Statutory ITC Summary KPI Bar */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Total Invoiced Volume</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: '0.2rem 0' }}>
                      ₹{b2bOrders.reduce((sum, o) => sum + o.grandTotal, 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#38BDF8' }}>
                      {b2bOrders.length} Invoices issued
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#A7F3D0', fontWeight: 600 }}>Total Input Tax Credit (ITC)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34D399', margin: '0.2rem 0' }}>
                      ₹{b2bOrders.reduce((sum, o) => sum + o.totalGst, 0).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>
                      Claimable under GSTR-2B
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Verified Recipient GSTIN</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38BDF8', margin: '0.35rem 0', letterSpacing: '0.04em' }}>
                      {b2bBusiness?.gstin || '29AAACE1234F1Z8'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981' }}>
                      ✓ Compliant Active Entity
                    </div>
                  </div>
                </div>

                {/* Invoices List */}
                {b2bOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                    No B2B tax invoices generated yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {b2bOrders.map((ord) => (
                      <div
                        key={ord.id}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '1.25rem 1.5rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                              INV-{ord.orderNumber}
                            </span>
                            <span
                              className="badge"
                              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontSize: '0.7rem' }}
                            >
                              ORIGINAL FOR RECIPIENT
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                            PO Ref: <strong style={{ color: '#E2E8F0' }}>{ord.poNumber}</strong> • Date: {new Date(ord.createdAt).toLocaleDateString('en-IN')} • Payment: <strong style={{ color: '#FCD34D' }}>{ord.paymentTerms}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 flex-wrap">
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Taxable Base: ₹{ord.taxableAmount.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>GST (18%): ₹{ord.totalGst.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34D399', marginTop: '0.1rem' }}>
                              ₹{ord.grandTotal.toLocaleString('en-IN')}
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedB2bInvoice(ord)}
                            className="btn btn-amber btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                          >
                            <Printer size={15} /> Generate B2B Tax Invoice (PDF)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Entity Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.5rem' }}>
                  Registered Corporate Entity Profile
                </h3>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label className="form-label" style={{ color: '#94A3B8' }}>Company Name</label>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {b2bBusiness?.companyName || 'EduTech Solutions Private Limited'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#94A3B8' }}>Indian GSTIN</label>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.05em' }}>
                      {b2bBusiness?.gstin || '29AAACE1234F1Z8'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#94A3B8' }}>PAN Number</label>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {b2bBusiness?.pan || 'AAACE1234F'}
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ color: '#94A3B8' }}>Authorized Contact</label>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#FFFFFF' }}>
                      {b2bBusiness?.contactPerson || 'Vikram Malhotra'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                      {b2bBusiness?.businessEmail || 'procurement@edutech.in'}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem' }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    Registered Compliance Documents
                  </h4>
                  <div className="flex flex-col gap-2">
                    {b2bBusiness?.documents?.map((doc, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          padding: '0.75rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-amber-400" />
                          <span style={{ fontSize: '0.85rem' }}>{doc.name}</span>
                        </div>
                        <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable B2B GST Tax Invoice Modal */}
      {selectedB2bInvoice && (
        <B2BInvoiceModal
          order={selectedB2bInvoice}
          onClose={() => setSelectedB2bInvoice(null)}
        />
      )}
    </div>
  );
};

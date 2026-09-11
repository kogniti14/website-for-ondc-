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
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { B2BOrder, B2BQuotation } from '../../types';
import { storageService } from '../../services/storageService';
import { OrderInvoiceModal } from '../../components/common/OrderInvoiceModal';
import { ImageUpload } from '../../components/common/ImageUpload';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';

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
  const [selectedB2bInvoice, setSelectedB2bInvoice] = useState<B2BOrder | null>(null);
  const [orderToPay, setOrderToPay] = useState<B2BOrder | null>(null);
  const [orderCreatedMsg, setOrderCreatedMsg] = useState<string | null>(null);
  const [logoSuccess, setLogoSuccess] = useState(false);
  const [revisionModalQuote, setRevisionModalQuote] = useState<B2BQuotation | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [targetCounterPrice, setTargetCounterPrice] = useState('');

  const handleSubmitCounterRevision = () => {
    if (!revisionModalQuote) return;
    if (!revisionNotes.trim()) {
      alert('Please provide notes or feedback explaining your counter-offer or requested changes.');
      return;
    }
    const updatedQuote: B2BQuotation = {
      ...revisionModalQuote,
      status: 'revision_requested',
      notes: `${revisionModalQuote.notes ? revisionModalQuote.notes + '\n\n' : ''}[Client Counter-Revision Requested on ${new Date().toLocaleDateString('en-IN')}]: ${revisionNotes}${targetCounterPrice ? ` (Target Unit Price: ₹${targetCounterPrice})` : ''}`,
      targetUnitPrice: targetCounterPrice ? parseFloat(targetCounterPrice) : revisionModalQuote.targetUnitPrice,
    };
    storageService.saveB2BQuotation(updatedQuote);
    setRevisionModalQuote(null);
    setRevisionNotes('');
    setTargetCounterPrice('');
    onRefresh();
    alert(`Revision request for ${revisionModalQuote.rfqNumber} successfully submitted to the Commercial Desk. Our team will review and update your proposal.`);
  };

  const handleB2BPaymentSuccess = (response: any) => {
    if (!orderToPay) return;
    const updated: B2BOrder = {
      ...orderToPay,
      paymentStatus: 'paid',
      paymentDetails: {
        transactionId: response.razorpay_payment_id,
        bankName: response.method,
      },
      statusTimeline: [
        ...(orderToPay.statusTimeline || []),
        {
          status: 'COMMERCIAL PAYMENT SETTLED VIA RAZORPAY',
          timestamp: new Date().toLocaleTimeString('en-IN'),
          note: `Settled online via Razorpay Gateway (Payment ID: ${response.razorpay_payment_id})`,
        },
      ],
    };
    storageService.saveB2BOrder(updated);
    setOrderToPay(null);
    onRefresh();
    alert(`B2B Order ${updated.orderNumber} successfully settled via Razorpay!`);
  };

  const handleLogoUpload = (imgVal: string | string[]) => {
    const avatar = typeof imgVal === 'string' ? imgVal : imgVal[0] || '';
    if (b2bBusiness) {
      const updated = { ...b2bBusiness, avatarUrl: avatar };
      storageService.saveB2BBusiness(updated);
      setLogoSuccess(true);
      setTimeout(() => setLogoSuccess(false), 3000);
      onRefresh();
    }
  };

  const isApproved = b2bBusiness?.status === 'approved';

  const handleAcceptQuotation = (q: B2BQuotation) => {
    if (!b2bBusiness) {
      alert('Sign In Compulsory: You must be signed in to an authorized B2B account to place and confirm this order.');
      return;
    }

    const converted = storageService.convertQuotationToB2BOrder(q.id, b2bBusiness?.companyName || 'Client Accepted');
    if (converted) {
      onRefresh();
      setActiveTab('orders');
      alert(`Quotation ${q.rfqNumber} successfully accepted! Converted to Confirmed B2B Order ${converted.orderNumber}. Statutory Tax Invoice is now generated.`);
      return;
    }

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
          productId: q.productId || 'prod_1',
          productName: q.productName || 'Institutional Product',
          sku: q.sku || 'KM-PRO',
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
          quantity: q.requestedQty || 1,
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
      orderStatus: 'placed',
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
                                  : q.status === 'revised_quoted'
                                  ? 'badge-purple'
                                  : q.status === 'revision_requested'
                                  ? 'badge-amber'
                                  : q.status === 'ordered' || q.status === 'converted_to_order'
                                  ? 'badge-green'
                                  : q.status === 'rejected'
                                  ? 'badge-red'
                                  : 'badge-blue'
                              }`}
                              style={{
                                fontSize: '0.72rem',
                                background:
                                  q.status === 'revised_quoted'
                                    ? 'rgba(168, 85, 247, 0.15)'
                                    : q.status === 'revision_requested'
                                    ? 'rgba(245, 158, 11, 0.15)'
                                    : undefined,
                                color:
                                  q.status === 'revised_quoted'
                                    ? '#C084FC'
                                    : q.status === 'revision_requested'
                                    ? '#FBBF24'
                                    : undefined,
                                borderColor:
                                  q.status === 'revised_quoted'
                                    ? 'rgba(168, 85, 247, 0.4)'
                                    : q.status === 'revision_requested'
                                    ? 'rgba(245, 158, 11, 0.4)'
                                    : undefined,
                              }}
                            >
                              {q.status === 'revised_quoted'
                                ? '✨ REVISED QUOTATION'
                                : q.status === 'revision_requested'
                                ? '🔄 REVISION REQUESTED'
                                : q.status === 'converted_to_order' || q.status === 'ordered'
                                ? '✅ CONVERTED TO ORDER'
                                : q.status.toUpperCase()}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                            Submitted on {new Date(q.submittedAt || q.createdAt || Date.now()).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Product Requested</span>
                            <strong style={{ color: '#FFFFFF' }}>{q.productName}</strong>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>SKU: {q.sku || 'KM-B2B-PRO'}</div>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Requested Volume</span>
                            <strong style={{ color: '#FFFFFF' }}>{q.requestedQty} Units</strong>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Client Target Price</span>
                            <strong style={{ color: '#FBBF24' }}>₹{(q.targetUnitPrice || 0).toLocaleString('en-IN')} / unit</strong>
                          </div>
                          <div>
                            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'block' }}>Destination PIN</span>
                            <strong style={{ color: '#FFFFFF' }}>{q.deliveryPincode}</strong>
                          </div>
                        </div>

                        {/* 3-STEP REVISED QUOTATION COMPARISON CARD */}
                        {(q.status === 'revised_quoted' || (q.revisions && q.revisions.length > 0)) ? (
                          <div
                            style={{
                              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                              border: '1px solid rgba(168, 85, 247, 0.35)',
                              borderRadius: '12px',
                              padding: '1.25rem',
                              marginTop: '1rem',
                              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                              <div className="flex items-center gap-2">
                                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#C084FC' }}>
                                  🔄 Commercial Revision & Transparent Comparison
                                </span>
                                <span
                                  style={{
                                    background: 'rgba(168, 85, 247, 0.2)',
                                    color: '#E9D5FF',
                                    padding: '0.15rem 0.55rem',
                                    borderRadius: '999px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    border: '1px solid rgba(168, 85, 247, 0.4)',
                                  }}
                                >
                                  Revision #{q.revisions?.length || 1}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                                Revised on {new Date(q.revisions?.[q.revisions.length - 1]?.revisedAt || q.createdAt || Date.now()).toLocaleDateString('en-IN')}
                              </span>
                            </div>

                            {/* 3 Steps Side-by-Side Progression Grid */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                                gap: '1rem',
                                marginBottom: '1rem',
                              }}
                            >
                              {/* Step 1: Original Request */}
                              <div
                                style={{
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                }}
                              >
                                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 800, marginBottom: '0.5rem' }}>
                                  Step 1 • Original Request
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Product: </span>
                                    <strong style={{ color: '#E2E8F0' }}>{q.originalRequest?.productName || q.productName}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Requested Qty: </span>
                                    <strong style={{ color: '#E2E8F0' }}>{q.originalRequest?.requestedQty || q.requestedQty} Units</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Target Unit Price: </span>
                                    <strong style={{ color: '#FBBF24' }}>
                                      ₹{(q.originalRequest?.targetUnitPrice || q.targetUnitPrice || 0).toLocaleString('en-IN')}
                                    </strong>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Delivery PIN: </span>
                                    <strong style={{ color: '#E2E8F0' }}>{q.originalRequest?.deliveryPincode || q.deliveryPincode}</strong>
                                  </div>
                                  {(q.originalRequest?.notes || q.notes) && (
                                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#94A3B8', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.35rem', borderRadius: '4px' }}>
                                      "{q.originalRequest?.notes || q.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Step 2: Revised Proposal */}
                              <div
                                style={{
                                  background: 'rgba(168, 85, 247, 0.06)',
                                  border: '1px solid rgba(168, 85, 247, 0.25)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                }}
                              >
                                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#C084FC', fontWeight: 800, marginBottom: '0.5rem' }}>
                                  Step 2 • Revised Commercial Terms
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Quoted Unit Rate: </span>
                                    <strong style={{ color: '#FFFFFF' }}>
                                      ₹{(q.adminQuotation?.quotedUnitPrice || (q.taxableAmount ? Math.round(q.taxableAmount / (q.requestedQty || 1)) : 0)).toLocaleString('en-IN')}
                                    </strong>
                                    {Boolean(q.discount) && (
                                      <span style={{ color: '#34D399', fontSize: '0.72rem', marginLeft: '0.4rem' }}>
                                        ({q.discount}% Bulk Disc.)
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Statutory GST: </span>
                                    <strong style={{ color: '#38BDF8' }}>18% (9% CGST + 9% SGST)</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Logistics / Freight: </span>
                                    <strong style={{ color: '#E2E8F0' }}>
                                      {q.shippingCharges ? `₹${q.shippingCharges.toLocaleString('en-IN')}` : 'Included / Free Bulk Freight'}
                                    </strong>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Delivery Timeline: </span>
                                    <strong style={{ color: '#E2E8F0' }}>{q.deliveryTimeline || '3 - 5 Business Days'}</strong>
                                  </div>
                                  <div>
                                    <span style={{ color: '#94A3B8' }}>Payment Terms: </span>
                                    <strong style={{ color: '#E2E8F0' }}>{q.paymentTerms || 'Net 30 Days'}</strong>
                                  </div>
                                  {(q.adminRemarks || q.adminQuotation?.adminNotes) && (
                                    <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#CBD5E1', fontStyle: 'italic', background: 'rgba(168, 85, 247, 0.1)', padding: '0.35rem', borderRadius: '4px', borderLeft: '2px solid #C084FC' }}>
                                      Admin Remarks: "{q.adminRemarks || q.adminQuotation?.adminNotes}"
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Step 3: Final Quoted Amount */}
                              <div
                                style={{
                                  background: 'rgba(16, 185, 129, 0.08)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '8px',
                                  padding: '1rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#34D399', fontWeight: 800, marginBottom: '0.5rem' }}>
                                    Step 3 • Final Quoted Amount
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                                    <div className="flex justify-between">
                                      <span style={{ color: '#94A3B8' }}>Taxable Base:</span>
                                      <strong>₹{(q.taxableAmount || q.adminQuotation?.totalTaxable || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span style={{ color: '#94A3B8' }}>18% GST (ITC):</span>
                                      <strong style={{ color: '#38BDF8' }}>₹{(q.gstAmount || q.adminQuotation?.gstAmount || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                    <div className="flex justify-between">
                                      <span style={{ color: '#94A3B8' }}>Freight / Logistics:</span>
                                      <strong>₹{(q.shippingCharges || q.adminQuotation?.shippingCharges || 0).toLocaleString('en-IN')}</strong>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
                                  <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Final Net Payable (Inc. GST)</div>
                                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34D399', marginTop: '0.1rem' }}>
                                    ₹{(q.grandTotal || q.adminQuotation?.grandTotal || 0).toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Client Decision Actions */}
                            {(q.status === 'revised_quoted' || q.status === 'quoted') && (
                              <div className="flex items-center gap-3 flex-wrap" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.85rem' }}>
                                <button
                                  onClick={() => handleAcceptQuotation(q)}
                                  className="btn btn-amber btn-sm"
                                  style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                                >
                                  <Check size={15} /> Accept Revised Quotation & Convert to Order
                                </button>
                                <button
                                  onClick={() => {
                                    setRevisionModalQuote(q);
                                    setTargetCounterPrice(String(q.targetUnitPrice || ''));
                                  }}
                                  className="btn btn-outline-b2b btn-sm"
                                  style={{ borderColor: 'rgba(168, 85, 247, 0.5)', color: '#C084FC', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                                >
                                  <RefreshCw size={14} /> Request Counter-Revision
                                </button>
                                <button
                                  onClick={() => handleRejectQuotation(q)}
                                  className="btn btn-sm"
                                  style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <X size={14} /> Decline
                                </button>
                              </div>
                            )}

                            {q.status === 'revision_requested' && (
                              <div
                                style={{
                                  background: 'rgba(245, 158, 11, 0.12)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  borderRadius: '6px',
                                  padding: '0.6rem 0.85rem',
                                  fontSize: '0.8rem',
                                  color: '#FCD34D',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                }}
                              >
                                <Clock size={16} />
                                <span>
                                  <strong>Revision Request Under Review:</strong> Your counter-terms have been received by our Commercial Desk. We are reviewing and will provide an updated proposal shortly.
                                </span>
                              </div>
                            )}

                            {(q.status === 'ordered' || q.status === 'converted_to_order') && (
                              <div
                                style={{
                                  background: 'rgba(16, 185, 129, 0.12)',
                                  border: '1px solid rgba(16, 185, 129, 0.3)',
                                  borderRadius: '6px',
                                  padding: '0.6rem 0.85rem',
                                  fontSize: '0.8rem',
                                  color: '#34D399',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  gap: '0.5rem',
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 size={16} />
                                  <span>
                                    <strong>Quotation Accepted:</strong> Converted to Confirmed B2B Order <strong>#{q.convertedOrderId || 'Confirmed'}</strong>.
                                  </span>
                                </div>
                                <button
                                  onClick={() => setActiveTab('orders')}
                                  className="btn btn-outline-b2b btn-sm"
                                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#34D399', borderColor: '#34D399' }}
                                >
                                  View Order & Tax Invoice →
                                </button>
                              </div>
                            )}
                          </div>
                        ) : q.adminQuotation ? (
                          /* Standard Initial Admin Proposal */
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
                              <div className="flex gap-3 flex-wrap">
                                <button
                                  onClick={() => handleAcceptQuotation(q)}
                                  className="btn btn-amber btn-sm"
                                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <Check size={14} /> Accept Quotation & Convert to Order
                                </button>
                                <button
                                  onClick={() => {
                                    setRevisionModalQuote(q);
                                    setTargetCounterPrice(String(q.targetUnitPrice || ''));
                                  }}
                                  className="btn btn-outline-b2b btn-sm"
                                  style={{ borderColor: 'rgba(168, 85, 247, 0.5)', color: '#C084FC', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                                >
                                  <RefreshCw size={14} /> Request Revision
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

                            {q.status === 'revision_requested' && (
                              <div style={{ fontSize: '0.8rem', color: '#FBBF24', fontWeight: 600 }}>
                                🔄 Revision Request Sent. Commercial Desk is reviewing.
                              </div>
                            )}

                            {(q.status === 'ordered' || q.status === 'converted_to_order') && (
                              <div style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 700 }}>
                                ✓ Accepted & Converted to B2B Order. View under B2B Orders.
                              </div>
                            )}
                          </div>
                        ) : null}
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

                          <div className="flex items-center gap-3 flex-wrap">
                            <span
                              className={`badge ${
                                ord.orderStatus === 'confirmed' || ord.orderStatus === 'delivered'
                                  ? 'badge-green'
                                  : ord.orderStatus === 'rejected'
                                  ? 'badge-red'
                                  : ord.orderStatus === 'placed'
                                  ? 'badge-amber'
                                  : 'badge-blue'
                              }`}
                            >
                              {ord.orderStatus === 'placed'
                                ? 'ORDER PLACED (AWAITING REVIEW)'
                                : ord.orderStatus === 'confirmed'
                                ? 'ORDER CONFIRMED'
                                : ord.orderStatus === 'rejected'
                                ? 'ORDER REJECTED'
                                : ord.orderStatus.toUpperCase()}
                            </span>
                            <span className="badge badge-amber">
                              Payment: {ord.paymentTerms}
                            </span>
                            {ord.source && (
                              <span
                                className="badge"
                                style={{
                                  background:
                                    ord.source === 'whatsapp'
                                      ? 'rgba(37, 211, 102, 0.15)'
                                      : ord.source === 'phone'
                                      ? 'rgba(59, 130, 246, 0.15)'
                                      : ord.source === 'sales_rep'
                                      ? 'rgba(168, 85, 247, 0.15)'
                                      : 'rgba(245, 158, 11, 0.15)',
                                  color:
                                    ord.source === 'whatsapp'
                                      ? '#25D366'
                                      : ord.source === 'phone'
                                      ? '#60A5FA'
                                      : ord.source === 'sales_rep'
                                      ? '#C084FC'
                                      : '#FBBF24',
                                  border: '1px solid currentColor',
                                  fontSize: '0.72rem',
                                }}
                              >
                                {ord.source === 'whatsapp'
                                  ? '💬 WhatsApp Booking'
                                  : ord.source === 'phone'
                                  ? '📞 Phone Booking'
                                  : ord.source === 'sales_rep'
                                  ? '💼 Sales Rep Booking'
                                  : ord.source === 'direct_offline'
                                  ? '🏪 Direct Offline'
                                  : ord.source === 'email'
                                  ? '✉️ Email Order'
                                  : '🌐 Web Order'}
                              </span>
                            )}
                            {ord.amountDue !== undefined && (
                              <span
                                className="badge"
                                style={{
                                  background:
                                    ord.amountDue === 0
                                      ? 'rgba(16, 185, 129, 0.15)'
                                      : ord.amountPaid && ord.amountPaid > 0
                                      ? 'rgba(245, 158, 11, 0.15)'
                                      : 'rgba(239, 68, 68, 0.15)',
                                  color:
                                    ord.amountDue === 0
                                      ? '#34D399'
                                      : ord.amountPaid && ord.amountPaid > 0
                                      ? '#FBBF24'
                                      : '#F87171',
                                  border: '1px solid currentColor',
                                  fontSize: '0.72rem',
                                }}
                              >
                                {ord.amountDue === 0
                                  ? '✓ Fully Paid'
                                  : ord.amountPaid && ord.amountPaid > 0
                                  ? `Partially Paid (Due ₹${ord.amountDue.toLocaleString('en-IN')})`
                                  : `Payment Due: ₹${ord.amountDue.toLocaleString('en-IN')}`}
                              </span>
                            )}
                          </div>
                        </div>

                        {ord.orderStatus === 'rejected' && ord.rejectionReason && (
                          <div
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              padding: '0.5rem 0.75rem',
                              fontSize: '0.78rem',
                              color: '#FCA5A5',
                              marginBottom: '0.75rem',
                            }}
                          >
                            <strong>Rejection Note:</strong> {ord.rejectionReason}
                          </div>
                        )}

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

                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-baseline gap-2">
                              <span style={{ color: '#94A3B8' }}>Total:</span>
                              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34D399' }}>
                                ₹{ord.grandTotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {ord.paymentStatus === 'paid' ? (
                              <span
                                style={{
                                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                  color: '#34D399',
                                  border: '1px solid rgba(16, 185, 129, 0.35)',
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                              >
                                <CheckCircle2 size={13} /> PAID (RAZORPAY)
                              </span>
                            ) : (
                              <button
                                onClick={() => setOrderToPay(ord)}
                                className="btn btn-sm"
                                style={{
                                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                                  color: '#FFFFFF',
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  fontWeight: 700,
                                }}
                              >
                                <CreditCard size={14} /> Settle via Razorpay
                              </button>
                            )}

                            {ord.orderStatus === 'placed' ? (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#F59E0B',
                                  background: 'rgba(245, 158, 11, 0.1)',
                                  border: '1px solid rgba(245, 158, 11, 0.3)',
                                  borderRadius: '6px',
                                  padding: '0.4rem 0.75rem',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                }}
                                title="Official Tax Invoice will be generated upon Super Admin confirmation"
                              >
                                🔒 Invoice on Confirmation
                              </span>
                            ) : ord.orderStatus === 'rejected' ? (
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#EF4444',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '6px',
                                  padding: '0.4rem 0.75rem',
                                }}
                              >
                                🚫 Order Rejected
                              </span>
                            ) : (
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
                                <FileText size={14} /> Official B2B Tax Invoice
                              </button>
                            )}
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

                        <div className="flex items-center gap-4 flex-wrap">
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Taxable Base: ₹{ord.taxableAmount.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>GST (18%): ₹{ord.totalGst.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34D399', marginTop: '0.1rem' }}>
                              ₹{ord.grandTotal.toLocaleString('en-IN')}
                            </div>
                          </div>

                          {ord.paymentStatus === 'paid' ? (
                            <span
                              style={{
                                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                color: '#34D399',
                                border: '1px solid rgba(16, 185, 129, 0.35)',
                                padding: '0.35rem 0.65rem',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                            >
                              <CheckCircle2 size={13} /> PAID
                            </span>
                          ) : (
                            <button
                              onClick={() => setOrderToPay(ord)}
                              className="btn btn-sm"
                              style={{
                                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                                color: '#FFFFFF',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                fontWeight: 700,
                              }}
                            >
                              <CreditCard size={14} /> Pay via Razorpay
                            </button>
                          )}

                          {ord.orderStatus === 'placed' ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#F59E0B',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.75rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                              }}
                              title="Official Tax Invoice will be generated upon Super Admin confirmation"
                            >
                              🔒 Invoice on Confirmation
                            </span>
                          ) : ord.orderStatus === 'rejected' ? (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: '#EF4444',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                padding: '0.4rem 0.75rem',
                              }}
                            >
                              🚫 Order Rejected
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedB2bInvoice(ord)}
                              className="btn btn-amber btn-sm"
                              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
                            >
                              <FileText size={15} /> Official B2B Tax Invoice (PDF)
                            </button>
                          )}
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

                <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', maxWidth: '440px' }}>
                  <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Corporate Entity Brand Logo
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1rem' }}>
                    Upload your official company logo directly from device (PNG, JPG, WebP) to reflect across institutional invoices and quotations.
                  </p>
                  <ImageUpload
                    label="Company Brand Logo"
                    helperText="Select or drag-and-drop corporate logo from device."
                    variant="dark"
                    aspectRatio="square"
                    value={b2bBusiness?.avatarUrl || ''}
                    onChange={handleLogoUpload}
                  />
                  {logoSuccess && (
                    <div className="badge badge-green" style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={13} /> Corporate logo saved successfully!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Printable Official B2B GST Tax Invoice Modal */}
      {selectedB2bInvoice && (
        <OrderInvoiceModal
          order={selectedB2bInvoice}
          isB2B={true}
          onClose={() => setSelectedB2bInvoice(null)}
        />
      )}

      {/* Razorpay Settlement Modal for B2B Orders */}
      {orderToPay && (
        <RazorpayCheckoutModal
          isOpen={!!orderToPay}
          onClose={() => setOrderToPay(null)}
          amount={orderToPay.grandTotal}
          orderNumber={orderToPay.orderNumber}
          customerName={orderToPay.businessName}
          customerEmail={orderToPay.billingAddress?.fullName || 'accounts@kognitiminds.com'}
          customerPhone={orderToPay.billingAddress?.phone || '9931648595'}
          description={`B2B Commercial Order #${orderToPay.orderNumber} Settlement`}
          isB2B={true}
          onSuccess={handleB2BPaymentSuccess}
        />
      )}

      {/* Client Counter-Revision Request Modal */}
      {revisionModalQuote && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 15, 29, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#1E293B',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: 'var(--radius-lg)',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              padding: '1.75rem',
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <RefreshCw size={18} style={{ color: '#C084FC' }} /> Request Counter-Revision
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.15rem' }}>
                  Quotation: <strong>{revisionModalQuote.rfqNumber}</strong> • {revisionModalQuote.productName}
                </p>
              </div>
              <button
                onClick={() => {
                  setRevisionModalQuote(null);
                  setRevisionNotes('');
                  setTargetCounterPrice('');
                }}
                className="btn btn-icon"
                style={{ color: '#94A3B8' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Proposed Target Unit Price (Optional, ₹)
                </label>
                <input
                  type="number"
                  className="input"
                  value={targetCounterPrice}
                  onChange={(e) => setTargetCounterPrice(e.target.value)}
                  placeholder="e.g. 190"
                  style={{ width: '100%', background: '#0F172A', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.35rem' }}>
                  Revision Notes & Specific Requirements <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  className="input"
                  rows={4}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="Please specify your counter-offer, delivery timeline expectation, payment term request, or quantity adjustments..."
                  style={{ width: '100%', background: '#0F172A', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF', resize: 'vertical' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.25rem', display: 'block' }}>
                  This note will be sent directly to the Kogniti Commercial Desk for negotiation.
                </span>
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setRevisionModalQuote(null);
                    setRevisionNotes('');
                    setTargetCounterPrice('');
                  }}
                  className="btn btn-outline-b2b btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitCounterRevision}
                  className="btn btn-amber btn-sm"
                  style={{ fontWeight: 800, background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)', color: '#FFFFFF' }}
                >
                  Submit Counter-Revision
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

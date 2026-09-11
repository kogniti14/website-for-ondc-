import React, { useState } from 'react';
import {
  FileText,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { Product, B2BQuotation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface B2BRFQPageProps {
  products: Product[];
  selectedProduct?: Product | null;
  onSuccess: () => void;
  setB2bTab: (tab: string) => void;
  openB2BAuthModal?: () => void;
}

export const B2BRFQPage: React.FC<B2BRFQPageProps> = ({
  products,
  selectedProduct,
  onSuccess,
  setB2bTab,
  openB2BAuthModal,
}) => {
  const { role, b2bBusiness } = useAuth();
  const isB2BAuthenticated = role === 'b2b' && !!b2bBusiness;
  const [showB2BAuthPopup, setShowB2BAuthPopup] = useState(false);

  const [productId, setProductId] = useState<string>(selectedProduct?.id || products[0]?.id || '');
  const [requestedQty, setRequestedQty] = useState<number>(selectedProduct?.b2bMoq || 20);
  const [targetUnitPrice, setTargetUnitPrice] = useState<number>(
    selectedProduct ? Math.round(selectedProduct.b2bWholesalePrice * 0.9) : 10000
  );
  const [companyName, setCompanyName] = useState(b2bBusiness?.companyName || '');
  const [contactPerson, setContactPerson] = useState(b2bBusiness?.contactPerson || '');
  const [email, setEmail] = useState(b2bBusiness?.businessEmail || '');
  const [phone, setPhone] = useState(b2bBusiness?.mobile || '');
  const [deliveryPincode, setDeliveryPincode] = useState(b2bBusiness?.shippingAddress?.pincode || '560100');
  const [requiredByDate, setRequiredByDate] = useState('2026-09-30');
  const [specialRequirements, setSpecialRequirements] = useState(
    'Required for campus / institutional supply. Please include dispatch schedule and GST breakdown in commercial quote.'
  );

  const [submittedRfq, setSubmittedRfq] = useState<B2BQuotation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentProduct = products.find((p) => p.id === productId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isB2BAuthenticated) {
      setError('Business Sign In Compulsory: Please sign in to your registered B2B account or register your business before submitting a quotation or placing an order.');
      setShowB2BAuthPopup(true);
      if (openB2BAuthModal) openB2BAuthModal();
      return;
    }

    if (!companyName || !email || !phone || !requestedQty) {
      setError('Please fill in all mandatory quotation request fields.');
      return;
    }

    if (currentProduct && requestedQty < currentProduct.b2bMoq) {
      setError(`Minimum Order Quantity (MOQ) for ${currentProduct.name} is ${currentProduct.b2bMoq} units.`);
      return;
    }

    const newRfq: B2BQuotation = {
      id: `rfq_${Date.now()}`,
      rfqNumber: `RFQ-KM-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessId: b2bBusiness?.id || `biz_${Date.now()}`,
      businessName: companyName,
      contactPerson,
      email,
      phone,
      productId,
      productName: currentProduct?.name || 'Selected Paper & Stationery Supplies',
      sku: currentProduct?.sku || 'SKU-KM',
      requestedQty,
      targetUnitPrice,
      deliveryPincode,
      requiredByDate,
      specialRequirements,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    };

    storageService.saveB2BQuotation(newRfq);
    setSubmittedRfq(newRfq);
  };

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#E2E8F0', minHeight: '100vh', padding: '3.5rem 0 6rem' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        {submittedRfq ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              borderRadius: 'var(--radius-xl)',
              padding: '3rem 2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Quotation Request Received!
            </h2>
            <div className="badge badge-green" style={{ fontSize: '0.82rem', marginBottom: '1.25rem' }}>
              RFQ Reference: {submittedRfq.rfqNumber}
            </div>

            <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto 2rem' }}>
              Your bulk inquiry for <strong>{submittedRfq.requestedQty} units</strong> of <strong>{submittedRfq.productName}</strong> has been routed to our Institutional Pricing Desk. An official commercial quotation with tax and freight breakdown will be published to your B2B Dashboard within 4 business hours.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={() => setB2bTab('dashboard')}
                className="btn btn-amber"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 1.75rem' }}
              >
                View in Business Dashboard <ArrowRight size={16} />
              </button>
              <button
                onClick={() => setSubmittedRfq(null)}
                className="btn btn-outline"
                style={{
                  borderRadius: 'var(--radius-full)',
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                }}
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="flex items-center justify-center gap-2 flex-wrap" style={{ marginBottom: '0.75rem' }}>
                <div
                  className="inline-flex items-center gap-2"
                  style={{
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#FBBF24',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  <FileText size={14} /> Custom Commercial Proposals
                </div>
                <div
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34D399',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.03em',
                  }}
                >
                  <Tag size={13} /> DIRECT MANUFACTURER PRICING
                </div>
              </div>
              <h1 style={{ fontSize: '2.3rem', fontWeight: 800, color: '#FFFFFF' }}>
                Request a Formal B2B Quotation (RFQ)
              </h1>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                Direct factory proposals for tenders, institutional supplies, corporate bulk paper procurement, and custom stationery branding.
              </p>
            </div>

            {/* Business Sign In Compulsory Banner */}
            {!isB2BAuthenticated && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem 1.5rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#EF4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Lock size={22} />
                  </div>
                  <div>
                    <div style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem' }}>
                      Business Sign In Compulsory
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                      You must be signed in to your registered B2B account to request official quotes and place institutional orders.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openB2BAuthModal?.()}
                  className="btn btn-amber"
                  style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.4rem' }}
                >
                  Sign In to B2B Portal →
                </button>
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#F87171',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem',
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem',
                backdropFilter: 'blur(16px)',
              }}
            >
              {/* Product Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Select Physical Product *</label>
                <select
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    const sel = products.find((p) => p.id === e.target.value);
                    if (sel) {
                      setRequestedQty(sel.b2bMoq);
                      setTargetUnitPrice(Math.round(sel.b2bWholesalePrice * 0.9));
                    }
                  }}
                  className="form-select"
                  style={{
                    background: '#1E293B',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    padding: '0.75rem',
                  }}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (MOQ: {p.b2bMoq} | Wholesale Base: ₹{p.b2bWholesalePrice.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity & Target Price */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div className="flex justify-between">
                    <label className="form-label" style={{ color: '#CBD5E1' }}>Required Quantity (Units) *</label>
                    {currentProduct && (
                      <span style={{ fontSize: '0.75rem', color: '#FBBF24' }}>
                        MOQ: {currentProduct.b2bMoq}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={currentProduct?.b2bMoq || 1}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(Number(e.target.value))}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Target Unit Price Budget (₹ Excl. GST)</label>
                  <input
                    type="number"
                    value={targetUnitPrice}
                    onChange={(e) => setTargetUnitPrice(Number(e.target.value))}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                  />
                </div>
              </div>

              {/* Organization & Contact Details */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Company / School / Entity Name *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Delhi Public School / Infosys Campus"
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Authorized Contact Person *</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Rajesh Khurana"
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Corporate Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Mobile Phone *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98111 22334"
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>
              </div>

              {/* Delivery Timeline & Pincode */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Destination PIN Code *</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={deliveryPincode}
                    onChange={(e) => setDeliveryPincode(e.target.value)}
                    placeholder="560100"
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#CBD5E1' }}>Required Delivery Deadline *</label>
                  <input
                    type="date"
                    value={requiredByDate}
                    onChange={(e) => setRequiredByDate(e.target.value)}
                    className="form-input"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                    required
                  />
                </div>
              </div>

              {/* Special Requirements */}
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ color: '#CBD5E1' }}>Custom Requirements / Notes</label>
                <textarea
                  rows={3}
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Specify laser logo branding, packaging requirements, on-site assembly assistance, payment credit terms..."
                  className="form-textarea"
                  style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.2)', color: '#FFF' }}
                />
              </div>

              {isB2BAuthenticated ? (
                <button
                  type="submit"
                  className="btn btn-amber btn-lg"
                  style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
                >
                  <Send size={18} /> Submit Formal RFQ to Kogniti B2B Desk
                </button>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowB2BAuthPopup(true);
                      if (openB2BAuthModal) openB2BAuthModal();
                    }}
                    className="btn btn-primary btn-lg"
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)',
                      background: 'linear-gradient(135deg, #DC2626 0%, #EA580C 100%)',
                      boxShadow: '0 8px 24px rgba(220, 38, 38, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                    }}
                  >
                    <Lock size={18} /> Sign In Compulsory to Place RFQ Order
                  </button>
                  <p style={{ fontSize: '0.78rem', color: '#EF4444', textAlign: 'center', marginTop: '0.45rem', fontWeight: 600 }}>
                    🔒 Please sign in to your verified B2B account before requesting quotations.
                  </p>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Business Sign In Compulsory Popup Modal */}
        {showB2BAuthPopup && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              className="card"
              style={{
                maxWidth: '440px',
                width: '100%',
                padding: '2.25rem 2rem',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-xl)',
                background: '#0F172A',
                color: '#FFFFFF',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Lock size={28} />
              </div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Business Sign In Compulsory
              </h3>
              <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '1.75rem' }}>
                Before submitting a quotation request or placing an order, signing in to your verified business account is compulsory. Please sign in or register your business details.
              </p>
              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowB2BAuthPopup(false);
                    if (openB2BAuthModal) openB2BAuthModal();
                  }}
                  className="btn btn-amber"
                  style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}
                >
                  Sign In to B2B Portal →
                </button>
                <button
                  type="button"
                  onClick={() => setShowB2BAuthPopup(false)}
                  className="btn btn-outline"
                  style={{ width: '100%', color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

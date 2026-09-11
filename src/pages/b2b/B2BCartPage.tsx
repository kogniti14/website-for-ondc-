import React, { useState } from 'react';
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Building2,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Lock,
} from 'lucide-react';
import { Product, B2BQuotation } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface B2BCartPageProps {
  products: Product[];
  onProceedToCheckout: () => void;
  setB2bTab: (tab: string) => void;
  onOpenProduct: (product: Product) => void;
  openB2BAuthModal: () => void;
  onRfqCreated?: (rfq: B2BQuotation) => void;
}

export const B2BCartPage: React.FC<B2BCartPageProps> = ({
  products,
  onProceedToCheckout,
  setB2bTab,
  onOpenProduct,
  openB2BAuthModal,
  onRfqCreated,
}) => {
  const { role, b2bBusiness } = useAuth();
  const { b2bCart, updateB2BQty, removeFromB2BCart, clearB2BCart, getB2BCalculations } = useCart();
  const [rfqNote, setRfqNote] = useState('');
  const [showRfqSuccessModal, setShowRfqSuccessModal] = useState<B2BQuotation | null>(null);

  const calculations = getB2BCalculations();
  const isApproved = role === 'b2b' && !!b2bBusiness;

  const handleCheckoutClick = () => {
    if (!isApproved) {
      openB2BAuthModal();
      return;
    }
    onProceedToCheckout();
  };

  const handleConvertCartToRfq = () => {
    if (!isApproved) {
      alert('Sign In Compulsory: Please sign in or register your business to request custom commercial quotations.');
      openB2BAuthModal();
      return;
    }

    if (b2bCart.length === 0) return;

    const rfqItems = b2bCart.map((it) => {
      const p = products.find((x) => x.id === it.productId);
      return {
        productId: it.productId,
        productName: p?.name || 'Wholesale Item',
        sku: p?.sku || 'SKU-KM',
        quantity: it.quantity,
        unitPrice: p?.b2bWholesalePrice || 200,
        discount: 0,
        gstRate: 18,
        gstAmount: Math.round(((p?.b2bWholesalePrice || 200) * it.quantity * 0.18) * 100) / 100,
        total: (p?.b2bWholesalePrice || 200) * it.quantity,
      };
    });

    const firstProduct = products.find((x) => x.id === b2bCart[0]?.productId);

    const newRfq: B2BQuotation = {
      id: `rfq_${Date.now()}`,
      rfqNumber: `RFQ-KM-2026-${Math.floor(100 + Math.random() * 900)}`,
      businessId: b2bBusiness?.id || 'biz_direct',
      businessName: b2bBusiness?.companyName || 'Institutional Client',
      contactPerson: b2bBusiness?.contactPerson || 'Procurement Officer',
      email: b2bBusiness?.businessEmail || 'procurement@business.com',
      phone: b2bBusiness?.mobile || '9931648595',
      deliveryPincode: b2bBusiness?.shippingAddress?.pincode || '201301',
      productId: firstProduct?.id,
      productName: firstProduct?.name || 'Multi-Item Institutional Bulk Order',
      sku: firstProduct?.sku,
      requestedQty: b2bCart.reduce((s, i) => s + i.quantity, 0),
      targetUnitPrice: Math.round(calculations.subtotal / Math.max(1, b2bCart.reduce((s, i) => s + i.quantity, 0))),
      status: 'submitted',
      subtotal: calculations.subtotal,
      discount: calculations.discount,
      taxableAmount: calculations.taxableAmount,
      gstAmount: calculations.totalGst,
      shippingCharges: 0,
      grandTotal: calculations.total,
      items: rfqItems,
      notes: rfqNote || 'Bulk Cart converted to RFQ for commercial price negotiation and dispatch schedule.',
      submittedAt: new Date().toISOString(),
    };

    storageService.saveB2BQuotation(newRfq);
    clearB2BCart();
    setShowRfqSuccessModal(newRfq);
    if (onRfqCreated) onRfqCreated(newRfq);
  };

  return (
    <div style={{ backgroundColor: '#0A0F1D', color: '#E2E8F0', minHeight: '100vh', padding: '3.5rem 0 6rem' }}>
      <div className="container">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '2.5rem' }}>
          <div>
            <button
              onClick={() => setB2bTab('catalog')}
              className="flex items-center gap-1.5"
              style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ArrowLeft size={15} /> Back to Wholesale Catalog
            </button>
            <div className="flex items-center gap-3">
              <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#FFFFFF' }}>
                B2B Procurement Cart
              </h1>
              <span
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                DIRECT MANUFACTURER RATES
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.3rem' }}>
              Purchase directly at listed wholesale prices via Razorpay, or request a bulk quotation for negotiated rates.
            </p>
          </div>

          {b2bCart.length > 0 && (
            <button
              onClick={clearB2BCart}
              className="flex items-center gap-1.5"
              style={{
                color: '#F87171',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Trash2 size={15} /> Clear B2B Cart
            </button>
          )}
        </div>

        {/* Empty State */}
        {b2bCart.length === 0 ? (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-xl)',
              padding: '5rem 2rem',
              textAlign: 'center',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <ShoppingCart size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.5rem' }}>
              Your B2B Cart is Empty
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Explore our catalog of institutional copier paper, eco stationery, and notebooks. Add items at MOQ to purchase directly at listed prices, or submit an RFQ for bulk negotiation.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => setB2bTab('catalog')}
                className="btn btn-amber"
                style={{ fontWeight: 800, padding: '0.75rem 1.75rem' }}
              >
                Browse Wholesale Catalog →
              </button>
              <button
                onClick={() => setB2bTab('rfq')}
                className="btn btn-outline-b2b"
                style={{ fontWeight: 700, padding: '0.75rem 1.75rem', color: '#FFFFFF' }}
              >
                <FileText size={16} /> Request Custom RFQ
              </button>
            </div>
          </div>
        ) : (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Left Column: Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {b2bCart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;

                const baseTotal = product.b2bWholesalePrice * item.quantity;
                let tierDiscount = 0;
                if (product.b2bDiscountSlabs && product.b2bDiscountSlabs.length > 0) {
                  const eligible = product.b2bDiscountSlabs.filter((s) => item.quantity >= s.minQty);
                  if (eligible.length > 0) {
                    const highest = eligible.reduce((m, c) => (c.discountPercent > m.discountPercent ? c : m));
                    tierDiscount = highest.discountPercent;
                  }
                }

                return (
                  <div
                    key={item.productId}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem',
                      display: 'flex',
                      gap: '1.5rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '120px',
                        height: '110px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        backgroundColor: '#1E293B',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => onOpenProduct(product)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* Details */}
                    <div style={{ flexGrow: 1, minWidth: '220px' }}>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2" style={{ marginBottom: '0.25rem' }}>
                            <span className="badge badge-dark" style={{ border: '1px solid rgba(255, 255, 255, 0.2)', fontSize: '0.68rem' }}>
                              {product.category}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>SKU: {product.sku}</span>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>HSN: {product.hsn}</span>
                          </div>
                          <h4
                            onClick={() => onOpenProduct(product)}
                            style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', cursor: 'pointer' }}
                          >
                            {product.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => removeFromB2BCart(item.productId)}
                          className="btn btn-icon btn-sm"
                          style={{ color: '#EF4444' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Pricing & Slabs Info */}
                      <div className="flex items-center gap-3 flex-wrap" style={{ margin: '0.75rem 0' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Wholesale Price: </span>
                          <strong style={{ fontSize: '1.15rem', color: '#38BDF8' }}>
                            ₹{product.b2bWholesalePrice.toLocaleString('en-IN')}
                          </strong>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}> / unit</span>
                        </div>
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                          MOQ: {product.b2bMoq} Units
                        </span>
                        {tierDiscount > 0 && (
                          <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>
                            ✓ {tierDiscount}% Volume Tier Discount Applied
                          </span>
                        )}
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex justify-between items-center flex-wrap gap-3" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '0.78rem', color: '#CBD5E1', fontWeight: 600 }}>Procurement Qty:</span>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '6px', overflow: 'hidden' }}>
                            <button
                              onClick={() => updateB2BQty(item.productId, Math.max(product.b2bMoq, item.quantity - 10))}
                              style={{ padding: '0.35rem 0.75rem', background: 'rgba(255, 255, 255, 0.08)', color: '#FFF', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                            >
                              -
                            </button>
                            <span style={{ padding: '0.35rem 0.85rem', color: '#FFF', fontWeight: 800, fontSize: '0.9rem', minWidth: '45px', textAlign: 'center' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateB2BQty(item.productId, item.quantity + 10)}
                              style={{ padding: '0.35rem 0.75rem', background: 'rgba(255, 255, 255, 0.08)', color: '#FFF', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textAlign: 'right' }}>Taxable Base:</span>
                          <strong style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>
                            ₹{Math.round(baseTotal * (1 - tierDiscount / 100)).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Convert to RFQ Note Box */}
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1.5px dashed rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ fontWeight: 800, color: '#FCD34D', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <FileText size={18} /> Need Special Institutional Pricing, Net 30 Terms, or Custom Packaging?
                </div>
                <p style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '0.75rem' }}>
                  You can convert this entire procurement cart into a formal Request for Quotation (RFQ). Our commercial desk will review your volume and provide negotiated terms.
                </p>
                <textarea
                  className="input"
                  rows={2}
                  value={rfqNote}
                  onChange={(e) => setRfqNote(e.target.value)}
                  placeholder="Optional: Add special instructions, delivery timeline, or target budget..."
                  style={{ width: '100%', background: '#0F172A', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#FFF', marginBottom: '0.75rem', fontSize: '0.82rem' }}
                />
                <button
                  type="button"
                  onClick={handleConvertCartToRfq}
                  className="btn btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#000000',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <FileText size={14} /> Convert Entire Cart to RFQ Quotation Request
                </button>
              </div>
            </div>

            {/* Right Column: Checkout Summary Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.75rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                position: 'sticky',
                top: '100px',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                Procurement Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <div className="flex justify-between">
                  <span style={{ color: '#94A3B8' }}>Wholesale Subtotal:</span>
                  <strong style={{ color: '#FFFFFF' }}>₹{calculations.subtotal.toLocaleString('en-IN')}</strong>
                </div>

                {calculations.discount > 0 && (
                  <div className="flex justify-between" style={{ color: '#34D399' }}>
                    <span>Volume Tier Discount:</span>
                    <strong>- ₹{calculations.discount.toLocaleString('en-IN')}</strong>
                  </div>
                )}

                <div className="flex justify-between">
                  <span style={{ color: '#94A3B8' }}>Taxable Base:</span>
                  <strong style={{ color: '#FFFFFF' }}>₹{calculations.taxableAmount.toLocaleString('en-IN')}</strong>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: '#94A3B8' }}>18% Statutory GST (CGST 9% + SGST 9%):</span>
                  <strong style={{ color: '#38BDF8' }}>₹{calculations.totalGst.toLocaleString('en-IN')}</strong>
                </div>

                <div className="flex justify-between">
                  <span style={{ color: '#94A3B8' }}>Commercial Bulk Freight:</span>
                  <strong style={{ color: '#34D399' }}>FREE</strong>
                </div>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div className="flex justify-between items-baseline">
                    <span style={{ color: '#CBD5E1', fontWeight: 700 }}>Total Net Payable:</span>
                    <strong style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34D399' }}>
                      ₹{calculations.total.toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                    Inclusive of 18% GST • 100% ITC Eligible Section 31 Tax Invoice
                  </div>
                </div>
              </div>

              {/* Direct Purchase Button */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={handleCheckoutClick}
                  className="btn btn-amber"
                  style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    fontSize: '1rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
                  }}
                >
                  ⚡ Proceed to Direct Checkout <ArrowRight size={18} />
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                  Direct online settlement via <strong>Razorpay Online Gateway</strong>
                </div>
              </div>

              {/* Trust Badges */}
              <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.76rem', color: '#94A3B8' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Statutory Section 31 Corporate Tax Invoice on Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-blue-400" />
                  <span>Pan-India Commercial Freight Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-amber-400" />
                  <span>PCI-DSS 256-bit Encrypted Razorpay Gateway</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RFQ Success Modal */}
      {showRfqSuccessModal && (
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
              border: '1px solid rgba(245, 158, 11, 0.4)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '520px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '0.4rem' }}>
              Quotation Request Submitted!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Your cart has been converted to RFQ <strong>{showRfqSuccessModal.rfqNumber}</strong> and forwarded to the Kogniti Commercial Desk. Our team will review and provide a negotiated proposal.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  setShowRfqSuccessModal(null);
                  setB2bTab('dashboard');
                }}
                className="btn btn-amber"
                style={{ fontWeight: 800 }}
              >
                View in Quotations Desk →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

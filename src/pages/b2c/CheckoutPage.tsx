import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building,
  Smartphone,
  Banknote,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Info,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, B2COrder, B2CAddress } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';

interface CheckoutPageProps {
  products: Product[];
  onOrderSuccess: (order: B2COrder) => void;
  onBackToCart: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  products,
  onOrderSuccess,
  onBackToCart,
}) => {
  const { b2cCart, getB2CCalculations, clearB2CCart, appliedCoupon } = useCart();
  const { role, b2cUser } = useAuth();
  const calculations = getB2CCalculations();

  // Contact Info
  const [customerName, setCustomerName] = useState(b2cUser?.name || 'Utkarsh Sharma');
  const [customerEmail, setCustomerEmail] = useState(b2cUser?.email || 'customer@kognitiminds.com');
  const [customerPhone, setCustomerPhone] = useState(b2cUser?.phone || '+91 98765 43210');

  // Shipping Address
  const [street, setStreet] = useState('Flat 402, Green Glen Layout, Outer Ring Road');
  const [apartment, setApartment] = useState('Prestige Ivy League');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560103');

  // Business GST option
  const [wantsGstInvoice, setWantsGstInvoice] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'>('upi');
  const [upiId, setUpiId] = useState('utkarsh@oksbi');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8901');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const orderItems = b2cCart
        .map((item) => {
          const p = products.find((prod) => prod.id === item.productId);
          if (!p) return null;
          return {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            image: p.images[0],
            quantity: item.quantity,
            unitPrice: p.b2cPrice,
            mrp: p.b2cMrp,
            hsn: p.hsn,
            gstRate: p.gstRate,
            total: p.b2cPrice * item.quantity,
          };
        })
        .filter(Boolean) as any[];

      const shippingAddr: B2CAddress = {
        id: `addr_${Date.now()}`,
        fullName: customerName,
        phone: customerPhone,
        street,
        apartment,
        city,
        state,
        pincode,
        addressType: 'home',
      };

      const newOrder: B2COrder = {
        id: `b2c_ord_${Date.now()}`,
        orderNumber: `KM-B2C-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress: shippingAddr,
        billingAddress: shippingAddr,
        optionalGstin: wantsGstInvoice && gstin ? gstin.toUpperCase() : undefined,
        items: orderItems,
        subtotal: calculations.subtotal,
        discount: calculations.discount,
        couponCode: appliedCoupon?.code,
        gstAmount: calculations.totalGst,
        shippingFee: calculations.shippingFee,
        total: calculations.total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentDetails: {
          transactionId: `TXN-KM-${Date.now()}`,
          upiId: paymentMethod === 'upi' ? upiId : undefined,
          bankName: paymentMethod === 'netbanking' ? selectedBank : undefined,
        },
        orderStatus: 'confirmed',
        trackingNumber: `DEL-IN-${Math.floor(100000000 + Math.random() * 900000000)}`,
        courierPartner: 'Delhivery',
        createdAt: new Date().toISOString(),
        statusTimeline: [
          {
            status: 'ORDER PLACED',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            note: `Order placed successfully via ${paymentMethod.toUpperCase()}`,
          },
          {
            status: 'PAYMENT CONFIRMED',
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            note: `Verified transaction of ₹${calculations.total.toLocaleString('en-IN')}`,
          },
        ],
      };

      storageService.saveB2COrder(newOrder);
      clearB2CCart();

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback if canvas-confetti is not loaded
      }

      setIsProcessing(false);
      onOrderSuccess(newOrder);
    }, 1200);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBackToCart}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
          style={{ fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}
        >
          <ArrowLeft size={14} /> Return to Shopping Cart
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Secure Checkout</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Standard Pan-India Indian Rupee (INR) Express Payment Processing
        </p>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Left Form Elements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Step 1: Customer Contact Info */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  1
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Contact & Identity</h3>
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mobile Number *</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  2
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Shipping & Delivery Address</h3>
              </div>

              <div className="form-group">
                <label className="form-label">Flat / House No. / Building Name</label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address / Landmark</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">State *</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">PIN Code *</label>
                  <input
                    type="text"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => setPincode(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Optional GSTIN for Business Input Tax Credit */}
            <div className="card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#F8FAFC' }}>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={wantsGstInvoice}
                  onChange={(e) => setWantsGstInvoice(e.target.checked)}
                />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--slate-800)' }}>
                  I want a GST Tax Invoice for Business Input Tax Credit (ITC)
                </span>
              </label>

              {wantsGstInvoice && (
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginTop: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company / Entity Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Tech LLP"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">15-Digit GSTIN</label>
                    <input
                      type="text"
                      placeholder="e.g. 29AAACE1234F1Z8"
                      value={gstin}
                      maxLength={15}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 4: Payment Gateway Simulation */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  3
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Payment Method</h3>
              </div>

              {/* Payment Tabs */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'upi' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === 'upi' ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === 'upi' ? 'var(--primary)' : 'var(--slate-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  <QrCode size={20} />
                  <span>UPI (QR / VPA)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'card' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === 'card' ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === 'card' ? 'var(--primary)' : 'var(--slate-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  <CreditCard size={20} />
                  <span>Cards (RuPay/Visa)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'netbanking' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === 'netbanking' ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === 'netbanking' ? 'var(--primary)' : 'var(--slate-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  <Building size={20} />
                  <span>Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === 'cod' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    background: paymentMethod === 'cod' ? 'var(--primary-light)' : '#ffffff',
                    color: paymentMethod === 'cod' ? 'var(--primary)' : 'var(--slate-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                  }}
                >
                  <Banknote size={20} />
                  <span>Cash on Delivery</span>
                </button>
              </div>

              {/* Payment Details Sub-section */}
              <div style={{ background: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                {paymentMethod === 'upi' && (
                  <div>
                    <div className="flex items-center gap-3" style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          width: '75px',
                          height: '75px',
                          background: '#FFFFFF',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <QrCode size={60} className="text-slate-800" />
                      </div>
                      <div style={{ fontSize: '0.82rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                          Scan UPI QR with any App
                        </div>
                        <div style={{ color: 'var(--slate-500)' }}>
                          Google Pay, PhonePe, Paytm, BHIM, CRED
                        </div>
                        <span className="badge badge-green" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                          Instant 0% UPI Fee
                        </span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Or enter your UPI VPA ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="flex flex-col gap-3">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input type="text" placeholder="MM / YY" defaultValue="08/28" className="form-input" />
                      <input type="password" placeholder="CVV" defaultValue="123" maxLength={3} className="form-input" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="form-label" style={{ marginBottom: '0.4rem' }}>Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="form-select"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)' }}>
                    Pay cash or UPI upon delivery at your doorstep. Please keep the exact amount ready.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Col */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', background: '#FFFFFF' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Checkout Summary
              </h3>

              {/* Items Compact Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {b2cCart.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;
                  return (
                    <div key={item.productId} className="flex items-center justify-between gap-3" style={{ fontSize: '0.85rem' }}>
                      <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                        <img src={p.images[0]} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>
                        ₹{(p.b2cPrice * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Breakdown */}
              <div
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  fontSize: '0.88rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>₹{calculations.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Coupon Discount:</span>
                    <span>- ₹{calculations.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>GST (18% Included):</span>
                  <span>₹{calculations.totalGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery:</span>
                  <span>{calculations.shippingFee === 0 ? 'FREE' : `₹${calculations.shippingFee}`}</span>
                </div>
                <div
                  className="flex justify-between items-baseline"
                  style={{
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                  }}
                >
                  <span>Grand Total:</span>
                  <span style={{ color: 'var(--primary)' }}>₹{calculations.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                {isProcessing ? 'Confirming Payment...' : `Place Order (₹${calculations.total.toLocaleString('en-IN')})`}
              </button>

              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.76rem',
                  color: 'var(--slate-600)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div className="flex items-center gap-1.5 font-medium">
                  <Truck size={14} className="text-emerald-600 flex-shrink-0" />
                  <span>FREE PAN-INDIA DELIVERY on Orders Above ₹1,999</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-blue-600 flex-shrink-0" />
                  <span>100% GENUINE PRODUCTS | GST Invoice Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-amber-600 flex-shrink-0" />
                  <span>
                    B2B & INSTITUTIONAL ENQUIRIES:{' '}
                    <a href="tel:+919931648595" style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
                      +91 9931648595
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

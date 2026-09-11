import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building,
  Smartphone,
  FileText,
  Lock,
  ArrowRight,
  ArrowLeft,
  Info,
  Building2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, B2COrder, B2BOrder, B2BOrderItemSummary, B2CAddress } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { razorpayService, RazorpayPaymentSuccessResponse } from '../../services/razorpayService';
import { RazorpayCheckoutModal } from '../../components/payment/RazorpayCheckoutModal';

interface CheckoutPageProps {
  products: Product[];
  onOrderSuccess: (order: B2COrder) => void;
  onB2BOrderSuccess?: (order: B2BOrder) => void;
  onBackToCart: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
  onOpenB2BAuth?: () => void;
  isB2B?: boolean;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  products,
  onOrderSuccess,
  onB2BOrderSuccess,
  onBackToCart,
  onOpenAuth,
  onOpenB2BAuth,
  isB2B = false,
}) => {
  const {
    b2cCart,
    b2bCart,
    getB2CCalculations,
    getB2BCalculations,
    clearB2CCart,
    clearB2BCart,
    appliedCoupon,
  } = useCart();
  const { role, b2cUser, b2bBusiness } = useAuth();

  const calculations = isB2B ? getB2BCalculations() : getB2CCalculations();
  const cartItems = isB2B ? b2bCart : b2cCart;

  const isAuthenticated = isB2B
    ? (role === 'b2b' && !!b2bBusiness)
    : (role === 'b2c' && !!b2cUser);

  const [showAuthRequiredPopup, setShowAuthRequiredPopup] = useState(false);

  // Contact Info
  const [customerName, setCustomerName] = useState(
    isB2B
      ? b2bBusiness?.contactPerson || b2bBusiness?.companyName || ''
      : b2cUser?.name || ''
  );
  const [customerEmail, setCustomerEmail] = useState(
    isB2B
      ? b2bBusiness?.businessEmail || ''
      : b2cUser?.email || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    isB2B
      ? b2bBusiness?.mobile || ''
      : b2cUser?.phone || ''
  );

  // Business Details (Required for B2B, Optional for B2C)
  const [companyName, setCompanyName] = useState(b2bBusiness?.companyName || '');
  const [gstin, setGstin] = useState(b2bBusiness?.gstin || '');
  const [wantsGstInvoice, setWantsGstInvoice] = useState(isB2B);

  // Shipping / Warehouse Address
  const [street, setStreet] = useState(
    isB2B
      ? b2bBusiness?.shippingAddress?.street || 'Industrial Area Phase 2'
      : b2cUser?.addresses?.[0]?.street || 'Flat 402, Green Glen Layout, Outer Ring Road'
  );
  const [apartment, setApartment] = useState(
    isB2B
      ? b2bBusiness?.shippingAddress?.apartment || 'Warehouse Block B'
      : b2cUser?.addresses?.[0]?.apartment || 'Prestige Ivy League'
  );
  const [city, setCity] = useState(
    isB2B
      ? b2bBusiness?.shippingAddress?.city || 'Bengaluru'
      : b2cUser?.addresses?.[0]?.city || 'Bengaluru'
  );
  const [state, setState] = useState(
    isB2B
      ? b2bBusiness?.shippingAddress?.state || 'Karnataka'
      : b2cUser?.addresses?.[0]?.state || 'Karnataka'
  );
  const [pincode, setPincode] = useState(
    isB2B
      ? b2bBusiness?.shippingAddress?.pincode || '560066'
      : b2cUser?.addresses?.[0]?.pincode || '560103'
  );

  useEffect(() => {
    if (isB2B && b2bBusiness) {
      setCustomerName(b2bBusiness.contactPerson || b2bBusiness.companyName || '');
      setCustomerEmail(b2bBusiness.businessEmail || '');
      setCustomerPhone(b2bBusiness.mobile || '');
      setCompanyName(b2bBusiness.companyName || '');
      setGstin(b2bBusiness.gstin || '');
      if (b2bBusiness.shippingAddress) {
        setStreet(b2bBusiness.shippingAddress.street || street);
        setApartment(b2bBusiness.shippingAddress.apartment || apartment);
        setCity(b2bBusiness.shippingAddress.city || city);
        setState(b2bBusiness.shippingAddress.state || state);
        setPincode(b2bBusiness.shippingAddress.pincode || pincode);
      }
      setShowAuthRequiredPopup(false);
    } else if (!isB2B && b2cUser) {
      setCustomerName(b2cUser.name || '');
      setCustomerEmail(b2cUser.email || '');
      setCustomerPhone(b2cUser.phone || '');
      if (b2cUser.addresses && b2cUser.addresses.length > 0) {
        const def = b2cUser.addresses.find((a) => a.isDefault) || b2cUser.addresses[0];
        setStreet(def.street);
        setApartment(def.apartment || '');
        setCity(def.city);
        setState(def.state);
        setPincode(def.pincode);
      }
      setShowAuthRequiredPopup(false);
    }
  }, [b2cUser, b2bBusiness, isB2B]);

  // Payment State (Direct Razorpay Gateway)
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [pendingOrderNum, setPendingOrderNum] = useState('');

  const processOrderPlacement = (
    transactionId: string,
    paymentMethodUsed: string,
    isPaid: boolean,
    bankName?: string,
    upiVal?: string
  ) => {
    // 1. Handle B2B Online Direct Purchase
    if (isB2B) {
      const orderItems: B2BOrderItemSummary[] = b2bCart
        .map((item) => {
          const p = products.find((prod) => prod.id === item.productId);
          if (!p) return null;
          let tierDiscountPercent = 0;
          if (p.b2bDiscountSlabs && p.b2bDiscountSlabs.length > 0) {
            const eligibleSlabs = p.b2bDiscountSlabs.filter((s) => item.quantity >= s.minQty);
            if (eligibleSlabs.length > 0) {
              const highestSlab = eligibleSlabs.reduce((max, cur) =>
                cur.discountPercent > max.discountPercent ? cur : max
              );
              tierDiscountPercent = highestSlab.discountPercent;
            }
          }
          const wholesalePrice = p.b2bWholesalePrice;
          const effectiveUnitPrice = Math.round(wholesalePrice * (1 - tierDiscountPercent / 100));
          const total = effectiveUnitPrice * item.quantity;
          return {
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            image: p.images[0],
            quantity: item.quantity,
            wholesalePrice,
            tierDiscountPercent,
            effectiveUnitPrice,
            hsn: p.hsn || '8504.40.90',
            gstRate: p.gstRate || 18,
            total,
          };
        })
        .filter(Boolean) as B2BOrderItemSummary[];

      const shippingAddr: B2CAddress = {
        id: `addr_${Date.now()}`,
        fullName: customerName,
        phone: customerPhone,
        street,
        apartment,
        city,
        state,
        pincode,
        addressType: 'work',
      };

      const finalOrderNum =
        pendingOrderNum || `KM-B2B-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const newB2BOrder: B2BOrder = {
        id: `b2b_ord_${Date.now()}`,
        orderNumber: finalOrderNum,
        poNumber: `PO-ONLINE-${Date.now().toString().slice(-6)}`,
        businessId: b2bBusiness?.id || `biz_${Date.now()}`,
        businessName: companyName || b2bBusiness?.companyName || customerName,
        gstin: gstin ? gstin.toUpperCase() : b2bBusiness?.gstin || 'UNREGISTERED',
        source: 'web', // CRITICAL: Marks order as online website order (manual alteration locked in admin)
        internalRemarks: `Automated B2B Direct Online Purchase via Razorpay (${paymentMethodUsed})`,
        shippingAddress: shippingAddr,
        billingAddress: shippingAddr,
        items: orderItems,
        subtotal: calculations.subtotal,
        bulkDiscountTotal: calculations.discount,
        taxableAmount: calculations.taxableAmount,
        cgst: calculations.cgst,
        sgst: calculations.sgst,
        igst: 0,
        totalGst: calculations.totalGst,
        shippingFee: 0,
        grandTotal: calculations.total,
        paymentTerms: '100% Advance via Razorpay Online',
        paymentStatus: isPaid ? 'paid' : 'pending_po_approval',
        paymentMode: 'razorpay',
        amountPaid: isPaid ? calculations.total : 0,
        amountDue: isPaid ? 0 : calculations.total,
        paymentRecords: isPaid
          ? [
              {
                id: `pay_rzp_${Date.now()}`,
                amount: calculations.total,
                paymentDate: new Date().toISOString(),
                paymentMode: 'razorpay',
                transactionRef: transactionId,
                recordedBy: 'Razorpay Online Gateway (Automated)',
                recordedAt: new Date().toISOString(),
              },
            ]
          : [],
        paymentDetails: {
          transactionId,
          upiId: upiVal,
          bankName: bankName,
        },
        orderStatus: 'confirmed',
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'Razorpay Web Gateway',
        trackingNumber: `DEL-B2B-${Math.floor(100000000 + Math.random() * 900000000)}`,
        courierPartner: 'Delhivery B2B Express Freight',
        createdAt: new Date().toISOString(),
        statusTimeline: [
          {
            status: 'ORDER PLACED (DIRECT B2B PURCHASE)',
            timestamp: new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            note: `Direct wholesale purchase placed at listed B2B prices via ${paymentMethodUsed.toUpperCase()}.`,
          },
          {
            status: 'PAYMENT CONFIRMED VIA RAZORPAY',
            timestamp: new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            note: `Verified transaction of ₹${calculations.total.toLocaleString(
              'en-IN'
            )} (Razorpay Payment ID: ${transactionId}). Section 31 Tax Invoice generated.`,
          },
          {
            status: 'CONFIRMED',
            timestamp: new Date().toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            note: 'Order auto-confirmed for commercial warehouse allocation and freight dispatch.',
          },
        ],
      };

      storageService.saveB2BOrder(newB2BOrder);
      clearB2BCart();

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Fallback
      }

      setIsProcessing(false);
      if (onB2BOrderSuccess) {
        onB2BOrderSuccess(newB2BOrder);
      }
      return;
    }

    // 2. Handle B2C Consumer Order
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

    const finalOrderNum =
      pendingOrderNum || `KM-B2C-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: B2COrder = {
      id: `b2c_ord_${Date.now()}`,
      orderNumber: finalOrderNum,
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
      paymentMethod: 'razorpay',
      paymentStatus: isPaid ? 'paid' : 'pending',
      paymentDetails: {
        transactionId,
        upiId: upiVal,
        bankName: bankName,
      },
      orderStatus: 'placed',
      trackingNumber: `DEL-IN-${Math.floor(100000000 + Math.random() * 900000000)}`,
      courierPartner: 'Delhivery',
      createdAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'ORDER PLACED',
          timestamp: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          note: `Order placed successfully via ${paymentMethodUsed.toUpperCase()}. Awaiting admin verification and confirmation.`,
        },
        {
          status: 'PAYMENT CONFIRMED VIA RAZORPAY',
          timestamp: new Date().toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          note: `Verified transaction of ₹${calculations.total.toLocaleString(
            'en-IN'
          )} (Razorpay Payment ID: ${transactionId})`,
        },
      ],
    };

    if (appliedCoupon?.code) {
      storageService.incrementCouponUsage(appliedCoupon.code);
    }

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
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowAuthRequiredPopup(true);
      if (isB2B) {
        if (onOpenB2BAuth) onOpenB2BAuth();
        else if (onOpenAuth) onOpenAuth('login');
      } else {
        if (onOpenAuth) onOpenAuth('login');
      }
      return;
    }

    if (isB2B && (!companyName.trim() || !gstin.trim())) {
      alert('Please fill in your Business Legal Name and GSTIN for the statutory B2B Tax Invoice.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !street || !pincode) {
      alert('Please fill in all mandatory shipping and contact details.');
      return;
    }

    const orderNum = isB2B
      ? `KM-B2B-2026-${Math.floor(1000 + Math.random() * 9000)}`
      : `KM-B2C-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    setPendingOrderNum(orderNum);

    // Online Payment via Official Razorpay Gateway
    setIsProcessing(true);

    try {
      const opened = await razorpayService.openOfficialCheckout({
        amount: calculations.total,
        orderNumber: orderNum,
        customerName: isB2B ? companyName || customerName : customerName,
        customerEmail,
        customerPhone,
        description: isB2B
          ? `Kogniti Minds B2B Wholesale Order #${orderNum}`
          : `Pan-India Order #${orderNum}`,
        isB2B: !!isB2B,
        onSuccess: (response: RazorpayPaymentSuccessResponse) => {
          processOrderPlacement(
            response.razorpay_payment_id,
            response.method || 'Razorpay Gateway',
            true,
            response.method
          );
        },
        onDismiss: () => {
          setIsProcessing(false);
        },
      });

      if (!opened) {
        // Fallback to embedded Razorpay modal
        setIsProcessing(false);
        setShowRazorpayModal(true);
      }
    } catch (err) {
      console.error('Error invoking Razorpay:', err);
      setIsProcessing(false);
      setShowRazorpayModal(true);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button
          onClick={onBackToCart}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
          style={{ fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}
        >
          <ArrowLeft size={14} /> {isB2B ? 'Return to B2B Procurement Cart' : 'Return to Shopping Cart'}
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            {isB2B ? 'B2B Institutional Checkout' : 'Secure Checkout'}
          </h1>
          {isB2B && (
            <span
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '0.3rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                letterSpacing: '0.03em',
              }}
            >
              <Sparkles size={13} /> DIRECT WHOLESALE PURCHASE
            </span>
          )}
        </div>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          {isB2B
            ? 'Direct Manufacturer Procurement • 18% ITC Eligible Tax Invoice • Razorpay Express Settlement'
            : 'Standard Pan-India Indian Rupee (INR) Express Payment Processing'}
        </p>
      </div>

      {/* Sign In Compulsory Notification Banner */}
      {!isAuthenticated && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1.5px solid rgba(239, 68, 68, 0.35)',
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
                background: 'rgba(239, 68, 68, 0.15)',
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
              <div style={{ color: 'var(--slate-900)', fontWeight: 800, fontSize: '1rem' }}>
                {isB2B
                  ? 'Business Sign In Compulsory Before Placing B2B Order'
                  : 'Sign In Compulsory Before Placing Order'}
              </div>
              <div style={{ color: 'var(--slate-600)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                {isB2B
                  ? 'You must be signed in with your registered corporate account to finalize orders at listed wholesale prices and claim Section 31 Input Tax Credit.'
                  : 'You must be signed in to your registered account to place and confirm this order.'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isB2B && onOpenB2BAuth) onOpenB2BAuth();
              else onOpenAuth?.('login');
            }}
            className="btn btn-primary"
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '0.6rem 1.4rem',
              background: isB2B ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : undefined,
              color: isB2B ? '#0F172A' : undefined,
              fontWeight: 800,
            }}
          >
            {isB2B ? 'Sign In to B2B Portal →' : 'Sign In / Register Now →'}
          </button>
        </div>
      )}

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
            {/* Step 1: Business Identity for B2B or Contact for B2C */}
            {isB2B ? (
              <div
                className="card"
                style={{
                  padding: '1.75rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid #F59E0B',
                  background: '#FFFFFF',
                }}
              >
                <div className="flex items-center justify-between gap-2" style={{ marginBottom: '1.25rem' }}>
                  <div className="flex items-center gap-2">
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: '#D97706',
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
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#B45309' }}>
                      Registered Corporate & Tax Identity
                    </h3>
                  </div>
                  <span
                    style={{
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      border: '1px solid #FDE68A',
                    }}
                  >
                    18% ITC ELIGIBLE
                  </span>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Company / Organization Name <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Acme Technologies Private Limited"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      GSTIN (15 Alphanumeric) <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      maxLength={15}
                      className="form-input"
                      style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                      required
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.65rem 0.85rem',
                    background: '#FFFBEB',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A',
                    fontSize: '0.78rem',
                    color: '#92400E',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ShieldCheck size={16} className="text-amber-600 flex-shrink-0" />
                  <span>
                    Statutory Section 31 Tax Invoice will be generated automatically upon payment for 100% Input Tax Credit claim.
                  </span>
                </div>
              </div>
            ) : (
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
            )}

            {/* Step 2: Contact Person for B2B or Shipping Address for B2C */}
            {isB2B && (
              <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#D97706',
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
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Procurement Officer / Contact Person</h3>
                </div>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Authorized Contact Person *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Sharma"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Official Work Email *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. ramesh@acme.com"
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Direct Mobile / WhatsApp *</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Shipping & Delivery / Receiving Warehouse Address */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isB2B ? '#D97706' : 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isB2B ? 3 : 2}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  {isB2B ? 'Commercial Receiving Warehouse / Dispatch Address' : 'Shipping & Delivery Address'}
                </h3>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {isB2B ? 'Building / Warehouse Unit / Block Name' : 'Flat / House No. / Building Name'}
                </label>
                <input
                  type="text"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  className="form-input"
                  placeholder={isB2B ? 'e.g. Unit 4B, Kogniti Logistics Park' : 'e.g. Flat 302, Green Glen'}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  {isB2B ? 'Industrial Area / Street / Landmark' : 'Street Address / Landmark'}
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="form-input"
                  placeholder={isB2B ? 'e.g. Electronic City Phase 1' : 'e.g. 1st Main, Koramangala'}
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

            {/* Optional GSTIN for B2C Only */}
            {!isB2B && (
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
            )}

            {/* Step 4: Payment Gateway via Official Razorpay */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: isB2B ? '#D97706' : 'var(--primary)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isB2B ? 4 : 3}
                </div>
                <div className="flex items-center justify-between w-full flex-wrap gap-2">
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                    Integrated Payment Gateway
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      border: '1px solid #BAE6FD',
                    }}
                  >
                    <ShieldCheck size={13} className="text-sky-600" />
                    <span>Razorpay Secure Gateway</span>
                  </span>
                </div>
              </div>

              {/* Direct Razorpay Gateway Selection */}
              <div
                style={{
                  border: '2px solid #0284C7',
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)',
                  padding: '1.35rem 1.5rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)',
                }}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <label
                    htmlFor="payment-method-razorpay"
                    className="flex items-start gap-3 cursor-pointer"
                    style={{ flex: '1 1 320px' }}
                  >
                    <input
                      type="radio"
                      id="payment-method-razorpay"
                      name="paymentMethodSelect"
                      checked={true}
                      readOnly
                      style={{
                        marginTop: '0.25rem',
                        width: '20px',
                        height: '20px',
                        accentColor: '#0284C7',
                        cursor: 'pointer',
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A' }}>
                          Razorpay Official Payment Gateway
                        </span>
                        <span
                          style={{
                            background: '#16A34A',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            letterSpacing: '0.03em',
                          }}
                        >
                          MANDATORY FOR ONLINE SETTLEMENT
                        </span>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.4rem', lineHeight: 1.55 }}>
                        All automatic website orders are processed securely through the integrated{' '}
                        <strong>Razorpay</strong> gateway. Supports UPI, Corporate & Retail Cards, Net Banking, and Wallets with instant reconciliation.
                      </p>
                    </div>
                  </label>

                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                      color: '#38BDF8',
                      padding: '0.5rem 0.95rem',
                      borderRadius: '8px',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      letterSpacing: '0.02em',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      alignSelf: 'flex-start',
                      boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                    }}
                  >
                    <Lock size={15} className="text-sky-400" />
                    <span>Razorpay</span>
                  </div>
                </div>

                {/* Accepted Payment Modes Breakdown */}
                <div
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #BAE6FD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.85rem',
                  }}
                >
                  <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: '0.78rem', color: '#334155' }}>
                    <span style={{ fontWeight: 700 }}>Supported via Gateway:</span>
                    <span style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700, color: '#0F172A' }}>
                      UPI
                    </span>
                    <span style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700, color: '#0F172A' }}>
                      Corporate Cards
                    </span>
                    <span style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700, color: '#0F172A' }}>
                      Net Banking (50+ Banks)
                    </span>
                    <span style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '0.25rem 0.6rem', borderRadius: '6px', fontWeight: 700, color: '#0F172A' }}>
                      Wallets
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 700 }}>
                    <ShieldCheck size={15} />
                    <span>256-Bit SSL Encrypted & RBI Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Col */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', background: '#FFFFFF' }}>
              <div className="flex items-center justify-between gap-2" style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {isB2B ? 'B2B Wholesale Summary' : 'Checkout Summary'}
                </h3>
                {isB2B && (
                  <span style={{ fontSize: '0.75rem', background: '#FEF3C7', color: '#B45309', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {b2bCart.length} item(s)
                  </span>
                )}
              </div>

              {/* Items Compact Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {cartItems.map((item) => {
                  const p = products.find((prod) => prod.id === item.productId);
                  if (!p) return null;
                  const itemPrice = isB2B ? p.b2bWholesalePrice : p.b2cPrice;
                  return (
                    <div key={item.productId} className="flex items-center justify-between gap-3" style={{ fontSize: '0.85rem' }}>
                      <div className="flex items-center gap-2" style={{ minWidth: 0 }}>
                        <img
                          src={p.images[0]}
                          alt=""
                          style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                            Qty: {item.quantity} {isB2B && `(MOQ: ${p.b2bMoq})`}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>
                        ₹{(itemPrice * item.quantity).toLocaleString('en-IN')}
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
                  <span>{isB2B ? 'Wholesale Base Subtotal:' : 'Subtotal:'}</span>
                  <span>₹{calculations.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>{isB2B ? 'Volume Slab Discount:' : 'Coupon Discount:'}</span>
                    <span>- ₹{calculations.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {isB2B && (
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>Taxable Net Amount:</span>
                    <span>₹{calculations.taxableAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>{isB2B ? 'GST (18% ITC Eligible):' : 'GST (18% Included):'}</span>
                  <span>₹{calculations.totalGst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{isB2B ? 'Commercial Freight:' : 'Delivery:'}</span>
                  <span className="text-emerald-600 font-bold">
                    {calculations.shippingFee === 0 ? 'FREE' : `₹${calculations.shippingFee}`}
                  </span>
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
                  <span style={{ color: isB2B ? '#D97706' : 'var(--primary)' }}>
                    ₹{calculations.total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  type="submit"
                  disabled={isProcessing || cartItems.length === 0}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-md)',
                    background: isB2B ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : undefined,
                    color: isB2B ? '#0F172A' : undefined,
                    fontWeight: 800,
                  }}
                >
                  {isProcessing
                    ? 'Opening Razorpay Gateway...'
                    : isB2B
                    ? `Pay & Confirm Wholesale Order (₹${calculations.total.toLocaleString('en-IN')})`
                    : `Pay & Place Order via Razorpay (₹${calculations.total.toLocaleString('en-IN')})`}
                </button>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuthRequiredPopup(true);
                      if (isB2B) {
                        if (onOpenB2BAuth) onOpenB2BAuth();
                        else if (onOpenAuth) onOpenAuth('login');
                      } else {
                        if (onOpenAuth) onOpenAuth('login');
                      }
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
                    <Lock size={18} />{' '}
                    {isB2B
                      ? 'Sign In Compulsory to Place Wholesale Order'
                      : 'Sign In Compulsory to Place Order'}
                  </button>
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: '#DC2626',
                      textAlign: 'center',
                      marginTop: '0.45rem',
                      fontWeight: 600,
                    }}
                  >
                    🔒{' '}
                    {isB2B
                      ? 'Please sign in to your registered B2B account before placing your wholesale order.'
                      : 'Please sign in or register before placing your order.'}
                  </p>
                </div>
              )}

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
                  <span>
                    {isB2B
                      ? 'FREE COMMERCIAL FREIGHT on all direct wholesale orders'
                      : 'FREE PAN-INDIA DELIVERY on Orders Above ₹1,999'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={14} className="text-blue-600 flex-shrink-0" />
                  <span>
                    {isB2B
                      ? 'DIRECT FROM MANUFACTURER | Section 31 Tax Invoice'
                      : '100% GENUINE PRODUCTS | GST Invoice Available'}
                  </span>
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

      {/* Sign In Compulsory Popup Modal */}
      {showAuthRequiredPopup && (
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
              {isB2B ? 'B2B Sign In Compulsory' : 'Sign In Compulsory'}
            </h3>
            <p style={{ fontSize: '0.92rem', color: '#94A3B8', lineHeight: '1.6', marginBottom: '1.75rem' }}>
              {isB2B
                ? 'Before placing direct wholesale orders at manufacturer pricing, signing in with your registered business account is compulsory.'
                : 'Before placing your order, signing in to your registered account is compulsory. Please sign in or register your details to proceed.'}
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowAuthRequiredPopup(false);
                  if (isB2B) {
                    if (onOpenB2BAuth) onOpenB2BAuth();
                    else if (onOpenAuth) onOpenAuth('login');
                  } else {
                    if (onOpenAuth) onOpenAuth('login');
                  }
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  background: isB2B ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : undefined,
                  color: isB2B ? '#0F172A' : undefined,
                }}
              >
                {isB2B ? 'Sign In to Business Account →' : 'Sign In / Register Now →'}
              </button>
              <button
                type="button"
                onClick={() => setShowAuthRequiredPopup(false)}
                className="btn btn-outline"
                style={{ width: '100%', color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Razorpay Interactive Checkout Modal */}
      <RazorpayCheckoutModal
        isOpen={showRazorpayModal}
        onClose={() => setShowRazorpayModal(false)}
        amount={calculations.total}
        orderNumber={pendingOrderNum || (isB2B ? 'KM-B2B-2026-PENDING' : 'KM-B2C-2026-PENDING')}
        customerName={isB2B ? companyName || customerName : customerName}
        customerEmail={customerEmail}
        customerPhone={customerPhone}
        description={
          isB2B
            ? `Kogniti Minds B2B Order #${pendingOrderNum || 'PENDING'}`
            : `Pan-India Order #${pendingOrderNum || 'PENDING'}`
        }
        isB2B={!!isB2B}
        onSuccess={(response) => {
          processOrderPlacement(
            response.razorpay_payment_id,
            response.method || 'Razorpay Gateway',
            true,
            response.method
          );
        }}
      />
    </div>
  );
};

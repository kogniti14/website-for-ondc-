import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Package,
  Truck,
  FileText,
  Calendar,
  CreditCard,
  Building2,
  MapPin,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import { B2COrder, B2BOrder } from '../../types';

interface OrderConfirmPageProps {
  b2cOrders: B2COrder[];
  b2bOrders: B2BOrder[];
  setActiveTab: (tab: string) => void;
}

export const OrderConfirmPage: React.FC<OrderConfirmPageProps> = ({
  b2cOrders,
  b2bOrders,
  setActiveTab,
}) => {
  const getOrderIdFromUrl = () => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('orderId') || '';
    }
    return '';
  };

  const orderId = getOrderIdFromUrl();

  const matchedOrder = useMemo(() => {
    if (!orderId.trim()) {
      if (b2cOrders.length > 0) return b2cOrders[0];
      if (b2bOrders.length > 0) return b2bOrders[0];
      return null;
    }
    const clean = orderId.trim().toLowerCase();
    const b2c = b2cOrders.find((o) => o.id.toLowerCase() === clean || (o.orderNumber && o.orderNumber.toLowerCase() === clean));
    if (b2c) return b2c;
    const b2b = b2bOrders.find((o) => o.id.toLowerCase() === clean || (o.orderNumber && o.orderNumber.toLowerCase() === clean));
    if (b2b) return b2b;
    return null;
  }, [orderId, b2cOrders, b2bOrders]);

  if (!matchedOrder) {
    return (
      <div style={{ background: '#F8FAFC', minHeight: '80vh', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <Package size={56} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          No Verified Order Confirmation Found
        </h2>
        <p style={{ color: '#64748B', maxWidth: '440px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          Confirmation records are only generated when an order has been successfully placed and processed through the backend.
        </p>
        <button
          onClick={() => {
            window.history.pushState(null, '', '/');
            setActiveTab('home');
          }}
          style={{ padding: '0.75rem 1.75rem', background: '#0284C7', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const items = matchedOrder.items || [];
  const orderNumber = matchedOrder.orderNumber || matchedOrder.id;
  const orderTotal = 'grandTotal' in matchedOrder ? (matchedOrder as any).grandTotal : ('total' in matchedOrder ? (matchedOrder as any).total : 0);
  const isB2B = 'companyName' in matchedOrder;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Success Alert Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
            borderRadius: '20px',
            padding: '2.5rem 2rem',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: '2rem',
            boxShadow: '0 4px 20px rgba(22, 101, 52, 0.25)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={36} color="#FFFFFF" />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
            Order Confirmed & Verified!
          </h1>
          <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
            Thank you for ordering tree-free sustainable agro paper. Your order has been registered and is being processed for dispatch.
          </p>
          <div
            style={{
              marginTop: '1.25rem',
              display: 'inline-block',
              padding: '0.45rem 1.25rem',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.2)',
              fontWeight: 800,
              fontSize: '0.95rem',
            }}
          >
            Order Number: #{orderNumber}
          </div>
        </div>

        {/* Itemized Order Details Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            marginBottom: '2rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '1.25rem' }}>
            Itemized Order Summary
          </h2>

          <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            {items.map((item: any, i: number) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: i < items.length - 1 ? '1px dashed #E2E8F0' : 'none',
                }}
              >
                <div>
                  <strong style={{ fontSize: '0.95rem', color: '#0F172A', display: 'block' }}>
                    {item.productName || item.name || 'AgroPrint Sustainable Paper'}
                  </strong>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                    Quantity: {item.quantity} unit(s) • Rate: ₹{(item.unitPrice || item.price || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                  ₹{((item.unitPrice || item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                </strong>
              </div>
            ))}
          </div>

          {/* Totals & GST Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Taxable Subtotal:</span>
              <span>₹{(orderTotal / 1.18).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Statutory GST (18% Input Credit Eligible):</span>
              <span>₹{(orderTotal - orderTotal / 1.18).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803D', fontWeight: 600 }}>
              <span>Pan-India Delivery:</span>
              <span>FREE</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '2px solid #E2E8F0',
                fontSize: '1.25rem',
                fontWeight: 900,
                color: '#0F172A',
              }}
            >
              <span>Grand Total:</span>
              <span>₹{orderTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Delivery & Statutory Details */}
          <div
            style={{
              padding: '1.25rem',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Customer / Recipient</span>
              <strong style={{ color: '#0F172A' }}>
                {(matchedOrder as any).customerName || (matchedOrder as any).shippingAddress?.fullName || 'Valued Customer'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Payment Mode</span>
              <strong style={{ color: '#0F172A' }}>
                {(matchedOrder as any).paymentMethod?.toUpperCase() || 'ONLINE PREPAID'}
              </strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>Dispatch SLA</span>
              <strong style={{ color: '#15803D' }}>Handed to Courier within 24 Hours</strong>
            </div>
          </div>

          {/* Next Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid #E2E8F0' }}>
            <button
              onClick={() => {
                window.history.pushState(null, '', `/track?orderId=${orderNumber}`);
                setActiveTab('track');
              }}
              style={{
                flex: '1 1 180px',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                background: '#0284C7',
                color: '#fff',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Truck size={18} />
              <span>Track Live Delivery</span>
            </button>

            <button
              onClick={() => {
                window.history.pushState(null, '', `/status?orderId=${orderNumber}`);
                setActiveTab('status');
              }}
              style={{
                flex: '1 1 180px',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Order Status Details
            </button>

            <button
              onClick={() => {
                window.history.pushState(null, '', '/search');
                setActiveTab('search');
              }}
              style={{
                flex: '1 1 160px',
                padding: '0.85rem 1.5rem',
                borderRadius: '10px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

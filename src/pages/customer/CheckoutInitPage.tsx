import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
  CreditCard,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ondcClientService } from '../../services/ondcClientService';
import { Product } from '../../types';

interface CheckoutInitPageProps {
  products: Product[];
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const CheckoutInitPage: React.FC<CheckoutInitPageProps> = ({
  products,
  setActiveTab,
  openAuthModal,
}) => {
  const { b2cCart, getB2CCalculations } = useCart();
  const { b2cUser, role } = useAuth();
  const [protocolStatus, setProtocolStatus] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const calculations = getB2CCalculations();

  useEffect(() => {
    if (b2cCart.length > 0) {
      setIsInitializing(true);
      const deliveryAddress = {
        name: b2cUser?.name || 'Authorized Buyer',
        phone: b2cUser?.phone || '9999988888',
        addressLine1: 'Corporate Sector 104',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201304',
      };
      ondcClientService
        .initCheckout(deliveryAddress, 'razorpay')
        .then((res) => {
          if (res.success) {
            setProtocolStatus('ONDC Network ACK: Checkout session initialized and quote verified');
          }
        })
        .catch(() => {})
        .finally(() => setIsInitializing(false));
    }
  }, [b2cCart.length]);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '85vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748B' }}>
          <button
            onClick={() => {
              window.history.pushState(null, '', '/');
              setActiveTab('home');
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: '#0284C7', cursor: 'pointer', fontWeight: 600 }}
          >
            Home
          </button>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>Checkout Initialization</span>
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.75rem 2rem',
              borderBottom: '1px solid #E2E8F0',
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <ShieldCheck size={24} />
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                Order Initialization & Pre-Flight Review
              </h1>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>
              Verifying real-time inventory availability, statutory GST breakup, and secure payment session.
            </p>
          </div>

          <div style={{ padding: '2rem' }}>
            {protocolStatus && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '10px',
                  color: '#15803D',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Sparkles size={16} />
                <span>{protocolStatus}</span>
              </div>
            )}

            {b2cCart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                <ShoppingCart size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.5rem' }}>
                  Your Cart is Empty
                </h3>
                <p style={{ color: '#64748B', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                  Please add items to your cart before initializing the checkout transaction.
                </p>
                <button
                  onClick={() => {
                    window.history.pushState(null, '', '/search');
                    setActiveTab('search');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '10px',
                    background: '#0284C7',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A', marginBottom: '1rem' }}>
                  Items Ready for Checkout ({b2cCart.length})
                </h3>

                <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  {b2cCart.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const unitPrice = prod?.b2cPrice || 0;
                    return (
                      <div
                        key={item.productId}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 0',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0F172A', display: 'block' }}>
                            {prod?.name || 'AgroPrint Sustainable Paper'}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Quantity: {item.quantity} unit(s) • ₹{unitPrice.toLocaleString('en-IN')} each
                          </span>
                        </div>
                        <strong style={{ fontSize: '1rem', color: '#0F172A' }}>
                          ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                        </strong>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.25rem', border: '1px solid #E2E8F0', marginBottom: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                    <span>Taxable Subtotal:</span>
                    <span>₹{calculations.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748B' }}>
                    <span>GST (18%):</span>
                    <span>₹{calculations.totalGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#15803D', fontWeight: 600 }}>
                    <span>Pan-India Delivery:</span>
                    <span>FREE</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '0.75rem',
                      borderTop: '2px solid #E2E8F0',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      color: '#0F172A',
                    }}
                  >
                    <span>Grand Total:</span>
                    <span>₹{calculations.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Proceed Button */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (!b2cUser) {
                        openAuthModal();
                      } else {
                        setActiveTab('checkout');
                      }
                    }}
                    style={{
                      flex: '1 1 200px',
                      padding: '0.85rem 1.75rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '1rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                    }}
                  >
                    <span>Proceed to Secure Checkout</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => {
                      window.history.pushState(null, '', '/cart');
                      setActiveTab('cart');
                    }}
                    style={{
                      padding: '0.85rem 1.5rem',
                      borderRadius: '10px',
                      background: '#F1F5F9',
                      color: '#475569',
                      border: '1px solid #CBD5E1',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Review Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

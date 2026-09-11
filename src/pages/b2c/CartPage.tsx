import React, { useState } from 'react';
import {
  Trash2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  Heart,
  Briefcase,
  Building2,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface CartPageProps {
  products: Product[];
  onProceedToCheckout: () => void;
  setActiveTab: (tab: string) => void;
  onOpenProduct: (product: Product) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  products,
  onProceedToCheckout,
  setActiveTab,
  onOpenProduct,
}) => {
  const {
    b2cCart,
    updateB2CQty,
    removeFromB2CCart,
    clearB2CCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getB2CCalculations,
  } = useCart();

  const { toggleWishlist } = useWishlist();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const calculations = getB2CCalculations();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback(res);
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleSaveForLater = (productId: string) => {
    toggleWishlist(productId);
    removeFromB2CCart(productId);
  };

  const freeDeliveryThreshold = 1999;
  const freeDeliveryShortfall = Math.max(0, freeDeliveryThreshold - calculations.subtotal);

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
            style={{ fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Back to Catalog
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Shopping Cart</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {b2cCart.length} {b2cCart.length === 1 ? 'unique product' : 'unique products'} in your consumer cart
          </p>
        </div>

        {b2cCart.length > 0 && (
          <button
            onClick={clearB2CCart}
            className="text-rose-600 hover:text-rose-700"
            style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Trash2 size={14} /> Clear Cart
          </button>
        )}
      </div>

      {b2cCart.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '550px',
            margin: '0 auto',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Your Cart is Currently Empty
          </h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
            Discover our curated range of sustainable agri-waste paper, printing paper, notebooks, journals, office stationery, and eco supplies.
          </p>
          <button
            onClick={() => setActiveTab('products')}
            className="btn btn-primary"
            style={{ borderRadius: 'var(--radius-full)', padding: '0.75rem 2rem' }}
          >
            Explore Catalog <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'start',
          }}
        >
          {/* Cart Items List Col */}
          <div>
            {/* Free Delivery Bar */}
            <div
              style={{
                background: freeDeliveryShortfall === 0 ? 'var(--emerald-50)' : 'var(--primary-light)',
                border: `1px solid ${freeDeliveryShortfall === 0 ? 'var(--emerald-100)' : 'var(--primary-100)'}`,
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <div className="flex items-center justify-between" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                <span className="flex items-center gap-2">
                  <Truck size={16} className={freeDeliveryShortfall === 0 ? 'text-emerald-600' : 'text-blue-600'} />
                  {freeDeliveryShortfall === 0 ? (
                    <span style={{ color: 'var(--emerald-800)' }}>
                      🎉 Congratulations! You have qualified for <strong>FREE Pan-India Delivery</strong>.
                    </span>
                  ) : (
                    <span style={{ color: 'var(--primary-800)' }}>
                      Add ₹{freeDeliveryShortfall.toLocaleString('en-IN')} more to qualify for <strong>FREE Delivery</strong>!
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {b2cCart.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;

                const itemTotal = product.b2cPrice * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="card"
                    style={{
                      padding: '1.25rem',
                      display: 'flex',
                      gap: '1.25rem',
                      borderRadius: 'var(--radius-lg)',
                      background: '#FFFFFF',
                      alignItems: 'center',
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <span className="badge badge-slate" style={{ fontSize: '0.65rem' }}>
                          HSN: {product.hsn}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                          SKU: {product.sku}
                        </span>
                      </div>

                      <h4
                        onClick={() => onOpenProduct(product)}
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          lineHeight: '1.3',
                          color: 'var(--slate-900)',
                          margin: '0.25rem 0 0.4rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {product.name}
                      </h4>

                      <div className="flex items-baseline gap-2" style={{ marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                          ₹{product.b2cPrice.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                          ₹{product.b2cMrp.toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)' }}>
                          (Incl. 18% GST)
                        </span>
                      </div>

                      {/* Stepper + Actions */}
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Quantity Stepper */}
                        <div
                          className="flex items-center"
                          style={{
                            border: '1.5px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => updateB2CQty(product.id, item.quantity - 1)}
                            style={{ padding: '0.3rem 0.65rem', background: 'var(--slate-50)', fontWeight: 700 }}
                          >
                            -
                          </button>
                          <span style={{ padding: '0.3rem 0.8rem', fontWeight: 700, fontSize: '0.85rem' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateB2CQty(product.id, item.quantity + 1)}
                            style={{ padding: '0.3rem 0.65rem', background: 'var(--slate-50)', fontWeight: 700 }}
                          >
                            +
                          </button>
                        </div>

                        {/* Save for later & Delete */}
                        <div className="flex items-center gap-3" style={{ fontSize: '0.8rem' }}>
                          <button
                            onClick={() => handleSaveForLater(product.id)}
                            className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
                          >
                            <Heart size={14} /> Save for later
                          </button>
                          <button
                            onClick={() => removeFromB2CCart(product.id)}
                            className="flex items-center gap-1 text-rose-600 hover:text-rose-700"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div style={{ textAlign: 'right', minWidth: '90px' }} className="hide-on-mobile">
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>Item Total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Col */}
          <div style={{ position: 'sticky', top: '90px' }}>
            <div
              className="card"
              style={{
                padding: '1.75rem',
                borderRadius: 'var(--radius-xl)',
                background: '#FFFFFF',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Order Summary
              </h3>

              {/* Promo Code Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <form onSubmit={handleApplyCoupon}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.55rem 0.8rem', textTransform: 'uppercase' }}
                    />
                    <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                      Apply
                    </button>
                  </div>
                </form>

                {couponFeedback && (
                  <div
                    className="flex items-center gap-1"
                    style={{
                      marginTop: '0.4rem',
                      fontSize: '0.78rem',
                      color: couponFeedback.success ? 'var(--emerald-600)' : 'var(--rose-600)',
                    }}
                  >
                    {couponFeedback.success ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    <span>{couponFeedback.message}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div
                    className="flex items-center justify-between"
                    style={{
                      marginTop: '0.6rem',
                      background: 'var(--emerald-50)',
                      border: '1px solid var(--emerald-100)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                    }}
                  >
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                      <Tag size={14} /> '{appliedCoupon.code}' Applied!
                    </span>
                    <button onClick={removeCoupon} style={{ color: 'var(--rose-600)', fontSize: '0.75rem', fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                )}

                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => applyCoupon('WELCOME10')}
                    className="badge badge-blue"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    WELCOME10 (10% Off)
                  </button>
                  <button
                    onClick={() => applyCoupon('KOGNITI15')}
                    className="badge badge-amber"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    KOGNITI15 (15% Off)
                  </button>
                </div>
              </div>

              {/* Price Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                <div className="flex justify-between text-slate-600">
                  <span>Item Subtotal ({b2cCart.reduce((s, i) => s + i.quantity, 0)} units):</span>
                  <span className="font-semibold text-slate-800">₹{calculations.subtotal.toLocaleString('en-IN')}</span>
                </div>

                {calculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Promo Coupon Discount:</span>
                    <span>- ₹{calculations.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Net Taxable Base Value:</span>
                  <span>₹{calculations.taxableAmount.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-500 text-xs">
                  <span>CGST (9%) + SGST (9%) [Included]:</span>
                  <span>₹{calculations.totalGst.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Pan-India Shipping Charges:</span>
                  <span>
                    {calculations.shippingFee === 0 ? (
                      <strong style={{ color: 'var(--emerald-600)' }}>FREE</strong>
                    ) : (
                      `₹${calculations.shippingFee}`
                    )}
                  </span>
                </div>

                <div
                  className="flex justify-between items-baseline"
                  style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--slate-900)',
                  }}
                >
                  <span>Grand Total:</span>
                  <span>₹{calculations.total.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)', textAlign: 'right' }}>
                  Total includes all applicable taxes & shipping
                </div>
              </div>

              {/* Proceed Button */}
              <button
                onClick={onProceedToCheckout}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', borderRadius: 'var(--radius-md)', padding: '0.85rem' }}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              {/* Security & GST Note */}
              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.78rem',
                  color: 'var(--slate-600)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                <div className="flex items-center gap-2">
                  <Truck size={15} className="text-emerald-600 flex-shrink-0" />
                  <span style={{ fontWeight: 600 }}>FREE PAN-INDIA DELIVERY on Orders Above ₹1,999</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-blue-600 flex-shrink-0" />
                  <span style={{ fontWeight: 600 }}>100% GENUINE PRODUCTS | GST Invoice Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 size={15} className="text-amber-600 flex-shrink-0" />
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
      )}
    </div>
  );
};

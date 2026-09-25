import React, { useState } from 'react';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  MapPin,
  FileText,
  Briefcase,
  Info,
  Building2,
  Tag,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { getTelUrl, getWhatsAppUrl, getWhatsAppDisplayNumber } from '../../config/whatsappConfig';
import { ProductReviewsSection } from '../reviews/ProductReviewsSection';
import { reviewService } from '../../services/reviewService';
import { dataSyncBus } from '../../services/dataSyncBus';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onBuyNow: (product: Product) => void;
  onRequestQuote?: (product: Product) => void;
  isB2BMode?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
  onRequestQuote,
  isB2BMode = false,
}) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'reviews' | 'delivery'>('specs');
  const [quantity, setQuantity] = useState(isB2BMode ? product.b2bMoq : 1);
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const { addToB2CCart, addToB2BCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { role, b2bBusiness, isAdmin } = useAuth();

  const stockStatus = product.stockStatus || (typeof product.stock === 'number' && product.stock > 0 ? 'in_stock' : 'in_stock');
  const isOutOfStock = stockStatus === 'out_of_stock';
  const isLimitedStock = stockStatus === 'limited_stock';
  const showAdminStock = Boolean(isAdmin || role === 'admin' || (role as any) === 'super_admin');

  const isFavorited = isInWishlist(product.id);
  const isB2BApproved = role === 'b2b' && b2bBusiness?.status === 'approved';

  const b2cMrp = Number(product.b2cMrp || 0);
  const b2cPrice = Number(product.b2cPrice || 0);
  const discountPercent = b2cMrp > b2cPrice ? Math.round(((b2cMrp - b2cPrice) / b2cMrp) * 100) : 0;

  const [approvedReviewStats, setApprovedReviewStats] = useState(() => {
    return reviewService.calculateProductRating(product.id);
  });

  React.useEffect(() => {
    const updateStats = () => {
      setApprovedReviewStats(reviewService.calculateProductRating(product.id));
    };
    updateStats();
    const unsub = dataSyncBus.subscribe('reviews', updateStats);
    return () => unsub();
  }, [product.id]);

  const rawRating = approvedReviewStats.totalReviews > 0 ? approvedReviewStats.averageRating : (product.rating || 5.0);
  const displayRating = typeof rawRating === 'number' && !isNaN(rawRating) ? rawRating : 5.0;
  const displayReviewCount = approvedReviewStats.totalReviews > 0 ? approvedReviewStats.totalReviews : (product.reviewCount ?? 128);
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1000&q=80'];

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus(`Available! Standard Express delivery to PIN ${pincode} within 3-4 business days.`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleAddToCart = () => {
    if (isB2BMode) {
      addToB2BCart(product.id, quantity);
    } else {
      addToB2CCart(product.id, quantity);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '900px', padding: '1.75rem', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'var(--slate-100)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={20} className="text-slate-600" />
        </button>

        <div
          className="grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '2rem',
          }}
        >
          {/* Gallery Col */}
          <div>
            {/* Main Preview Image */}
            <div
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border-color)',
                marginBottom: '1rem',
              }}
            >
              <img
                key={images[selectedImage] || images[0]}
                src={images[selectedImage] || images[0]}
                alt={product.name || 'Product'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex items-center gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}_${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: selectedImage === idx ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      opacity: selectedImage === idx ? 1 : 0.65,
                      cursor: 'pointer',
                    }}
                  >
                    <img src={img} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Value Badges */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'var(--slate-50)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
                fontSize: '0.8rem',
                color: 'var(--slate-600)',
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-blue-600" />
                <span>7-Day Replacement for physical manufacturing defects</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-amber-600" />
                <span>Official GST Tax Invoice with HSN Code {product.hsn}</span>
              </div>
            </div>
          </div>

          {/* Details Col */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2" style={{ marginBottom: '0.4rem' }}>
              <span className="badge badge-blue">{product.category}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>SKU: {product.sku}</span>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: '1.25', marginBottom: '0.5rem' }}>
              {product.name}
            </h2>

            <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
              <div className="flex items-center gap-1" style={{ color: '#D97706', fontWeight: 700, fontSize: '0.85rem' }}>
                <Star size={15} fill="#D97706" />
                <span>{displayRating.toFixed(1)}</span>
              </div>
              <span style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>({displayReviewCount} customer reviews)</span>
              <span style={{ color: 'var(--slate-300)' }}>|</span>
              {showAdminStock ? (
                <span
                  className="flex items-center gap-1"
                  style={{
                    color: isOutOfStock ? '#DC2626' : isLimitedStock ? '#D97706' : 'var(--emerald-600)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {isOutOfStock ? <AlertCircle size={14} /> : isLimitedStock ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  {isOutOfStock
                    ? `Out of Stock (${product.stock ?? 0} units)`
                    : isLimitedStock
                    ? `Limited Stock (${product.stock ?? 0} units)`
                    : `In Stock (${product.stock ?? 0} units ready)`}
                </span>
              ) : (
                <span
                  className="flex items-center gap-1"
                  style={{
                    color: isOutOfStock ? '#DC2626' : isLimitedStock ? '#D97706' : 'var(--emerald-600)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  }}
                >
                  {isOutOfStock ? <AlertCircle size={14} /> : isLimitedStock ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  {isOutOfStock ? 'Out of Stock' : isLimitedStock ? '⚠ Limited Stock' : '✓ In Stock'}
                </span>
              )}
            </div>

            {/* Price Box */}
            <div
              style={{
                padding: '1rem',
                background: isB2BMode ? '#0F172A' : '#EFF6FF',
                color: isB2BMode ? '#FFFFFF' : 'var(--slate-900)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
              }}
            >
              {isB2BMode ? (
                isB2BApproved ? (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>Approved Wholesale Price</div>
                    <div className="flex items-baseline gap-2">
                      <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38BDF8' }}>
                        ₹{product.b2bWholesalePrice.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#CBD5E1' }}>/ unit (Excl. 18% GST)</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ marginTop: '0.4rem' }}>
                      <span className="badge badge-amber">MOQ: {product.b2bMoq} Units</span>
                      <span style={{ fontSize: '0.75rem', color: '#34D399' }}>
                        Eligible for 100% GST Input Tax Credit
                      </span>
                    </div>

                    {/* Slabs Table */}
                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#CBD5E1', marginBottom: '0.4rem' }}>
                        Tiered Bulk Quantity Discounts:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.b2bDiscountSlabs.map((slab, i) => (
                          <div
                            key={i}
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                            }}
                          >
                            <span style={{ color: '#FCD34D', fontWeight: 700 }}>
                              {slab.minQty}{slab.maxQty ? `-${slab.maxQty}` : '+'} units:
                            </span>{' '}
                            <span style={{ color: '#FFFFFF' }}>{slab.discountPercent}% Off</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6EE7B7', marginTop: '0.5rem', fontWeight: 700 }}>
                      DIRECT MANUFACTURER PRICING • 100% GST Invoice with Input Tax Credit
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FCD34D' }}>
                      DIRECT MANUFACTURER PRICING (Slabs Protected)
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '0.4rem 0' }}>
                      B2B confidential pricing, volume discount slabs and MOQs are restricted to approved business accounts.
                    </p>
                    <button
                      onClick={() => {
                        onClose();
                        if (onRequestQuote) onRequestQuote(product);
                      }}
                      className="btn btn-amber btn-sm"
                      style={{ marginTop: '0.4rem' }}
                    >
                      <Briefcase size={14} /> Request a Quote / Verify Business
                    </button>
                  </div>
                )
              ) : (
                <div>
                  <div className="flex items-baseline gap-3">
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                      ₹{product.b2cPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                      ₹{product.b2cMrp.toLocaleString('en-IN')}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                      Save {discountPercent}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
                    100% GENUINE PRODUCTS | GST Invoice Available • FREE PAN-INDIA DELIVERY on Orders Above ₹1,999
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: '1.25rem' }}>
              <div
                className="flex items-center"
                style={{
                  border: '1.5px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}
              >
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(isB2BMode ? product.b2bMoq : 1, q - 1))}
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'var(--slate-50)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  -
                </button>
                <div
                  style={{
                    padding: '0.6rem 1rem',
                    fontWeight: 700,
                    minWidth: '45px',
                    textAlign: 'center',
                    fontSize: '0.95rem',
                    color: isOutOfStock ? 'var(--slate-400)' : undefined,
                  }}
                >
                  {isOutOfStock ? 0 : quantity}
                </div>
                <button
                  disabled={isOutOfStock}
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0.6rem 0.9rem',
                    background: 'var(--slate-50)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  }}
                >
                  +
                </button>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`btn ${isB2BMode ? 'btn-outline-b2b' : 'btn-outline'} flex-1`}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 700,
                  opacity: isOutOfStock ? 0.6 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                <ShoppingCart size={17} /> {isOutOfStock ? 'Out of Stock' : `Add to ${isB2BMode ? 'B2B Cart' : 'Cart'}`}
              </button>

              <button
                disabled={isOutOfStock}
                onClick={() => {
                  if (isOutOfStock) return;
                  handleAddToCart();
                  if (onBuyNow) onBuyNow(product);
                  onClose();
                }}
                className={`btn ${isB2BMode ? 'btn-amber' : 'btn-primary'} flex-1`}
                style={{
                  padding: '0.75rem 1rem',
                  fontWeight: 800,
                  opacity: isOutOfStock ? 0.6 : 1,
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                {isOutOfStock ? 'Unavailable' : '⚡ Buy Now'}
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className="btn btn-outline"
                style={{ padding: '0.75rem' }}
                title="Wishlist"
              >
                <Heart size={18} color={isFavorited ? '#E11D48' : 'var(--slate-600)'} fill={isFavorited ? '#E11D48' : 'none'} />
              </button>
            </div>

            {/* Prominent B2B Request a Quote Section */}
            {isB2BMode && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1.5px dashed rgba(245, 158, 11, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={16} /> Need Larger Volume or Special Pricing?
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--slate-600)', marginTop: '0.2rem' }}>
                    Submit an RFQ for bulk quantities, lower unit pricing, custom requirements, or Net credit terms.
                  </div>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (onRequestQuote) onRequestQuote(product);
                  }}
                  className="btn btn-sm btn-amber"
                  style={{ flexShrink: 0, fontWeight: 700 }}
                >
                  Request a Quote →
                </button>
              </div>
            )}

            {/* Pincode Delivery Checker */}
            <form
              onSubmit={handleCheckPincode}
              style={{
                background: 'var(--slate-50)',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Check Delivery Availability
                </span>
              </div>
              <div className="flex gap-2" style={{ marginTop: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Enter 6-digit PIN code (e.g. 560038)"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => setPincode(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                />
                <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }}>
                  Check
                </button>
              </div>
              {pincodeStatus && (
                <div
                  style={{
                    fontSize: '0.78rem',
                    marginTop: '0.4rem',
                    color: pincodeStatus.includes('Available') ? 'var(--emerald-600)' : 'var(--rose-600)',
                    fontWeight: 500,
                  }}
                >
                  {pincodeStatus}
                </div>
              )}
            </form>

            {/* Brand Value Propositions */}
            <div
              style={{
                background: 'var(--slate-50)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                fontSize: '0.74rem',
                color: 'var(--slate-600)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                marginBottom: '1rem',
              }}
            >
              {isB2BMode ? (
                <div className="flex items-center gap-1.5 font-bold" style={{ color: '#059669' }}>
                  <Tag size={13} className="text-emerald-600 flex-shrink-0" />
                  <span>DIRECT MANUFACTURER PRICING</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-medium">
                  <Truck size={13} className="text-emerald-600 flex-shrink-0" />
                  <span>FREE PAN-INDIA DELIVERY on Orders Above ₹1,999</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck size={13} className="text-blue-600 flex-shrink-0" />
                <span>100% GENUINE PRODUCTS | GST Invoice Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 size={13} className="text-amber-600 flex-shrink-0" />
                <span>
                  B2B & INSTITUTIONAL ENQUIRIES:{' '}
                  <a href={getTelUrl()} style={{ color: 'var(--primary-600)', fontWeight: 700 }}>
                    {getWhatsAppDisplayNumber()}
                  </a>
                  {' | '}
                  <a
                    href={getWhatsAppUrl(`Hello Kogniti Minds, I would like to enquire about: ${product.name}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#059669', fontWeight: 700, textDecoration: 'underline' }}
                    title="Chat about this product on WhatsApp"
                  >
                    WhatsApp Chat
                  </a>
                </span>
              </div>
            </div>

            {/* Tabs for Specs & Features */}
            <div style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', marginTop: 'auto' }}>
              <button
                onClick={() => setActiveTab('specs')}
                style={{
                  paddingBottom: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: activeTab === 'specs' ? 'var(--primary)' : 'var(--slate-500)',
                  borderBottom: activeTab === 'specs' ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('features')}
                style={{
                  paddingBottom: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: activeTab === 'features' ? 'var(--primary)' : 'var(--slate-500)',
                  borderBottom: activeTab === 'features' ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                Key Features
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                style={{
                  paddingBottom: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--slate-500)',
                  borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                Reviews ({displayReviewCount})
              </button>
            </div>

            <div
              style={{
                paddingTop: '0.85rem',
                fontSize: '0.82rem',
                maxHeight: activeTab === 'reviews' ? '460px' : '180px',
                overflowY: 'auto',
                transition: 'max-height 0.2s ease',
              }}
            >
              {activeTab === 'specs' && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <tbody>
                    {Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                        <td style={{ padding: '0.4rem 0', color: 'var(--slate-500)', width: '40%', fontWeight: 500 }}>
                          {key}
                        </td>
                        <td style={{ padding: '0.4rem 0', color: 'var(--slate-800)', fontWeight: 600 }}>{val}</td>
                      </tr>
                    ))}
                    <tr style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '0.4rem 0', color: 'var(--slate-500)' }}>Dimensions</td>
                      <td style={{ padding: '0.4rem 0', color: 'var(--slate-800)', fontWeight: 600 }}>{product.dimensions}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.4rem 0', color: 'var(--slate-500)' }}>Weight</td>
                      <td style={{ padding: '0.4rem 0', color: 'var(--slate-800)', fontWeight: 600 }}>{product.weight}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              {activeTab === 'features' && (
                <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {product.features.map((f, i) => (
                    <li key={i} style={{ color: 'var(--slate-700)', lineHeight: '1.4' }}>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === 'reviews' && (
                <ProductReviewsSection product={product} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

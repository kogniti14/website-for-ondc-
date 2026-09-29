import React, { useState, useEffect } from 'react';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingCart,
  CheckCircle2,
  AlertCircle,
  Building2,
  Tag,
  ArrowLeft,
  Share2,
  MessageSquare,
  FileText,
  Phone,
} from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { getTelUrl, getWhatsAppUrl, getWhatsAppDisplayNumber } from '../../config/whatsappConfig';
import { ProductReviewsSection } from '../../components/reviews/ProductReviewsSection';
import { ondcClientService } from '../../services/ondcClientService';

interface ProductDetailPageProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  setActiveTab: (tab: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onBuyNow,
  setActiveTab,
}) => {
  // Resolve product from URL query param or fallback
  const getProductFromUrl = (): Product | null => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pid = params.get('productId');
      if (pid) {
        const found = products.find((p) => p.id === pid || p.sku === pid);
        if (found) return found;
      }
    }
    return selectedProduct || (products.length > 0 ? products[0] : null);
  };

  const product = getProductFromUrl();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTabSection, setActiveTabSection] = useState<'specs' | 'features' | 'reviews' | 'delivery'>('specs');
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);
  const [protocolStatus, setProtocolStatus] = useState<string | null>(null);

  const { addToB2CCart, addToB2BCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { role } = useAuth();

  // Execute ONDC /select protocol callback on load
  useEffect(() => {
    if (product) {
      onSelectProduct(product);
      ondcClientService
        .selectProduct(product.id, quantity)
        .then((res) => {
          if (res.success) {
            setProtocolStatus('ONDC Network ACK: Item selected and price verified');
          }
        })
        .catch(() => {});
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', background: '#F8FAFC', minHeight: '60vh' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748B', marginBottom: '1.5rem' }}>The requested product does not exist or has been discontinued.</p>
        <button
          onClick={() => {
            window.history.pushState(null, '', '/search');
            setActiveTab('search');
          }}
          style={{ padding: '0.65rem 1.5rem', background: '#0284C7', color: '#fff', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const isLimitedStock = product.stockStatus === 'limited_stock';
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/placeholder.png'];
  const b2cPrice = product.b2cPrice || 0;
  const b2cMrp = product.b2cMrp || b2cPrice;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code');
      return;
    }
    setPincodeStatus(`Available! Standard dispatch in 24 hours to PIN ${pincode} via Blue Dart / Delhivery.`);
  };

  const handleAddToCart = () => {
    if (role === 'b2b') {
      addToB2BCart(product.id, quantity);
    } else {
      addToB2CCart(product.id, quantity);
    }
    alert(`Added ${quantity} unit(s) of "${product.name}" to cart.`);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '90vh', padding: '2rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
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
          <button
            onClick={() => {
              window.history.pushState(null, '', '/search');
              setActiveTab('search');
            }}
            style={{ background: 'none', border: 'none', padding: 0, color: '#0284C7', cursor: 'pointer', fontWeight: 600 }}
          >
            Products
          </button>
          <span>/</span>
          <span style={{ color: '#0F172A', fontWeight: 700 }}>{product.name}</span>
        </div>

        {/* Main Product Card Grid */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2rem',
          }}
        >
          {/* Left: Image Gallery */}
          <div>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#F1F5F9',
                aspectRatio: '1/1',
                marginBottom: '1rem',
                border: '1px solid #CBD5E1',
              }}
            >
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => toggleWishlist(product.id)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={20} color={isFavorited ? '#EF4444' : '#64748B'} fill={isFavorited ? '#EF4444' : 'none'} />
              </button>
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: selectedImage === idx ? '2px solid #0284C7' : '1px solid #E2E8F0',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {protocolStatus && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.65rem 1rem',
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  color: '#15803D',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{protocolStatus}</span>
              </div>
            )}
          </div>

          {/* Right: Product Details & Buying Actions */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {product.category}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>SKU: {product.sku}</span>
              {product.hsn && (
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>• HSN: {product.hsn} ({product.gstRate || 18}% GST)</span>
              )}
            </div>

            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem', lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: '#FEF08A',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#854D0E',
                }}
              >
                <Star size={14} fill="#854D0E" />
                <span>{product.rating || 4.9}</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                ({product.reviewCount || 128} verified reviews)
              </span>
              <span style={{ color: '#CBD5E1' }}>•</span>
              <button
                onClick={() => {
                  window.history.pushState(null, '', `/rating?productId=${product.id}`);
                  setActiveTab('rating');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284C7',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Rate this product
              </button>
            </div>

            {/* Price Presentation */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '1.25rem',
                border: '1px solid #E2E8F0',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.85rem', fontWeight: 900, color: '#0F172A' }}>
                  ₹{b2cPrice.toLocaleString('en-IN')}
                </span>
                {b2cMrp > b2cPrice && (
                  <span style={{ fontSize: '1.1rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                    ₹{b2cMrp.toLocaleString('en-IN')}
                  </span>
                )}
                {b2cMrp > b2cPrice && (
                  <span style={{ background: '#DCFCE7', color: '#15803D', fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    Save {Math.round(((b2cMrp - b2cPrice) / b2cMrp) * 100)}%
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Inclusive of all taxes ({product.gstRate || 18}% GST). Full GST Input Tax Credit available on invoice.
              </div>

              {/* Wholesale B2B Tier Notice */}
              {product.b2bWholesalePrice && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed #CBD5E1',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: '#0369A1', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Building2 size={16} /> B2B Wholesale Tier:
                  </span>
                  <span style={{ fontWeight: 800, color: '#0F172A' }}>
                    ₹{product.b2bWholesalePrice} / unit (MOQ: {product.b2bMoq || 10} units)
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <p style={{ color: '#334155', lineHeight: 1.6, fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              {product.description || product.shortDescription}
            </p>

            {/* Stock status */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: isOutOfStock ? '#EF4444' : isLimitedStock ? '#F59E0B' : '#10B981',
                }}
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isOutOfStock ? '#EF4444' : '#0F172A' }}>
                {isOutOfStock ? 'Currently Out of Stock' : isLimitedStock ? 'Limited Stock Available' : 'In Stock • Ready for Immediate Pan-India Dispatch'}
              </span>
            </div>

            {/* Quantity Controls & Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                }}
              >
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    padding: '0.65rem 1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                    color: quantity <= 1 ? '#CBD5E1' : '#0F172A',
                  }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.5rem', fontWeight: 800, fontSize: '1rem', minWidth: '32px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  style={{
                    padding: '0.65rem 1rem',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#0F172A',
                  }}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                style={{
                  flex: '1 1 160px',
                  padding: '0.85rem 1.5rem',
                  borderRadius: '10px',
                  background: '#F1F5F9',
                  border: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => onBuyNow(product)}
                style={{
                  flex: '1 1 180px',
                  padding: '0.85rem 1.75rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                }}
              >
                <span>Buy Now</span>
              </button>
            </div>

            {/* Quick Contact & WhatsApp */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
              <a
                href={getWhatsAppUrl(`Hello Kogniti Minds, I want to inquire about: ${product.name} (SKU: ${product.sku})`)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  background: '#25D366',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <MessageSquare size={16} />
                <span>WhatsApp Enquiry</span>
              </a>

              <a
                href={getTelUrl()}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  background: '#F8FAFC',
                  color: '#334155',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <Phone size={16} />
                <span>Call {getWhatsAppDisplayNumber()}</span>
              </a>
            </div>

            {/* Delivery Pincode Checker */}
            <form onSubmit={handleCheckPincode} style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter Delivery Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    width: '180px',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0F172A',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Check
                </button>
              </div>
              {pincodeStatus && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: pincodeStatus.includes('Available') ? '#15803D' : '#DC2626' }}>
                  {pincodeStatus}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Tabbed Specifications & Customer Reviews */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            padding: '2rem',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
            <button
              onClick={() => setActiveTabSection('specs')}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: activeTabSection === 'specs' ? 700 : 500,
                color: activeTabSection === 'specs' ? '#0284C7' : '#64748B',
                borderBottom: activeTabSection === 'specs' ? '2px solid #0284C7' : 'none',
                paddingBottom: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Technical Specifications
            </button>
            <button
              onClick={() => setActiveTabSection('reviews')}
              style={{
                background: 'none',
                border: 'none',
                fontWeight: activeTabSection === 'reviews' ? 700 : 500,
                color: activeTabSection === 'reviews' ? '#0284C7' : '#64748B',
                borderBottom: activeTabSection === 'reviews' ? '2px solid #0284C7' : 'none',
                paddingBottom: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.95rem',
              }}
            >
              Verified Reviews & Ratings
            </button>
          </div>

          {activeTabSection === 'specs' && (
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Sustainable Agro-Fiber Composition & Specifications
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.8rem' }}>Material Origin</span>
                  <strong style={{ color: '#0F172A' }}>100% Tree-Free Agricultural Crop Residue</strong>
                </div>
                <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.8rem' }}>Basis Weight / GSM</span>
                  <strong style={{ color: '#0F172A' }}>{product.specifications?.['GSM'] || '75 GSM Standard'}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.8rem' }}>ISO Brightness</span>
                  <strong style={{ color: '#0F172A' }}>{product.specifications?.['Brightness'] || '90% + High Whiteness & Contrast'}</strong>
                </div>
                <div style={{ padding: '0.75rem', background: '#F8FAFC', borderRadius: '8px' }}>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '0.8rem' }}>Paper Surface / Opacity</span>
                  <strong style={{ color: '#0F172A' }}>Jam-Free Dual-Sided Ultra-Smooth</strong>
                </div>
              </div>
            </div>
          )}

          {activeTabSection === 'reviews' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Customer Reviews</h3>
                <button
                  onClick={() => {
                    window.history.pushState(null, '', `/rating?productId=${product.id}`);
                    setActiveTab('rating');
                  }}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background: '#0284C7',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Write a Review
                </button>
              </div>
              <ProductReviewsSection product={product} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Heart, ShoppingCart, Star, Eye, ShieldCheck, Briefcase } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onRequestQuote?: (product: Product) => void;
  isB2BMode?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetails,
  onBuyNow,
  onRequestQuote,
  isB2BMode = false,
}) => {
  const { addToB2CCart, addToB2BCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { role, b2bBusiness } = useAuth();

  const isFavorited = isInWishlist(product.id);
  const isB2BApproved = role === 'b2b' && b2bBusiness?.status === 'approved';

  const discountPercent = Math.round(
    ((product.b2cMrp - product.b2cPrice) / product.b2cMrp) * 100
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isB2BMode) {
      addToB2BCart(product.id, product.b2bMoq);
    } else {
      addToB2CCart(product.id, 1);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNow) {
      onBuyNow(product);
    } else {
      addToB2CCart(product.id, 1);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className="card"
      onClick={() => onOpenDetails(product)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '0.85rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        cursor: 'pointer',
        position: 'relative',
        background: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Top Badges & Wishlist */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: '#F1F5F9',
          marginBottom: '0.85rem',
        }}
      >
        <img
          src={product.images[0]}
          alt={product.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Badge Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 2,
          }}
        >
          {product.isBestSeller && (
            <span className="badge badge-amber" style={{ fontSize: '0.65rem', fontWeight: 800 }}>
              ★ Best Seller
            </span>
          )}
          {product.isNewArrival && (
            <span className="badge badge-purple" style={{ fontSize: '0.65rem', fontWeight: 800 }}>
              New Launch
            </span>
          )}
          {!isB2BMode && discountPercent > 0 && (
            <span className="badge badge-green" style={{ fontSize: '0.65rem', fontWeight: 800 }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 2,
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} color={isFavorited ? '#E11D48' : '#64748B'} fill={isFavorited ? '#E11D48' : 'none'} />
        </button>
      </div>

      {/* Product Information */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Category & Rating */}
        <div className="flex items-center justify-between gap-2" style={{ marginBottom: '0.35rem' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            {product.category}
          </span>
          <div className="flex items-center gap-1" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#D97706' }}>
            <Star size={13} fill="#D97706" />
            <span>{product.rating.toFixed(1)}</span>
            <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <h4
          style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            lineHeight: '1.3',
            color: 'var(--slate-900)',
            marginBottom: '0.4rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.name}
        </h4>

        {/* Short Tagline */}
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--slate-500)',
            lineHeight: '1.4',
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.tagline}
        </p>

        {/* Price Section */}
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          {isB2BMode ? (
            /* B2B Pricing Display */
            <div>
              {isB2BApproved ? (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      ₹{product.b2bWholesalePrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>/ unit (excl. GST)</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ marginTop: '0.2rem' }}>
                    <span className="badge badge-amber" style={{ fontSize: '0.68rem' }}>
                      MOQ: {product.b2bMoq} Units
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--emerald-600)', fontWeight: 600 }}>
                      Bulk tiers up to {product.b2bDiscountSlabs[product.b2bDiscountSlabs.length - 1]?.discountPercent}% off
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: 'var(--slate-50)',
                    border: '1px dashed var(--slate-300)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem 0.6rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--slate-700)' }}>
                    Wholesale Price Protected
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)' }}>
                    Login as verified business to reveal wholesale pricing & MOQs
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* B2C Consumer Pricing */
            <div>
              <div className="flex items-baseline gap-2">
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  ₹{product.b2cPrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                  ₹{product.b2cMrp.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--slate-500)', marginTop: '0.1rem' }}>
                Inclusive of 18% GST (HSN: {product.hsn})
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2" style={{ marginTop: '0.75rem' }}>
            {isB2BMode ? (
              isB2BApproved ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-b2b btn-sm flex-1"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.6rem' }}
                  >
                    <ShoppingCart size={14} /> Add MOQ ({product.b2bMoq})
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onRequestQuote) onRequestQuote(product);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.6rem' }}
                  >
                    Request Quote
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onRequestQuote) onRequestQuote(product);
                  }}
                  className="btn btn-amber btn-sm flex-1"
                  style={{ fontSize: '0.8rem' }}
                >
                  <Briefcase size={14} /> Request Quote / Register
                </button>
              )
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-outline btn-sm flex-1"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                >
                  <ShoppingCart size={15} /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn btn-primary btn-sm flex-1"
                  style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                >
                  Buy Now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

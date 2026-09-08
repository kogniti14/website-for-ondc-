import React from 'react';
import { Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

interface WishlistPageProps {
  products: Product[];
  onOpenProduct: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  setActiveTab: (tab: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({
  products,
  onOpenProduct,
  onBuyNow,
  setActiveTab,
}) => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToB2CCart } = useCart();

  const wishlistedProducts = products.filter((p) =>
    wishlist.some((item) => item.productId === p.id)
  );

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
        <div>
          <button
            onClick={() => setActiveTab('products')}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-900"
            style={{ fontSize: '0.82rem', marginBottom: '0.5rem', fontWeight: 600 }}
          >
            <ArrowLeft size={14} /> Continue Shopping
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Your Saved Wishlist</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved for later review
          </p>
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
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
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--rose-50)',
              color: 'var(--rose-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Heart size={32} />
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Your Wishlist is Empty
          </h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1.75rem' }}>
            Explore our curated catalog of ergonomic office chairs, 4K interactive display panels, biometric systems, and accessories.
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
        <div className="product-grid">
          {wishlistedProducts.map((p) => {
            const discountPercent = Math.round(
              ((p.b2cMrp - p.b2cPrice) / p.b2cMrp) * 100
            );

            return (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '1rem',
                  borderRadius: 'var(--radius-lg)',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: '#F1F5F9',
                    marginBottom: '0.85rem',
                    cursor: 'pointer',
                  }}
                  onClick={() => onOpenProduct(p)}
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromWishlist(p.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} className="text-rose-600" />
                  </button>
                </div>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                    {p.category}
                  </span>
                  <h4
                    onClick={() => onOpenProduct(p)}
                    style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      lineHeight: '1.3',
                      color: 'var(--slate-900)',
                      margin: '0.25rem 0 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    {p.name}
                  </h4>

                  <div className="flex items-baseline gap-2" style={{ marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      ₹{p.b2cPrice.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--slate-400)', textDecoration: 'line-through' }}>
                      ₹{p.b2cMrp.toLocaleString('en-IN')}
                    </span>
                    <span className="badge badge-green" style={{ fontSize: '0.65rem' }}>
                      {discountPercent}% OFF
                    </span>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        addToB2CCart(p.id, 1);
                        removeFromWishlist(p.id);
                      }}
                      className="btn btn-outline btn-sm flex-1"
                      style={{ fontSize: '0.8rem' }}
                    >
                      <ShoppingCart size={14} /> Move to Cart
                    </button>
                    <button
                      onClick={() => {
                        onBuyNow(p);
                      }}
                      className="btn btn-primary btn-sm flex-1"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { Home, Package, ShoppingCart, Heart, Briefcase, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
}) => {
  const { b2cCount } = useCart();
  const { wishlist } = useWishlist();
  const { role } = useAuth();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0.4rem 0.5rem',
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
      }}
      className="mobile-bottom-nav"
    >
      <button
        onClick={() => setActiveTab('home')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'home' ? 'var(--primary)' : 'var(--slate-500)',
          fontSize: '0.68rem',
          fontWeight: 600,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <Home size={18} />
        <span>Home</span>
      </button>

      <button
        onClick={() => setActiveTab('products')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'products' ? 'var(--primary)' : 'var(--slate-500)',
          fontSize: '0.68rem',
          fontWeight: 600,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <Package size={18} />
        <span>Products</span>
      </button>

      <button
        onClick={() => setActiveTab('b2b')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'b2b' ? '#D97706' : 'var(--slate-500)',
          fontSize: '0.68rem',
          fontWeight: 700,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <Briefcase size={18} />
        <span>B2B Portal</span>
      </button>

      <button
        onClick={() => setActiveTab('wishlist')}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'wishlist' ? 'var(--primary)' : 'var(--slate-500)',
          fontSize: '0.68rem',
          fontWeight: 600,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <Heart size={18} />
        {wishlist.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '12px',
              background: 'var(--rose-600)',
              color: '#FFF',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              fontSize: '0.6rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {wishlist.length}
          </span>
        )}
        <span>Wishlist</span>
      </button>

      <button
        onClick={() => setActiveTab('cart')}
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'cart' ? 'var(--primary)' : 'var(--slate-500)',
          fontSize: '0.68rem',
          fontWeight: 600,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <ShoppingCart size={18} />
        {b2cCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '8px',
              background: '#F59E0B',
              color: '#0A0F1D',
              borderRadius: '50%',
              width: '14px',
              height: '14px',
              fontSize: '0.6rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {b2cCount}
          </span>
        )}
        <span>Cart</span>
      </button>

      <button
        onClick={() => (role === 'b2c' ? setActiveTab('account') : openAuthModal())}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          color: activeTab === 'account' ? 'var(--primary)' : 'var(--slate-500)',
          fontSize: '0.68rem',
          fontWeight: 600,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <User size={18} />
        <span>{role === 'b2c' ? 'Account' : 'Sign In'}</span>
      </button>
    </nav>
  );
};

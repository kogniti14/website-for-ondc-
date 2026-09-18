import React from 'react';
import { Home, Package, ShoppingCart, Heart, Briefcase, User, FileText, ArrowLeft, Building2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: () => void;
  b2bTab?: string;
  setB2bTab?: (tab: string) => void;
  openB2BAuthModal?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  b2bTab = 'overview',
  setB2bTab,
  openB2BAuthModal,
}) => {
  const { b2cCount, b2bCount } = useCart();
  const { wishlist } = useWishlist();
  const { role, b2bBusiness } = useAuth();

  const isB2B = activeTab === 'b2b';

  if (isB2B) {
    return (
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          backgroundColor: '#0F172A',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0.45rem 0.5rem',
          boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
        }}
        className="mobile-bottom-nav"
      >
        <button
          onClick={() => setB2bTab?.('overview')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: b2bTab === 'overview' ? '#60A5FA' : '#94A3B8',
            fontSize: '0.68rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <Home size={18} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setB2bTab?.('catalog')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: b2bTab === 'catalog' ? '#60A5FA' : '#94A3B8',
            fontSize: '0.68rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <Package size={18} />
          <span>Catalog</span>
        </button>

        <button
          onClick={() => setB2bTab?.('rfq')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: b2bTab === 'rfq' ? '#F59E0B' : '#94A3B8',
            fontSize: '0.68rem',
            fontWeight: 700,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <FileText size={18} />
          <span>RFQ Quote</span>
        </button>

        <button
          onClick={() => setB2bTab?.('cart')}
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: b2bTab === 'cart' ? '#34D399' : '#94A3B8',
            fontSize: '0.68rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <ShoppingCart size={18} />
          {b2bCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '8px',
                background: '#10B981',
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
              {b2bCount}
            </span>
          )}
          <span>B2B Cart</span>
        </button>

        <button
          onClick={() => {
            if (role === 'b2b' && b2bBusiness) {
              setB2bTab?.('dashboard');
            } else if (openB2BAuthModal) {
              openB2BAuthModal();
            }
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: b2bTab === 'dashboard' ? '#60A5FA' : '#94A3B8',
            fontSize: '0.68rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <Building2 size={18} />
          <span>{role === 'b2b' ? 'Dashboard' : 'Login'}</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            color: '#60A5FA',
            fontSize: '0.68rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
          <span>B2C Store</span>
        </button>
      </nav>
    );
  }

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
        padding: '0.45rem 0.5rem',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
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
          color: '#D97706',
          fontSize: '0.68rem',
          fontWeight: 700,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
        }}
      >
        <Briefcase size={18} />
        <span>B2B Deals</span>
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

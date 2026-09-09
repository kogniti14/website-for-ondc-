import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Briefcase,
  ChevronDown,
  Phone,
  Truck,
  ShieldCheck,
  LogOut,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  openAdminAuthModal?: () => void;
  onSearchQuery?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openAdminAuthModal,
  onSearchQuery,
}) => {
  const { role, b2cUser, isAdmin, logout } = useAuth();
  const { b2cCount, getB2CCalculations } = useCart();
  const { wishlist } = useWishlist();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const calculations = getB2CCalculations();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery) {
      onSearchQuery(search);
    }
    setActiveTab('products');
  };

  return (
    <header className="header-sticky">
      {/* Top Announcement Bar */}
      <div className="announcement-bar hide-on-mobile">
        <span className="flex items-center gap-1">
          <Truck size={14} className="text-emerald-400" /> Free Pan-India Delivery on orders above ₹999
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck size={14} className="text-amber-400" /> 100% Genuine Physical Products with GST Billing
        </span>
        <span className="flex items-center gap-1">
          <Phone size={14} className="text-blue-400" /> B2B / Institutional Hotline: +91 80 4912 8800
        </span>
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ padding: '0.75rem 1.25rem' }}>
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('home')}
          >
            <img
              src="/logo.png"
              alt="Kogniti Minds Logo"
              style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
            />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  lineHeight: '1.1',
                  color: 'var(--slate-900)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                KOGNITI MINDS
                <span
                  style={{
                    fontSize: '0.65rem',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  PVT LTD
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--slate-500)',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                Smart Products. Better Value.
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 hide-on-mobile"
            style={{ maxWidth: '460px', margin: '0 1rem' }}
          >
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--slate-400)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search ergonomic chairs, smart panels, PDUs, organizers..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (onSearchQuery) onSearchQuery(e.target.value);
                }}
                className="form-input"
                style={{
                  paddingLeft: '38px',
                  paddingRight: '80px',
                  fontSize: '0.88rem',
                  borderRadius: 'var(--radius-full)',
                  borderColor: 'var(--slate-200)',
                  background: 'var(--slate-50)',
                }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{
                  position: 'absolute',
                  right: '4px',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Nav Items & Actions */}
          <div className="flex items-center gap-3">
            {/* Prominent B2B Portal Switch Button */}
            <button
              onClick={() => setActiveTab('b2b')}
              className="btn btn-b2b btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.45rem 1rem',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                background: 'linear-gradient(135deg, #0A0F1D 0%, #1E293B 100%)',
              }}
            >
              <Briefcase size={16} className="text-amber-400" />
              <div style={{ textAlign: 'left', lineHeight: '1.1' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', color: '#fff' }}>
                  B2B Portal
                </span>
                <span style={{ fontSize: '0.62rem', color: '#94A3B8', textTransform: 'uppercase' }}>
                  Wholesale & RFQ
                </span>
              </div>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => setActiveTab('wishlist')}
              className="btn btn-outline btn-sm hide-on-mobile"
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem',
                width: '40px',
                height: '40px',
              }}
              title="Your Wishlist"
            >
              <Heart size={19} color={wishlist.length > 0 ? '#E11D48' : 'var(--slate-600)'} />
              {wishlist.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    background: 'var(--rose-600)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveTab('cart')}
              className="btn btn-primary btn-sm"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.5rem 1rem',
                gap: '0.6rem',
              }}
            >
              <div style={{ position: 'relative' }}>
                <ShoppingCart size={18} />
                {b2cCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '-8px',
                      background: '#F59E0B',
                      color: '#0A0F1D',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #fff',
                    }}
                  >
                    {b2cCount}
                  </span>
                )}
              </div>
              <span className="hide-on-mobile" style={{ fontSize: '0.85rem' }}>
                {calculations.total > 0
                  ? `₹${calculations.total.toLocaleString('en-IN')}`
                  : 'Cart'}
              </span>
            </button>

            {/* Account / User Menu */}
            <div style={{ position: 'relative' }}>
              {role === 'b2c' && b2cUser ? (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="btn btn-outline btn-sm"
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '0.45rem 0.85rem',
                      gap: '0.4rem',
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {b2cUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className="hide-on-mobile"
                      style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {b2cUser.name}
                    </span>
                    <ChevronDown size={14} />
                  </button>

                  {userDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '115%',
                        width: '210px',
                        background: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 150,
                        padding: '0.5rem 0',
                        animation: 'fadeIn 0.2s ease-out',
                      }}
                    >
                      <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--slate-900)' }}>
                          {b2cUser.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          {b2cUser.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTab('account');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          color: 'var(--slate-700)',
                        }}
                      >
                        <User size={15} /> My Profile & Addresses
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('orders');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          color: 'var(--slate-700)',
                        }}
                      >
                        <Package size={15} /> My Orders & Invoices
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('wishlist');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          color: 'var(--slate-700)',
                        }}
                      >
                        <Heart size={15} /> Wishlist ({wishlist.length})
                      </button>
                      <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.3rem 0' }} />
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.85rem',
                          color: 'var(--rose-600)',
                        }}
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="btn btn-outline btn-sm hide-on-mobile"
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <User size={16} /> Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline btn-sm"
              style={{ display: 'none', padding: '0.45rem' }}
              id="mobile-nav-toggle"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Links */}
        <div
          className="flex items-center justify-between hide-on-mobile"
          style={{
            paddingTop: '0.65rem',
            marginTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}
        >
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('home')}
              style={{
                color: activeTab === 'home' ? 'var(--primary)' : 'var(--slate-700)',
                borderBottom: activeTab === 'home' ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('products')}
              style={{
                color: activeTab === 'products' ? 'var(--primary)' : 'var(--slate-700)',
                borderBottom: activeTab === 'products' ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              style={{
                color: activeTab === 'shop' ? 'var(--primary)' : 'var(--slate-700)',
                borderBottom: activeTab === 'shop' ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '0.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              Shop Now <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Deals</span>
            </button>
            <button
              onClick={() => setActiveTab('b2b')}
              style={{
                color: 'var(--slate-900)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Briefcase size={14} className="text-blue-600" /> B2B Deals & Wholesale
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                color: activeTab === 'orders' ? 'var(--primary)' : 'var(--slate-700)',
                borderBottom: activeTab === 'orders' ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '0.3rem',
              }}
            >
              Track Orders
            </button>
          </div>

          <div className="flex items-center gap-4 text-slate-500" style={{ fontSize: '0.8rem' }}>
            <span>GST Input Credit for Businesses</span>
            <span style={{ color: 'var(--slate-300)' }}>|</span>
            <button
              onClick={() => {
                if (isAdmin) {
                  setActiveTab('admin');
                } else if (openAdminAuthModal) {
                  openAdminAuthModal();
                } else {
                  setActiveTab('admin');
                }
              }}
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1"
              style={{ fontWeight: 600, fontSize: '0.78rem' }}
            >
              <ShieldCheck size={13} className="text-purple-600" /> Admin Portal
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid var(--border-color)',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (onSearchQuery) onSearchQuery(e.target.value);
              }}
              className="form-input"
              style={{ fontSize: '0.9rem' }}
            />
          </form>

          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            Home
          </button>
          <button
            onClick={() => {
              setActiveTab('products');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            All Products
          </button>
          <button
            onClick={() => {
              setActiveTab('shop');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            Shop Now
          </button>
          <button
            onClick={() => {
              setActiveTab('b2b');
              setMobileMenuOpen(false);
            }}
            className="btn btn-b2b"
            style={{ justifyContent: 'flex-start' }}
          >
            <Briefcase size={16} className="text-amber-400" /> B2B Business Portal
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <Package size={16} /> My Orders
          </button>
          <button
            onClick={() => {
              setActiveTab('wishlist');
              setMobileMenuOpen(false);
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start' }}
          >
            <Heart size={16} /> Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (isAdmin) {
                setActiveTab('admin');
              } else if (openAdminAuthModal) {
                openAdminAuthModal();
              } else {
                setActiveTab('admin');
              }
            }}
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', color: '#9333EA', borderColor: 'rgba(147, 51, 234, 0.3)' }}
          >
            <ShieldCheck size={16} /> Admin Portal & Staff Access
          </button>

          {role === 'b2c' ? (
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="btn btn-outline"
              style={{ color: 'var(--rose-600)', justifyContent: 'flex-start' }}
            >
              <LogOut size={16} /> Sign Out ({b2cUser?.name})
            </button>
          ) : (
            <button
              onClick={() => {
                openAuthModal('login');
                setMobileMenuOpen(false);
              }}
              className="btn btn-primary"
            >
              Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};

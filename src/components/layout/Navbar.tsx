import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Sparkles,
  ShieldCheck,
  Building2,
  Truck,
  Briefcase,
  Headphones,
  Receipt,
  Shield,
  Layers,
  ShoppingBag,
  BookOpen,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { storageService } from '../../services/storageService';
import { dataSyncBus } from '../../services/dataSyncBus';
import { SiteMedia } from '../../types';
import { ondcClientService } from '../../services/ondcClientService';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  openAdminAuthModal?: () => void;
  onSearchQuery?: (q: string) => void;
  onNavigateToShop?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAuthModal,
  openAdminAuthModal,
  onSearchQuery,
  onNavigateToShop,
}) => {
  const { role, b2cUser, isAdmin, logout } = useAuth();
  const { b2cCount, getB2CCalculations } = useCart();
  const { wishlist } = useWishlist();
  const [search, setSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [siteMedia, setSiteMedia] = useState<SiteMedia>(() => storageService.getSiteMedia());
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = dataSyncBus.subscribe('site_media', (m) => {
      if (m) setSiteMedia(m);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  const calculations = getB2CCalculations();

  const handleNavClick = (tab: string, path: string) => {
    if (tab === 'shop' && onNavigateToShop) {
      onNavigateToShop();
    } else if (tab === 'admin') {
      if (isAdmin) {
        setActiveTab('admin');
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      } else if (openAdminAuthModal) {
        openAdminAuthModal();
      } else {
        setActiveTab('admin');
        if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
          window.history.pushState(null, '', '/admin');
        }
      }
    } else {
      setActiveTab(tab);
      if (typeof window !== 'undefined' && window.location.pathname !== path) {
        window.history.pushState(null, '', path);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim();
    if (query) {
      ondcClientService.searchProducts(query);
    }
    if (onSearchQuery) {
      onSearchQuery(query);
    }
    const searchUrl = query ? `/search?q=${encodeURIComponent(query)}` : '/search';
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', searchUrl);
    }
    setActiveTab('search');
    setMobileMenuOpen(false);
  };

  return (
    <header className="km-header-wrapper" id="site-header">
      {/* Tier 1: Upper Utility / Announcement Bar */}
      <div className="km-top-utility-bar">
        <div className="km-header-container flex items-center justify-between">
          <span className="km-top-utility-item">
            <Truck size={14} className="text-emerald-400" />
            <span>FREE PAN-INDIA DELIVERY on Orders Above ₹1,999</span>
          </span>
          <span className="hide-on-mobile km-top-utility-item">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>100% GENUINE PRODUCTS | GST Invoice Available</span>
          </span>
          <span className="km-top-utility-item">
            <Building2 size={14} className="text-blue-400" />
            <span>
              B2B & INSTITUTIONAL ENQUIRIES:{' '}
              <a
                href="/support?method=phone"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('support', '/support?method=phone');
                }}
                style={{ color: '#93C5FD', fontWeight: 700, textDecoration: 'underline' }}
              >
                +91 9931648595
              </a>
              {' | '}
              <a
                href="/support?method=whatsapp"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('support', '/support?method=whatsapp');
                }}
                style={{ color: '#86EFAC', fontWeight: 700, textDecoration: 'underline' }}
                title="Chat with us on WhatsApp"
              >
                WhatsApp
              </a>
            </span>
          </span>
        </div>
      </div>

      {/* Tier 2: Main Header Row (Brand Logo, Search & Action Controls) */}
      <div className="km-header-container">
        <div className="km-main-header-row">
          {/* Brand Logo & Tagline */}
          <div
            className="flex items-center gap-3 brand-logo-container"
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => handleNavClick('home', '/')}
            title="KOGNITI MINDS PVT LTD - Home"
          >
            <img
              key={siteMedia?.logo || '/logo.png'}
              src={siteMedia?.logo || '/logo.png'}
              alt="Kogniti Minds Logo"
              className="kogniti-brand-logo"
            />
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.22rem',
                  lineHeight: '1.1',
                  color: '#0F172A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                KOGNITI MINDS
                <span
                  style={{
                    fontSize: '0.62rem',
                    background: 'var(--km-light-cyan)',
                    color: 'var(--km-blue)',
                    padding: '0.1rem 0.35rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    border: '1px solid var(--km-border)',
                  }}
                >
                  PVT LTD
                </span>
              </div>
              <div
                className="hide-on-mobile"
                style={{
                  fontSize: '0.72rem',
                  color: '#64748B',
                  fontWeight: 500,
                  letterSpacing: '0.01em',
                }}
              >
                From Farm Waste to Future-Ready Paper.
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="km-header-search-form hide-on-mobile"
            role="search"
          >
            <div className="km-header-search-wrapper">
              <Search
                size={17}
                style={{
                  position: 'absolute',
                  left: '13px',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search sustainable paper, printing paper, notebooks, stationery & more..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (onSearchQuery) onSearchQuery(e.target.value);
                }}
                className="km-header-search-input"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="km-header-search-btn"
                aria-label="Submit Search"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Group: Wishlist, Cart, Account, Hamburger */}
          <div className="km-header-actions-group">
            {/* Mobile Search Button */}
            <button
              onClick={() => handleNavClick('search', '/search')}
              className="km-action-btn-icon hide-on-desktop"
              title="Search Products"
              aria-label="Search"
            >
              <Search size={18} color="#475569" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => handleNavClick('wishlist', '/wishlist')}
              className="km-action-btn-icon"
              title="Your Wishlist"
              aria-label="Wishlist"
            >
              <Heart
                size={18}
                color={wishlist.length > 0 ? '#E11D48' : '#475569'}
                fill={wishlist.length > 0 ? '#E11D48' : 'none'}
              />
              {wishlist.length > 0 && (
                <span className="km-action-badge">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleNavClick('cart', '/cart')}
              className="km-cart-pill-btn"
              title="View Shopping Cart"
              aria-label="Shopping Cart"
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <ShoppingCart size={17} />
                {b2cCount > 0 && (
                  <span className="km-cart-badge">
                    {b2cCount}
                  </span>
                )}
              </div>
              <span className="hide-on-mobile" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                {calculations.total > 0
                  ? `₹${calculations.total.toLocaleString('en-IN')}`
                  : 'Cart'}
              </span>
            </button>

            {/* Account / User Profile Dropdown */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              {role === 'b2c' && b2cUser ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="km-user-pill-btn"
                    aria-expanded={userDropdownOpen}
                    aria-label="User Account"
                  >
                    {b2cUser.avatarUrl ? (
                      <img
                        src={b2cUser.avatarUrl}
                        alt={b2cUser.name}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--km-blue) 0%, var(--km-cyan) 100%)',
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {b2cUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className="hide-on-mobile"
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        maxWidth: '105px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b2cUser.name}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '115%',
                        width: '220px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                        zIndex: 150,
                        padding: '0.5rem 0',
                        animation: 'fadeIn 0.15s ease-out',
                      }}
                    >
                      <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
                        <div className="flex items-center justify-between">
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                            {b2cUser.name}
                          </div>
                          {b2cUser.authProvider === 'firebase_google' && (
                            <span className="badge badge-blue" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                              Google
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            color: '#64748B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {b2cUser.email}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          handleNavClick('account', '/account');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.84rem',
                          color: '#334155',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <User size={15} className="text-slate-400" /> My Profile & Addresses
                      </button>
                      <button
                        onClick={() => {
                          handleNavClick('orders', '/orders');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.84rem',
                          color: '#334155',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Package size={15} className="text-slate-400" /> My Orders & Invoices
                      </button>
                      <button
                        onClick={() => {
                          handleNavClick('wishlist', '/wishlist');
                          setUserDropdownOpen(false);
                        }}
                        className="flex items-center gap-2"
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          textAlign: 'left',
                          fontSize: '0.84rem',
                          color: '#334155',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <Heart size={15} className="text-slate-400" /> Wishlist ({wishlist.length})
                      </button>
                      <div style={{ borderTop: '1px solid #F1F5F9', margin: '0.35rem 0' }} />
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
                          fontSize: '0.84rem',
                          color: '#E11D48',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
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
                  className="km-user-pill-btn"
                  aria-label="Sign In"
                >
                  <User size={16} />
                  <span className="hide-on-mobile" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn btn-outline btn-sm hide-on-desktop"
              id="mobile-nav-toggle"
              aria-label="Toggle navigation menu"
              style={{
                padding: '0.45rem',
                borderRadius: '8px',
                borderColor: '#CBD5E1',
                color: '#0F172A',
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tier 3: Secondary Navigation Bar (Exact 11 Items in Order) */}
      <nav className="km-subnav-bar" aria-label="Main Navigation">
        <div className="km-subnav-container">
          <div className="km-subnav-group-left">
            {/* 1. Home */}
            <button
              type="button"
              id="nav-home"
              onClick={() => handleNavClick('home', '/')}
              className={`km-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              title="Return to Home"
            >
              <Home size={14} />
              <span>Home</span>
            </button>

            {/* 2. All Products */}
            <button
              type="button"
              id="nav-products"
              onClick={() => handleNavClick('products', '/products')}
              className={`km-nav-item ${activeTab === 'products' || activeTab === 'new-arrivals' ? 'active' : ''}`}
              title="Explore all sustainable products"
            >
              <Layers size={14} />
              <span>All Products</span>
            </button>

            {/* 3. Shop Now */}
            <button
              type="button"
              id="nav-shop"
              onClick={() => handleNavClick('shop', '/shop')}
              className={`km-nav-item km-nav-item-shop ${activeTab === 'shop' ? 'active' : ''}`}
              title="Instant Eco-friendly Shopping Catalogue"
            >
              <ShoppingBag size={14} />
              <span>Shop Now</span>
            </button>

            {/* 4. Deals */}
            <button
              type="button"
              id="nav-deals"
              onClick={() => handleNavClick('deals', '/deals')}
              className={`km-nav-item km-nav-item-deals ${activeTab === 'deals' ? 'active' : ''}`}
              title="Exclusive Deals & Offers"
            >
              <Sparkles size={14} />
              <span>Deals</span>
              <span className="km-badge-deals">Offers</span>
            </button>

            {/* 5. Success Stories */}
            <button
              type="button"
              id="nav-success-stories"
              onClick={() => handleNavClick('stories', '/success-stories')}
              className={`km-nav-item ${activeTab === 'stories' || activeTab === 'success-stories' ? 'active' : ''}`}
              title="Customer Impact & Environmental Stories"
            >
              <BookOpen size={14} />
              <span>Success Stories</span>
            </button>

            {/* 6. Certifications */}
            <button
              type="button"
              id="nav-certifications"
              onClick={() => handleNavClick('certifications', '/certifications')}
              className={`km-nav-item km-nav-item-cert ${
                activeTab === 'certifications' || activeTab === 'certifications-compliance' ? 'active' : ''
              }`}
              title="Eco Certifications, ISO & Compliance"
            >
              <ShieldCheck size={14} />
              <span>Certifications</span>
            </button>

            {/* 7. B2B Deals & Wholesale */}
            <button
              type="button"
              id="nav-b2b"
              onClick={() => handleNavClick('b2b-deals', '/b2b-deals')}
              className={`km-nav-item km-nav-item-b2b ${
                activeTab === 'b2b' ||
                activeTab === 'b2b-deals' ||
                activeTab === 'b2b-overview' ||
                activeTab === 'wholesale-catalog' ||
                activeTab === 'rfq' ||
                activeTab === 'business-dashboard'
                  ? 'active'
                  : ''
              }`}
              title="B2B Wholesale Pricing, RFQ & Custom Quotes"
            >
              <Briefcase size={14} />
              <span>B2B Deals & Wholesale</span>
            </button>

            {/* 8. Track Orders */}
            <button
              type="button"
              id="nav-track"
              onClick={() => handleNavClick('track', '/track')}
              className={`km-nav-item ${activeTab === 'track' ? 'active' : ''}`}
              title="Real-time Dispatch & Delivery Tracking"
            >
              <Truck size={14} />
              <span>Track Orders</span>
            </button>

            {/* 9. Support */}
            <button
              type="button"
              id="nav-support"
              onClick={() => handleNavClick('support', '/support')}
              className={`km-nav-item ${activeTab === 'support' ? 'active' : ''}`}
              title="Dedicated Customer Support & Helpdesk"
            >
              <Headphones size={14} />
              <span>Support</span>
            </button>
          </div>

          <div className="km-subnav-group-right">
            {/* 10. GST Input Credit */}
            <button
              type="button"
              id="nav-gst"
              onClick={() => handleNavClick('gst-input-credit', '/gst-input-credit')}
              className={`km-nav-item km-nav-item-gst ${activeTab === 'gst-input-credit' ? 'active' : ''}`}
              title="Claim 100% Verified GST Input Tax Credit on Invoices"
            >
              <Receipt size={14} />
              <span>GST Input Credit</span>
              <span className="km-badge-business">For Businesses</span>
            </button>

            {/* Subtle Vertical Divider */}
            <div className="km-nav-divider" role="separator" />

            {/* 11. Admin Portal */}
            <button
              type="button"
              id="nav-admin"
              onClick={() => handleNavClick('admin', '/admin')}
              className={`km-nav-item km-nav-item-admin ${activeTab === 'admin' ? 'active' : ''}`}
              title="Restricted Staff & Admin Management Portal"
            >
              <Shield size={13} />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Responsive Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="km-mobile-menu-drawer hide-on-desktop">
          {/* Mobile Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ marginBottom: '0.4rem' }}>
            <div className="km-header-search-wrapper">
              <Search
                size={17}
                style={{
                  position: 'absolute',
                  left: '13px',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search products, paper, stationery..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (onSearchQuery) onSearchQuery(e.target.value);
                }}
                className="km-header-search-input"
                style={{ paddingRight: '80px' }}
              />
              <button type="submit" className="km-header-search-btn">
                Search
              </button>
            </div>
          </form>

          {/* 1. Home */}
          <button
            onClick={() => handleNavClick('home', '/')}
            className={`km-mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Home size={16} /> Home
            </span>
          </button>

          {/* 2. All Products */}
          <button
            onClick={() => handleNavClick('products', '/products')}
            className={`km-mobile-nav-item ${activeTab === 'products' || activeTab === 'new-arrivals' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Layers size={16} /> All Products
            </span>
          </button>

          {/* 3. Shop Now */}
          <button
            onClick={() => handleNavClick('shop', '/shop')}
            className={`km-mobile-nav-item ${activeTab === 'shop' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={16} /> Shop Now
            </span>
          </button>

          {/* 4. Deals */}
          <button
            onClick={() => handleNavClick('deals', '/deals')}
            className={`km-mobile-nav-item ${activeTab === 'deals' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2 text-amber-600 font-semibold">
              <Sparkles size={16} /> Deals
            </span>
            <span className="km-badge-deals">Offers</span>
          </button>

          {/* 5. Success Stories */}
          <button
            onClick={() => handleNavClick('stories', '/success-stories')}
            className={`km-mobile-nav-item ${activeTab === 'stories' || activeTab === 'success-stories' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} /> Success Stories
            </span>
          </button>

          {/* 6. Certifications */}
          <button
            onClick={() => handleNavClick('certifications', '/certifications')}
            className={`km-mobile-nav-item ${activeTab === 'certifications' || activeTab === 'certifications-compliance' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" /> Certifications
            </span>
          </button>

          {/* 7. B2B Deals & Wholesale */}
          <button
            onClick={() => handleNavClick('b2b-deals', '/b2b-deals')}
            className={`km-mobile-nav-item ${
              activeTab === 'b2b' ||
              activeTab === 'b2b-deals' ||
              activeTab === 'b2b-overview' ||
              activeTab === 'wholesale-catalog' ||
              activeTab === 'rfq' ||
              activeTab === 'business-dashboard'
                ? 'active'
                : ''
            }`}
            style={{ background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' }}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Briefcase size={16} className="text-blue-600" /> B2B Deals & Wholesale
            </span>
          </button>

          {/* 8. Track Orders */}
          <button
            onClick={() => handleNavClick('track', '/track')}
            className={`km-mobile-nav-item ${activeTab === 'track' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Truck size={16} /> Track Orders
            </span>
          </button>

          {/* 9. Support */}
          <button
            onClick={() => handleNavClick('support', '/support')}
            className={`km-mobile-nav-item ${activeTab === 'support' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Headphones size={16} /> Support
            </span>
          </button>

          {/* 10. GST Input Credit */}
          <button
            onClick={() => handleNavClick('gst-input-credit', '/gst-input-credit')}
            className={`km-mobile-nav-item ${activeTab === 'gst-input-credit' ? 'active' : ''}`}
          >
            <span className="flex items-center gap-2">
              <Receipt size={16} /> GST Input Credit
            </span>
            <span className="km-badge-business">For Businesses</span>
          </button>

          {/* 11. Admin Portal */}
          <button
            onClick={() => handleNavClick('admin', '/admin')}
            className={`km-mobile-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
            style={{ color: '#7E22CE', borderColor: 'rgba(147, 51, 234, 0.25)', background: '#FAF5FF' }}
          >
            <span className="flex items-center gap-2 font-semibold">
              <Shield size={16} /> Admin Portal
            </span>
          </button>

          {/* Additional mobile quick links */}
          <div style={{ borderTop: '1px solid #E2E8F0', margin: '0.6rem 0 0.4rem' }} />

          <button
            onClick={() => handleNavClick('wishlist', '/wishlist')}
            className="km-mobile-nav-item"
          >
            <span className="flex items-center gap-2">
              <Heart size={16} color={wishlist.length > 0 ? '#E11D48' : '#64748B'} /> Wishlist
            </span>
            {wishlist.length > 0 && (
              <span className="badge badge-rose">{wishlist.length}</span>
            )}
          </button>

          {role === 'b2c' && b2cUser ? (
            <>
              <button
                onClick={() => handleNavClick('orders', '/orders')}
                className="km-mobile-nav-item"
              >
                <span className="flex items-center gap-2">
                  <Package size={16} /> My Orders
                </span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="km-mobile-nav-item"
                style={{ color: '#E11D48' }}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <LogOut size={16} /> Sign Out ({b2cUser.name})
                </span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                openAuthModal('login');
                setMobileMenuOpen(false);
              }}
              className="btn btn-primary"
              style={{ marginTop: '0.5rem', justifyContent: 'center' }}
            >
              <User size={16} /> Sign In / Register
            </button>
          )}
        </div>
      )}
    </header>
  );
};

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { storageService } from './services/storageService';
import { dataSyncBus } from './services/dataSyncBus';
import { realtimeSyncService } from './services/realtimeSyncService';
import { Product, B2COrder, B2BOrder, Category, B2CUser } from './types';
import { ShieldCheck, Lock } from 'lucide-react';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { B2BNavbar } from './components/layout/B2BNavbar';
import { Footer } from './components/layout/Footer';
import { PolicyModal } from './components/common/PolicyModal';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OndcNetworkModal } from './components/common/OndcNetworkModal';

// Modals
import { ProductDetailModal } from './components/products/ProductDetailModal';
import { AuthModal } from './components/auth/AuthModal';
import { B2BAuthModal } from './components/auth/B2BAuthModal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';

// B2C Pages
import { HomePage } from './pages/b2c/HomePage';
import { ProductListingPage } from './pages/b2c/ProductListingPage';
import { CartPage } from './pages/b2c/CartPage';
import { CheckoutPage } from './pages/b2c/CheckoutPage';
import { OrdersPage } from './pages/b2c/OrdersPage';
import { WishlistPage } from './pages/b2c/WishlistPage';
import { CustomerDashboardPage } from './pages/b2c/CustomerDashboardPage';
import { SuccessStoriesPage } from './pages/b2c/SuccessStoriesPage';
import { CertificationsPage } from './pages/b2c/CertificationsPage';

// B2B Pages
import { B2BHomePage } from './pages/b2b/B2BHomePage';
import { B2BCatalogPage } from './pages/b2b/B2BCatalogPage';
import { B2BCartPage } from './pages/b2b/B2BCartPage';
import { B2BRFQPage } from './pages/b2b/B2BRFQPage';
import { B2BDashboardPage } from './pages/b2b/B2BDashboardPage';
import { B2BSuccessStoriesPage } from './pages/b2b/B2BSuccessStoriesPage';
import { B2BCertificationsPage } from './pages/b2b/B2BCertificationsPage';

// Admin Page
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { OndcManagement } from './components/admin/OndcManagement';

// Legal & Policy Pages
import { LegalPolicyPage } from './pages/legal/LegalPolicyPage';

// Customer Production Route Pages
import { SearchPage } from './pages/customer/SearchPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CancellationPage } from './pages/customer/CancellationPage';
import { SupportPage } from './pages/customer/SupportPage';
import { RatingPage } from './pages/customer/RatingPage';
import { TrackOrderPage } from './pages/customer/TrackOrderPage';
import { OrderStatusPage } from './pages/customer/OrderStatusPage';
import { OrderConfirmPage } from './pages/customer/OrderConfirmPage';
import { CheckoutInitPage } from './pages/customer/CheckoutInitPage';
import { OrderUpdatePage } from './pages/customer/OrderUpdatePage';

// Gallery & Certification Components
import { StoryDetailModal } from './components/gallery/StoryDetailModal';
import { CertificateDetailModal } from './components/certification/CertificateDetailModal';
import { GalleryStory, CompanyCertification } from './types';

const MainApp: React.FC = () => {
  const { role, b2cUser, b2bBusiness, isAdmin } = useAuth();
  const { addToB2CCart, addToB2BCart } = useCart();

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [b2bTab, setB2bTab] = useState<string>('overview');
  const [isB2BCheckout, setIsB2BCheckout] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [b2bAuthModalOpen, setB2bAuthModalOpen] = useState(false);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminAuthMode, setAdminAuthMode] = useState<'login' | 'register'>('login');
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | 'shipping' | 'refund' | null>(null);
  const [rfqTargetProduct, setRfqTargetProduct] = useState<Product | null>(null);
  const [selectedStory, setSelectedStory] = useState<GalleryStory | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CompanyCertification | null>(null);
  const [ondcModalOpen, setOndcModalOpen] = useState(false);

  // App Data (reactive)
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [b2cUsers, setB2cUsers] = useState<B2CUser[]>(() => storageService.getB2CUsers());
  const [b2cOrders, setB2cOrders] = useState<B2COrder[]>(() => storageService.getB2COrders());
  const [b2bOrders, setB2bOrders] = useState(() => storageService.getB2BOrders());
  const [businesses, setBusinesses] = useState(() => storageService.getB2BBusinesses());
  const [quotations, setQuotations] = useState(() => storageService.getB2BQuotations());
  const [coupons, setCoupons] = useState(() => storageService.getCoupons());

  const refreshData = () => {
    setProducts(storageService.getProducts());
    setCategories(storageService.getCategories());
    setB2cUsers(storageService.getB2CUsers());
    setB2cOrders(storageService.getB2COrders());
    setB2bOrders(storageService.getB2BOrders());
    setBusinesses(storageService.getB2BBusinesses());
    setQuotations(storageService.getB2BQuotations());
    setCoupons(storageService.getCoupons());
  };

  // Clean URL: Automatically strip Google Search tracking parameter (?srsltid=...) from URL bar
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search && window.location.search.indexOf('srsltid') !== -1) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('srsltid');
        const cleanPath = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
        window.history.replaceState(null, '', cleanPath);
      } catch (e) {
        window.history.replaceState(null, '', window.location.pathname + window.location.hash);
      }
    }
  }, []);

  useEffect(() => {
    const unsubProd = dataSyncBus.subscribe('products', (data) => {
      if (Array.isArray(data)) setProducts(storageService.normalizeProducts(data));
    });
    const unsubCats = dataSyncBus.subscribe('categories', (data) => {
      if (Array.isArray(data)) setCategories(data);
    });
    const unsubUsers = dataSyncBus.subscribe('b2c_users', (data) => {
      if (Array.isArray(data)) setB2cUsers(data);
    });
    const unsubB2COrders = dataSyncBus.subscribe('b2c_orders', (data) => {
      if (Array.isArray(data)) setB2cOrders(data);
    });
    const unsubB2BOrders = dataSyncBus.subscribe('b2b_orders', (data) => {
      if (Array.isArray(data)) setB2bOrders(data);
    });
    const unsubBiz = dataSyncBus.subscribe('b2b_businesses', (data) => {
      if (Array.isArray(data)) setBusinesses(data);
    });
    const unsubQuotes = dataSyncBus.subscribe('b2b_quotations', (data) => {
      if (Array.isArray(data)) setQuotations(data);
    });
    const unsubCoupons = dataSyncBus.subscribe('coupons', (data) => {
      if (Array.isArray(data)) setCoupons(data);
    });
    const unsubMedia = dataSyncBus.subscribe('site_media', () => {
      refreshData();
    });

    return () => {
      unsubProd();
      unsubCats();
      unsubUsers();
      unsubB2COrders();
      unsubB2BOrders();
      unsubBiz();
      unsubQuotes();
      unsubCoupons();
      unsubMedia();
    };
  }, []);

  // Initialize live bidirectional Firebase Realtime Database subscriptions
  useEffect(() => {
    realtimeSyncService.initRealtimeListeners();
    return () => {
      realtimeSyncService.destroyRealtimeListeners();
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, b2bTab]);

  // Support direct pathname & hash navigation and back button for all sections
  useEffect(() => {
    const handleRouteCheck = () => {
      const pathname = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase();
      if (pathname.startsWith('/admin')) {
        setActiveTab('admin');
        return;
      }
      if (pathname.startsWith('/on_')) {
        const cleanSlug = pathname.replace(/^\//, '').replace(/_/g, '-');
        window.history.replaceState(null, '', `/admin/ondc/${cleanSlug}`);
        setActiveTab('admin');
        return;
      }
      // Production Customer Routes:
      const customerMatch = pathname.match(/^\/(search|select|init|confirm|status|track|cancel|update|rating|support)$/);
      if (customerMatch) {
        const routeName = customerMatch[1];
        setActiveTab(routeName);
        if (routeName === 'select') {
          const params = new URLSearchParams(window.location.search);
          const pid = params.get('productId');
          if (pid) {
            const found = storageService.getProductById(pid) || products.find((p) => p.id === pid || p.sku === pid);
            if (found) setSelectedProduct(found);
          }
        } else if (routeName === 'search') {
          const params = new URLSearchParams(window.location.search);
          const q = params.get('q');
          if (q) setSearchQuery(q);
        }
        return;
      }
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (['terms', 'privacy', 'refund', 'shipping', 'new-arrivals', 'certifications', 'stories', 'shop', 'products', 'b2b', 'admin'].includes(hash)) {
        setActiveTab(hash);
      } else if (!hash || hash === 'home') {
        setActiveTab('home');
      }
    };
    handleRouteCheck();
    window.addEventListener('hashchange', handleRouteCheck);
    window.addEventListener('popstate', handleRouteCheck);
    return () => {
      window.removeEventListener('hashchange', handleRouteCheck);
      window.removeEventListener('popstate', handleRouteCheck);
    };
  }, [products]);

  // Handlers
  const handleSetActiveTab = (tab: string) => {
    setActiveTab(tab);
    if (['search', 'select', 'init', 'confirm', 'status', 'track', 'cancel', 'update', 'rating', 'support'].includes(tab)) {
      const targetPath = `/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath + window.location.search);
      }
    } else if (tab === 'home') {
      if (window.location.hash || window.location.pathname !== '/') {
        window.history.pushState(null, '', '/' + window.location.search);
      }
    } else {
      const targetHash = `#${tab}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    }
  };

  const handleNavigateToShop = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    handleSetActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p);
    window.history.pushState(null, '', `/select?productId=${p.id}`);
    setActiveTab('select');
  };

  const handleB2BBuyNow = (p: Product) => {
    addToB2BCart(p.id, p.b2bMoq || 1);
    if (role !== 'b2b' || !b2bBusiness) {
      handleOpenB2BAuth();
      return;
    }
    setIsB2BCheckout(true);
    setActiveTab('checkout');
  };

  const handleBuyNow = (p: Product) => {
    if (activeTab === 'b2b') {
      handleB2BBuyNow(p);
      return;
    }
    addToB2CCart(p.id, 1);
    if (role !== 'b2c' || !b2cUser) {
      handleOpenAuth('login');
      return;
    }
    setIsB2BCheckout(false);
    setActiveTab('checkout');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenB2BAuth = () => {
    setB2bAuthModalOpen(true);
  };

  const handleOpenRfqModal = (p: Product) => {
    setRfqTargetProduct(p);
    setB2bTab('rfq');
    setActiveTab('b2b');
  };

  const handleOrderSuccess = (order: B2COrder) => {
    refreshData();
    window.history.pushState(null, '', `/confirm?orderId=${order.orderNumber || order.id}`);
    setActiveTab('confirm');
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Rendering Logic */}
      {activeTab === 'admin' ? null : activeTab === 'b2b' ? (
        <B2BNavbar
          b2bTab={b2bTab}
          setB2bTab={setB2bTab}
          onSwitchToB2C={() => setActiveTab('home')}
          openB2BAuthModal={handleOpenB2BAuth}
        />
      ) : (
        <Navbar
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
          openAuthModal={handleOpenAuth}
          openAdminAuthModal={() => {
            setAdminAuthMode('login');
            setAdminAuthModalOpen(true);
          }}
          onSearchQuery={(q) => {
            setSearchQuery(q);
            const targetUrl = q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search';
            window.history.pushState(null, '', targetUrl);
            setActiveTab('search');
          }}
          onNavigateToShop={handleNavigateToShop}
        />
      )}

      {/* 2. Main Page Content View */}
      <main style={{ flex: '1 0 auto' }}>
        <ErrorBoundary key={activeTab}>
          {/* --- B2C Views --- */}
        {activeTab === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              handleSetActiveTab('products');
            }}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            setActiveTab={handleSetActiveTab}
            openB2BAuthModal={handleOpenB2BAuth}
            onOpenStory={(story) => setSelectedStory(story)}
            onOpenCertificate={(cert) => setSelectedCertificate(cert)}
            onNavigateToShop={handleNavigateToShop}
          />
        )}

        {activeTab === 'stories' && (
          <SuccessStoriesPage
            onOpenStory={(story) => setSelectedStory(story)}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationsPage
            onOpenCertificate={(cert) => setSelectedCertificate(cert)}
          />
        )}

        {(activeTab === 'products' || activeTab === 'shop') && (
          <ProductListingPage
            key={activeTab}
            products={products}
            categories={categories}
            initialCategory={activeTab === 'shop' ? 'All' : selectedCategory}
            initialSearch={activeTab === 'shop' ? '' : searchQuery}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            isShopNowView={activeTab === 'shop'}
          />
        )}

        {activeTab === 'new-arrivals' && (
          <ProductListingPage
            products={products}
            categories={categories}
            initialCategory="All"
            initialSearch=""
            initialSort="newest"
            onlyNewArrivals={true}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            isShopNowView={true}
          />
        )}

        {activeTab === 'cart' && (
          <CartPage
            products={products}
            onProceedToCheckout={() => {
              setIsB2BCheckout(false);
              if (role !== 'b2c' || !b2cUser) {
                handleOpenAuth('login');
              } else {
                setActiveTab('checkout');
              }
            }}
            setActiveTab={setActiveTab}
            onOpenProduct={handleOpenProduct}
            onOpenAuth={handleOpenAuth}
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutPage
            products={products}
            isB2B={isB2BCheckout}
            onOrderSuccess={handleOrderSuccess}
            onB2BOrderSuccess={() => {
              refreshData();
              setIsB2BCheckout(false);
              setActiveTab('b2b');
              setB2bTab('dashboard');
            }}
            onBackToCart={() => {
              if (isB2BCheckout) {
                setActiveTab('b2b');
                setB2bTab('cart');
              } else {
                setActiveTab('cart');
              }
            }}
            onOpenAuth={handleOpenAuth}
            onOpenB2BAuth={handleOpenB2BAuth}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPage
            orders={b2cOrders}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistPage
            products={products}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'account' && (
          <CustomerDashboardPage
            orders={b2cOrders}
            setActiveTab={setActiveTab}
          />
        )}

        {/* --- 10 Production Customer Routes --- */}
        {activeTab === 'search' && (
          <SearchPage
            products={products}
            categories={categories}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'select' && (
          <ProductDetailPage
            products={products}
            selectedProduct={selectedProduct}
            onSelectProduct={(p) => setSelectedProduct(p)}
            onBuyNow={handleBuyNow}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'cancel' && (
          <CancellationPage
            b2cOrders={b2cOrders}
            b2bOrders={b2bOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'support' && (
          <SupportPage
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'rating' && (
          <RatingPage
            products={products}
            b2cOrders={b2cOrders}
            b2bOrders={b2bOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'track' && (
          <TrackOrderPage
            b2cOrders={b2cOrders}
            b2bOrders={b2bOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'status' && (
          <OrderStatusPage
            b2cOrders={b2cOrders}
            b2bOrders={b2bOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'confirm' && (
          <OrderConfirmPage
            b2cOrders={b2cOrders}
            b2bOrders={b2bOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'init' && (
          <CheckoutInitPage
            products={products}
            setActiveTab={handleSetActiveTab}
            openAuthModal={() => handleOpenAuth('login')}
          />
        )}

        {activeTab === 'update' && (
          <OrderUpdatePage
            b2cOrders={b2cOrders}
            b2bOrders={b2bOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {/* --- Legal & Statutory Policy Pages --- */}
        {(activeTab === 'terms' || activeTab === 'privacy' || activeTab === 'refund' || activeTab === 'shipping') && (
          <LegalPolicyPage
            initialPolicy={activeTab as 'terms' | 'privacy' | 'refund' | 'shipping'}
            onBackHome={() => {
              window.history.replaceState(null, '', window.location.pathname);
              setActiveTab('home');
            }}
            onNavigatePolicy={(policyId) => {
              setActiveTab(policyId);
            }}
          />
        )}

        {/* --- B2B Portal Views --- */}
        {activeTab === 'b2b' && (
          <div>
            {b2bTab === 'overview' && (
              <B2BHomePage
                products={products}
                setB2bTab={setB2bTab}
                openB2BAuthModal={handleOpenB2BAuth}
                onOpenProduct={handleOpenProduct}
                onOpenStory={(story) => setSelectedStory(story)}
                onOpenCertificate={(cert) => setSelectedCertificate(cert)}
              />
            )}

            {b2bTab === 'catalog' && (
              <B2BCatalogPage
                products={products}
                categories={categories}
                onOpenProduct={handleOpenProduct}
                openB2BAuthModal={handleOpenB2BAuth}
                onOpenRfqModal={handleOpenRfqModal}
                onBuyNow={handleB2BBuyNow}
              />
            )}

            {b2bTab === 'rfq' && (
              <B2BRFQPage
                products={products}
                selectedProduct={rfqTargetProduct}
                onSuccess={refreshData}
                setB2bTab={setB2bTab}
                openB2BAuthModal={handleOpenB2BAuth}
              />
            )}

            {b2bTab === 'dashboard' && (
              <B2BDashboardPage
                b2bOrders={b2bOrders}
                quotations={quotations}
                onRefresh={refreshData}
                setB2bTab={setB2bTab}
              />
            )}

            {b2bTab === 'cart' && (
              <B2BCartPage
                products={products}
                onProceedToCheckout={() => {
                  setIsB2BCheckout(true);
                  setActiveTab('checkout');
                }}
                setB2bTab={setB2bTab}
                onOpenProduct={handleOpenProduct}
                openB2BAuthModal={handleOpenB2BAuth}
                onRfqCreated={() => {
                  refreshData();
                  setB2bTab('dashboard');
                }}
              />
            )}

            {b2bTab === 'stories' && (
              <B2BSuccessStoriesPage
                onOpenStory={(story) => setSelectedStory(story)}
              />
            )}

            {b2bTab === 'certifications' && (
              <B2BCertificationsPage
                onOpenCertificate={(cert) => setSelectedCertificate(cert)}
              />
            )}
          </div>
        )}

        {/* --- Admin Control Center View --- */}
        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboardPage
              products={products}
              categories={categories}
              b2cUsers={b2cUsers}
              b2cOrders={b2cOrders}
              b2bOrders={b2bOrders}
              businesses={businesses}
              quotations={quotations}
              coupons={coupons}
              onRefresh={refreshData}
              onExitAdmin={() => {
                window.history.pushState(null, '', '/');
                setActiveTab('home');
              }}
            />
          ) : typeof window !== 'undefined' && window.location.pathname.startsWith('/admin/ondc') ? (
              <div className="container" style={{ padding: '2rem 1.25rem', maxWidth: '1440px', margin: '0 auto' }}>
                <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <button
                    onClick={() => {
                      window.history.pushState(null, '', '/');
                      setActiveTab('home');
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      background: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    ← Back to Storefront
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>Public Protocol Explorer • ONDC:RETeB2B v1.2.5</span>
                    <button
                      onClick={() => {
                        setAdminAuthMode('login');
                        setAdminAuthModalOpen(true);
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Admin Sign In
                    </button>
                  </div>
                </div>
                <OndcManagement />
              </div>
            ) : (
            <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
              <div
                className="card"
                style={{
                  maxWidth: '520px',
                  margin: '0 auto',
                  padding: '2.5rem',
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15) 0%, rgba(126, 34, 206, 0.1) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                  }}
                >
                  <ShieldCheck size={32} style={{ color: '#9333EA' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                  Administrator Access Required
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--slate-600)', margin: '0.75rem 0 1.5rem', lineHeight: '1.5' }}>
                  The Kogniti Minds Admin Control Center is restricted to authorized company personnel. All staff registrations are subject to Super Admin approval.
                </p>
                <div className="flex justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setAdminAuthMode('login');
                      setAdminAuthModalOpen(true);
                    }}
                    className="btn btn-purple"
                  >
                    Sign In with Admin ID
                  </button>
                  <button
                    onClick={() => {
                      setAdminAuthMode('register');
                      setAdminAuthModalOpen(true);
                    }}
                    className="btn btn-secondary"
                  >
                    Register Staff Account
                  </button>
                </div>
              </div>
            </div>
          )
        )}
        </ErrorBoundary>
      </main>

      {/* 3. Footer Rendering */}
      {activeTab !== 'admin' && (
        <Footer
          setActiveTab={handleSetActiveTab}
          setB2bTab={setB2bTab}
          openPolicyModal={(type) => setPolicyModalType(type)}
          isB2B={activeTab === 'b2b'}
          onNavigateToShop={handleNavigateToShop}
          onOpenOndcModal={() => setOndcModalOpen(true)}
        />
      )}

      {/* 4. Modals */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onSelectStory={(s) => setSelectedStory(s)}
          isB2BMode={activeTab === 'b2b'}
        />
      )}

      {selectedCertificate && (
        <CertificateDetailModal
          cert={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          isB2BMode={activeTab === 'b2b'}
        />
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuyNow={handleBuyNow}
          onRequestQuote={(p) => handleOpenRfqModal(p)}
          isB2BMode={activeTab === 'b2b'}
        />
      )}

      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {b2bAuthModalOpen && (
        <B2BAuthModal
          onClose={() => setB2bAuthModalOpen(false)}
          onSuccess={() => {
            refreshData();
            setActiveTab('b2b');
            setB2bTab('dashboard');
          }}
        />
      )}

      {policyModalType && (
        <PolicyModal
          type={policyModalType}
          onClose={() => setPolicyModalType(null)}
          onOpenFullPage={(type) => {
            setPolicyModalType(null);
            setActiveTab(type);
          }}
        />
      )}

      {adminAuthModalOpen && (
        <AdminAuthModal
          initialMode={adminAuthMode}
          onClose={() => setAdminAuthModalOpen(false)}
          onSuccess={() => {
            refreshData();
            setActiveTab('admin');
          }}
        />
      )}

      {/* ONDC Official Network Participant Modal */}
      <OndcNetworkModal
        isOpen={ondcModalOpen}
        onClose={() => setOndcModalOpen(false)}
        onNavigateToB2B={() => {
          handleSetActiveTab('b2b');
          setB2bTab('catalog');
        }}
      />

      {/* WhatsApp Business 1-Click Support Button */}
      <WhatsAppFloatingButton />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

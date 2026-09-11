import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { storageService } from './services/storageService';
import { Product, B2COrder, B2BOrder, Category, B2CUser } from './types';
import { ShieldCheck, Lock } from 'lucide-react';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { B2BNavbar } from './components/layout/B2BNavbar';
import { Footer } from './components/layout/Footer';
import { PolicyModal } from './components/common/PolicyModal';

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

// B2B Pages
import { B2BHomePage } from './pages/b2b/B2BHomePage';
import { B2BCatalogPage } from './pages/b2b/B2BCatalogPage';
import { B2BCartPage } from './pages/b2b/B2BCartPage';
import { B2BRFQPage } from './pages/b2b/B2BRFQPage';
import { B2BDashboardPage } from './pages/b2b/B2BDashboardPage';

// Admin Page
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, b2bTab]);

  // Handlers
  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p);
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
    setActiveTab('orders');
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
          setActiveTab={setActiveTab}
          openAuthModal={handleOpenAuth}
          openAdminAuthModal={() => {
            setAdminAuthMode('login');
            setAdminAuthModalOpen(true);
          }}
          onSearchQuery={(q) => {
            setSearchQuery(q);
            if (q.trim()) setActiveTab('products');
          }}
        />
      )}

      {/* 2. Main Page Content View */}
      <main style={{ flex: '1 0 auto' }}>
        {/* --- B2C Views --- */}
        {activeTab === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setActiveTab('products');
            }}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            setActiveTab={setActiveTab}
            openB2BAuthModal={handleOpenB2BAuth}
          />
        )}

        {activeTab === 'products' && (
          <ProductListingPage
            products={products}
            categories={categories}
            initialCategory={selectedCategory}
            initialSearch={searchQuery}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            isShopNowView={false}
          />
        )}

        {activeTab === 'shop' && (
          <ProductListingPage
            products={products}
            categories={categories}
            initialCategory="All"
            initialSearch=""
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

        {/* --- B2B Portal Views --- */}
        {activeTab === 'b2b' && (
          <div>
            {b2bTab === 'overview' && (
              <B2BHomePage
                products={products}
                setB2bTab={setB2bTab}
                openB2BAuthModal={handleOpenB2BAuth}
                onOpenProduct={handleOpenProduct}
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
              onExitAdmin={() => setActiveTab('home')}
            />
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
      </main>

      {/* 3. Footer Rendering */}
      {activeTab !== 'admin' && (
        <Footer
          setActiveTab={setActiveTab}
          openPolicyModal={(type) => setPolicyModalType(type)}
          isB2B={activeTab === 'b2b'}
        />
      )}

      {/* 4. Modals */}
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

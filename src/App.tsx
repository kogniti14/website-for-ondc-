import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { storageService } from './services/storageService';
import { testimonialService } from './services/testimonialService';
import { dataSyncBus } from './services/dataSyncBus';
import { realtimeSyncService } from './services/realtimeSyncService';
import { Product, B2COrder, B2BOrder, Category, B2CUser } from './types';
import { ShieldCheck, Lock } from 'lucide-react';

// Layout Components
import { Navbar } from './components/layout/Navbar';
import { B2BNavbar } from './components/layout/B2BNavbar';
import { Footer } from './components/layout/Footer';
import { PartnerCarousel } from './components/layout/PartnerCarousel';
import { PolicyModal } from './components/common/PolicyModal';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { ErrorBoundary } from './components/common/ErrorBoundary';

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
import { GstInputCreditPage } from './pages/customer/GstInputCreditPage';
import { InternshipsPage } from './pages/customer/InternshipsPage';

// URL Routing System
import { AppRoutes, parseCurrentRoute, slugify, navigateTo } from './utils/urlRouting';

// Gallery & Certification Services & Components
import { galleryService } from './services/galleryService';
import { certificationService } from './services/certificationService';
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
  const [b2bAuthMode, setB2bAuthMode] = useState<'login' | 'register'>('login');
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminAuthMode, setAdminAuthMode] = useState<'login' | 'register'>('login');
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | 'shipping' | 'refund' | null>(null);
  const [rfqTargetProduct, setRfqTargetProduct] = useState<Product | null>(null);
  const [selectedStory, setSelectedStory] = useState<GalleryStory | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CompanyCertification | null>(null);

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

  // Live hydration from production server on startup
  useEffect(() => {
    storageService.hydrateFromServer(true).then(() => {
      refreshData();
    });
    testimonialService.hydrateFromServer(true);
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
    const unsubOrders = dataSyncBus.subscribe('orders_updated', () => {
      setB2cOrders(storageService.getB2COrders());
      setB2bOrders(storageService.getB2BOrders());
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
      unsubOrders();
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

  // Canonical URL resolver for any tab / subtab state
  const getCanonicalUrl = (tab: string, b2bSubTab: string | null = b2bTab): string => {
    if (tab === 'b2b') {
      switch (b2bSubTab) {
        case 'catalog': return AppRoutes.b2bCatalog();
        case 'deals': return AppRoutes.b2bDeals();
        case 'rfq': return AppRoutes.b2bRfq();
        case 'dashboard': return AppRoutes.b2bDashboard();
        case 'cart': return AppRoutes.b2bCart();
        case 'stories': return AppRoutes.b2bStories();
        case 'certifications': return AppRoutes.b2bCompliance();
        default: return AppRoutes.b2bOverview();
      }
    }
    switch (tab) {
      case 'home': return AppRoutes.home();
      case 'shop': return AppRoutes.shop();
      case 'products': return selectedCategory && selectedCategory !== 'All' ? AppRoutes.category(selectedCategory) : AppRoutes.products();
      case 'deals': return AppRoutes.deals();
      case 'new-arrivals': return AppRoutes.newArrivals();
      case 'stories':
      case 'success-stories': return AppRoutes.successStories();
      case 'certifications':
      case 'certifications-compliance': return AppRoutes.certifications();
      case 'cart': return AppRoutes.cart();
      case 'checkout': return isB2BCheckout ? AppRoutes.b2bCheckout() : AppRoutes.checkout();
      case 'orders': return AppRoutes.orders();
      case 'wishlist': return AppRoutes.wishlist();
      case 'account': return AppRoutes.account();
      case 'track': return AppRoutes.track();
      case 'support': return AppRoutes.support();
      case 'gst-input-credit': return AppRoutes.gstInputCredit();
      case 'internships': return AppRoutes.internships();
      case 'search': return AppRoutes.search(searchQuery);
      case 'admin': return AppRoutes.admin();
      case 'terms': return AppRoutes.terms();
      case 'privacy': return AppRoutes.privacy();
      case 'refund': return AppRoutes.refund();
      case 'shipping': return AppRoutes.shipping();
      case 'init': return AppRoutes.init();
      case 'confirm': return AppRoutes.confirm();
      case 'status': return AppRoutes.status();
      case 'cancel': return AppRoutes.cancel();
      case 'update': return AppRoutes.update();
      case 'rating': return AppRoutes.rating();
      case 'b2b-deals': return AppRoutes.b2bDeals();
      case 'wholesale-catalog': return AppRoutes.b2bCatalog();
      case 'rfq': return AppRoutes.b2bRfq();
      case 'business-dashboard': return AppRoutes.b2bDashboard();
      case 'b2b-cart': return AppRoutes.b2bCart();
      case 'b2b-checkout': return AppRoutes.b2bCheckout();
      default: return tab.startsWith('/') ? tab : `/${tab}`;
    }
  };

  // Support direct pathname & hash navigation and back button for all sections
  useEffect(() => {
    const handleRouteCheck = () => {
      if (typeof window === 'undefined') return;
      const parsed = parseCurrentRoute(categories, products);

      setActiveTab(parsed.activeTab);
      if (parsed.b2bTab) {
        setB2bTab(parsed.b2bTab);
      }
      if (parsed.isB2BCheckout) {
        setIsB2BCheckout(true);
      } else if (parsed.activeTab === 'checkout' && !parsed.isB2BCheckout) {
        setIsB2BCheckout(false);
      }

      // Synchronize product detail
      if (parsed.productId) {
        const pid = parsed.productId.toLowerCase();
        const found = products.find(
          (p) =>
            p.id.toLowerCase() === pid ||
            (p.slug && p.slug.toLowerCase() === pid) ||
            (p.sku && p.sku.toLowerCase() === pid)
        ) || storageService.getProductById(parsed.productId);
        if (found) {
          setSelectedProduct(found);
        }
      } else if (parsed.activeTab !== 'select') {
        setSelectedProduct(null);
      }

      // Synchronize category
      if (parsed.categoryName) {
        setSelectedCategory(parsed.categoryName);
      }

      // Synchronize story
      if (parsed.storyId) {
        const sid = parsed.storyId;
        const found = galleryService.getStoryById(sid) || galleryService.getStoryBySlug(sid);
        if (found) {
          setSelectedStory(found);
        }
      } else {
        setSelectedStory(null);
      }

      // Synchronize certification
      if (parsed.certificateId) {
        const cid = parsed.certificateId;
        const found = certificationService.getCertificateById(cid) || certificationService.getCertificateBySlug(cid);
        if (found) {
          setSelectedCertificate(found);
        }
      } else {
        setSelectedCertificate(null);
      }

      // Synchronize Auth Modals
      if (parsed.authModal) {
        setAuthModalMode(parsed.authModal);
        setAuthModalOpen(true);
      } else {
        setAuthModalOpen(false);
      }

      if (parsed.b2bAuthModal) {
        setB2bAuthMode(parsed.b2bAuthModal);
        setB2bAuthModalOpen(true);
      } else {
        setB2bAuthModalOpen(false);
      }

      if (parsed.adminAuthModal) {
        setAdminAuthMode(parsed.adminAuthModal);
        setAdminAuthModalOpen(true);
      } else {
        setAdminAuthModalOpen(false);
      }

      // Synchronize search query
      if (parsed.searchQuery) {
        setSearchQuery(parsed.searchQuery);
      }

      // Close policy modal if route is full legal page
      if (parsed.policyType) {
        setPolicyModalType(null);
      }
    };

    handleRouteCheck();
    window.addEventListener('hashchange', handleRouteCheck);
    window.addEventListener('popstate', handleRouteCheck);
    return () => {
      window.removeEventListener('hashchange', handleRouteCheck);
      window.removeEventListener('popstate', handleRouteCheck);
    };
  }, [products, categories]);

  // Handlers with proper browser URL synchronization
  const handleSetActiveTab = (tab: string) => {
    let targetPath = '/';
    let newActiveTab = tab;

    switch (tab) {
      case 'home':
        newActiveTab = 'home';
        targetPath = AppRoutes.home();
        break;
      case 'products':
        newActiveTab = 'products';
        targetPath = selectedCategory && selectedCategory !== 'All' ? AppRoutes.category(selectedCategory) : AppRoutes.products();
        break;
      case 'shop':
        newActiveTab = 'shop';
        targetPath = AppRoutes.shop();
        break;
      case 'deals':
        newActiveTab = 'deals';
        targetPath = AppRoutes.deals();
        break;
      case 'new-arrivals':
        newActiveTab = 'new-arrivals';
        targetPath = AppRoutes.newArrivals();
        break;
      case 'stories':
      case 'success-stories':
        newActiveTab = 'stories';
        targetPath = AppRoutes.successStories();
        break;
      case 'certifications':
      case 'certifications-compliance':
        newActiveTab = 'certifications';
        targetPath = AppRoutes.certifications();
        break;
      case 'track':
        newActiveTab = 'track';
        targetPath = AppRoutes.track();
        break;
      case 'support':
        newActiveTab = 'support';
        targetPath = AppRoutes.support();
        break;
      case 'admin':
        newActiveTab = 'admin';
        targetPath = AppRoutes.admin();
        break;
      case 'gst-input-credit':
        newActiveTab = 'gst-input-credit';
        targetPath = AppRoutes.gstInputCredit();
        break;
      case 'b2b':
      case 'b2b-overview':
        newActiveTab = 'b2b';
        setB2bTab('overview');
        targetPath = AppRoutes.b2bOverview();
        break;
      case 'b2b-deals':
        newActiveTab = 'b2b';
        setB2bTab('deals');
        targetPath = AppRoutes.b2bDeals();
        break;
      case 'wholesale-catalog':
        newActiveTab = 'b2b';
        setB2bTab('catalog');
        targetPath = AppRoutes.b2bCatalog();
        break;
      case 'rfq':
        newActiveTab = 'b2b';
        setB2bTab('rfq');
        targetPath = AppRoutes.b2bRfq();
        break;
      case 'business-dashboard':
        newActiveTab = 'b2b';
        setB2bTab('dashboard');
        targetPath = AppRoutes.b2bDashboard();
        break;
      case 'b2b-cart':
        newActiveTab = 'b2b';
        setB2bTab('cart');
        targetPath = AppRoutes.b2bCart();
        break;
      case 'b2b-checkout':
        newActiveTab = 'checkout';
        setIsB2BCheckout(true);
        targetPath = AppRoutes.b2bCheckout();
        break;
      case 'business-login':
        newActiveTab = 'b2b';
        setB2bTab('overview');
        handleOpenB2BAuth('login');
        return;
      case 'business-register':
        newActiveTab = 'b2b';
        setB2bTab('overview');
        handleOpenB2BAuth('register');
        return;
      case 'login':
        handleOpenAuth('login');
        return;
      case 'register':
        handleOpenAuth('register');
        return;
      case 'cart':
        newActiveTab = 'cart';
        targetPath = AppRoutes.cart();
        break;
      case 'checkout':
        newActiveTab = 'checkout';
        targetPath = isB2BCheckout ? AppRoutes.b2bCheckout() : AppRoutes.checkout();
        break;
      case 'orders':
        newActiveTab = 'orders';
        targetPath = AppRoutes.orders();
        break;
      case 'wishlist':
        newActiveTab = 'wishlist';
        targetPath = AppRoutes.wishlist();
        break;
      case 'account':
        newActiveTab = 'account';
        targetPath = AppRoutes.account();
        break;
      case 'terms':
        newActiveTab = 'terms';
        targetPath = AppRoutes.terms();
        break;
      case 'privacy':
        newActiveTab = 'privacy';
        targetPath = AppRoutes.privacy();
        break;
      case 'refund':
        newActiveTab = 'refund';
        targetPath = AppRoutes.refund();
        break;
      case 'shipping':
        newActiveTab = 'shipping';
        targetPath = AppRoutes.shipping();
        break;
      case 'search':
        newActiveTab = 'search';
        targetPath = AppRoutes.search(searchQuery);
        break;
      case 'select':
        newActiveTab = 'select';
        targetPath = selectedProduct ? AppRoutes.product(selectedProduct) : '/shop';
        break;
      case 'init':
      case 'confirm':
      case 'status':
      case 'cancel':
      case 'update':
      case 'rating':
        newActiveTab = tab;
        targetPath = `/${tab}`;
        break;
      default:
        newActiveTab = tab.replace(/^\//, '');
        targetPath = tab.startsWith('/') ? tab : `/${tab}`;
    }

    setActiveTab(newActiveTab);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleSetB2bTab = (subtab: string) => {
    setB2bTab(subtab);
    setActiveTab('b2b');
    let targetPath = AppRoutes.b2bOverview();
    if (subtab === 'catalog') targetPath = AppRoutes.b2bCatalog();
    else if (subtab === 'rfq') targetPath = AppRoutes.b2bRfq();
    else if (subtab === 'dashboard') targetPath = AppRoutes.b2bDashboard();
    else if (subtab === 'deals') targetPath = AppRoutes.b2bDeals();
    else if (subtab === 'cart') targetPath = AppRoutes.b2bCart();
    else if (subtab === 'stories') targetPath = AppRoutes.b2bStories();
    else if (subtab === 'certifications') targetPath = AppRoutes.b2bCompliance();

    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
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
    const targetPath = AppRoutes.product(p);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
    setActiveTab('select');
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    if (activeTab === 'select') {
      handleSetActiveTab('shop');
    }
  };

  const handleOpenStory = (story: GalleryStory) => {
    setSelectedStory(story);
    const targetPath = AppRoutes.story(story);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
    const fallback = activeTab === 'b2b' ? AppRoutes.b2bStories() : AppRoutes.successStories();
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/story/') || window.location.search.includes('story='))) {
      window.history.pushState(null, '', fallback);
    }
  };

  const handleOpenCertificate = (cert: CompanyCertification) => {
    setSelectedCertificate(cert);
    const targetPath = AppRoutes.certification(cert);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  const handleCloseCertificate = () => {
    setSelectedCertificate(null);
    const fallback = activeTab === 'b2b' ? AppRoutes.b2bCompliance() : AppRoutes.certifications();
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/certification/') || window.location.search.includes('cert='))) {
      window.history.pushState(null, '', fallback);
    }
  };

  const handleB2BBuyNow = (p: Product) => {
    addToB2BCart(p.id, p.b2bMoq || 1);
    if (role !== 'b2b' || !b2bBusiness) {
      handleOpenB2BAuth('login');
      return;
    }
    setIsB2BCheckout(true);
    handleSetActiveTab('checkout');
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
    handleSetActiveTab('checkout');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    const target = mode === 'register' ? AppRoutes.register() : AppRoutes.login();
    if (typeof window !== 'undefined' && window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
    if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
      const canonical = getCanonicalUrl(activeTab, b2bTab);
      window.history.pushState(null, '', canonical);
    }
  };

  const handleOpenB2BAuth = (mode: 'login' | 'register' = 'login') => {
    setB2bAuthMode(mode);
    setB2bAuthModalOpen(true);
    const target = mode === 'register' ? AppRoutes.b2bRegister() : AppRoutes.b2bLogin();
    if (typeof window !== 'undefined' && window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  };

  const handleCloseB2BAuth = () => {
    setB2bAuthModalOpen(false);
    if (typeof window !== 'undefined' && (window.location.pathname === '/business-login' || window.location.pathname === '/business-register')) {
      const canonical = getCanonicalUrl(activeTab, b2bTab);
      window.history.pushState(null, '', canonical);
    }
  };

  const handleOpenAdminAuth = (mode: 'login' | 'register' = 'login') => {
    setAdminAuthMode(mode);
    setAdminAuthModalOpen(true);
    const target = mode === 'register' ? AppRoutes.adminRegister() : AppRoutes.adminLogin();
    if (typeof window !== 'undefined' && window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  };

  const handleCloseAdminAuth = () => {
    setAdminAuthModalOpen(false);
    if (typeof window !== 'undefined' && (window.location.pathname === '/admin/login' || window.location.pathname === '/admin/register')) {
      window.history.pushState(null, '', AppRoutes.admin());
    }
  };

  const handleOpenPolicyModal = (type: 'privacy' | 'terms' | 'shipping' | 'refund') => {
    setPolicyModalType(type);
    const target = `/${type}`;
    if (typeof window !== 'undefined' && window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  };

  const handleClosePolicyModal = () => {
    setPolicyModalType(null);
    if (typeof window !== 'undefined' && ['/privacy', '/terms', '/shipping', '/refund'].includes(window.location.pathname)) {
      const canonical = getCanonicalUrl(activeTab, b2bTab);
      window.history.pushState(null, '', canonical);
    }
  };

  const handleOpenRfqModal = (p: Product) => {
    setRfqTargetProduct(p);
    handleSetB2bTab('rfq');
  };

  const handleOrderSuccess = (order: B2COrder) => {
    refreshData();
    const targetPath = AppRoutes.confirm(order.orderNumber || order.id);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', targetPath);
    }
    setActiveTab('confirm');
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header Rendering Logic */}
      {activeTab === 'admin' ? null : activeTab === 'b2b' ? (
        <B2BNavbar
          b2bTab={b2bTab}
          setB2bTab={handleSetB2bTab}
          setActiveTab={handleSetActiveTab}
          onSwitchToB2C={() => handleSetActiveTab('home')}
          openB2BAuthModal={(mode) => handleOpenB2BAuth(mode || 'login')}
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
              const target = AppRoutes.category(cat);
              if (typeof window !== 'undefined' && window.location.pathname !== target) {
                window.history.pushState(null, '', target);
              }
              setActiveTab('products');
            }}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            setActiveTab={handleSetActiveTab}
            openB2BAuthModal={() => handleOpenB2BAuth('register')}
            onOpenStory={handleOpenStory}
            onOpenCertificate={handleOpenCertificate}
            onNavigateToShop={handleNavigateToShop}
          />
        )}

        {activeTab === 'stories' && (
          <SuccessStoriesPage
            onOpenStory={handleOpenStory}
          />
        )}

        {activeTab === 'certifications' && (
          <CertificationsPage
            onOpenCertificate={handleOpenCertificate}
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
            onCategoryChange={(cat) => {
              setSelectedCategory(cat);
              const target = AppRoutes.category(cat);
              if (typeof window !== 'undefined' && window.location.pathname !== target) {
                window.history.pushState(null, '', target);
              }
            }}
          />
        )}

        {activeTab === 'deals' && (
          <ProductListingPage
            key="deals"
            products={products}
            categories={categories}
            initialCategory="All"
            initialSearch=""
            onlyDeals={true}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            isShopNowView={true}
          />
        )}

        {activeTab === 'gst-input-credit' && (
          <GstInputCreditPage
            setActiveTab={handleSetActiveTab}
            openB2BAuth={(m) => handleOpenB2BAuth(m || 'login')}
            openAuth={(m) => handleOpenAuth(m || 'login')}
          />
        )}

        {activeTab === 'internships' && (
          <InternshipsPage
            setActiveTab={handleSetActiveTab}
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
                handleSetActiveTab('checkout');
              }
            }}
            setActiveTab={handleSetActiveTab}
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
              handleSetB2bTab('dashboard');
            }}
            onBackToCart={() => {
              if (isB2BCheckout) {
                handleSetB2bTab('cart');
              } else {
                handleSetActiveTab('cart');
              }
            }}
            onOpenAuth={handleOpenAuth}
            onOpenB2BAuth={handleOpenB2BAuth}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersPage
            orders={b2cOrders}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistPage
            products={products}
            onOpenProduct={handleOpenProduct}
            onBuyNow={handleBuyNow}
            setActiveTab={handleSetActiveTab}
          />
        )}

        {activeTab === 'account' && (
          <CustomerDashboardPage
            orders={b2cOrders}
            setActiveTab={handleSetActiveTab}
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
                setB2bTab={handleSetB2bTab}
                openB2BAuthModal={() => handleOpenB2BAuth('login')}
                onOpenProduct={handleOpenProduct}
                onOpenStory={handleOpenStory}
                onOpenCertificate={handleOpenCertificate}
              />
            )}

            {b2bTab === 'catalog' && (
              <B2BCatalogPage
                products={products}
                categories={categories}
                onOpenProduct={handleOpenProduct}
                openB2BAuthModal={() => handleOpenB2BAuth('login')}
                onOpenRfqModal={handleOpenRfqModal}
                onBuyNow={handleB2BBuyNow}
              />
            )}

            {b2bTab === 'deals' && (
              <B2BCatalogPage
                products={products}
                categories={categories}
                onlyDeals={true}
                onOpenProduct={handleOpenProduct}
                openB2BAuthModal={() => handleOpenB2BAuth('login')}
                onOpenRfqModal={handleOpenRfqModal}
                onBuyNow={handleB2BBuyNow}
              />
            )}

            {b2bTab === 'rfq' && (
              <B2BRFQPage
                products={products}
                selectedProduct={rfqTargetProduct}
                onSuccess={refreshData}
                setB2bTab={handleSetB2bTab}
                openB2BAuthModal={() => handleOpenB2BAuth('login')}
              />
            )}

            {b2bTab === 'dashboard' && (
              <B2BDashboardPage
                b2bOrders={b2bOrders}
                quotations={quotations}
                onRefresh={refreshData}
                setB2bTab={handleSetB2bTab}
                openB2BAuthModal={(m) => handleOpenB2BAuth(m || 'login')}
              />
            )}

            {b2bTab === 'cart' && (
              <B2BCartPage
                products={products}
                onProceedToCheckout={() => {
                  setIsB2BCheckout(true);
                  handleSetActiveTab('b2b-checkout');
                }}
                setB2bTab={handleSetB2bTab}
                onOpenProduct={handleOpenProduct}
                openB2BAuthModal={() => handleOpenB2BAuth('login')}
                onRfqCreated={() => {
                  refreshData();
                  handleSetB2bTab('dashboard');
                }}
              />
            )}

            {b2bTab === 'stories' && (
              <B2BSuccessStoriesPage
                onOpenStory={handleOpenStory}
              />
            )}

            {b2bTab === 'certifications' && (
              <B2BCertificationsPage
                onOpenCertificate={handleOpenCertificate}
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

      {/* 2.5. Official Platforms & Ecosystem Partners Section (Immediately Above Main Footer) */}
      {activeTab !== 'admin' && (
        <PartnerCarousel />
      )}

      {/* 3. Footer Rendering */}
      {activeTab !== 'admin' && (
        <Footer
          setActiveTab={handleSetActiveTab}
          setB2bTab={handleSetB2bTab}
          openPolicyModal={(type) => handleOpenPolicyModal(type)}
          isB2B={activeTab === 'b2b'}
          onNavigateToShop={handleNavigateToShop}
        />
      )}

      {/* 4. Modals */}
      {selectedStory && (
        <StoryDetailModal
          story={selectedStory}
          onClose={handleCloseStory}
          onSelectStory={handleOpenStory}
          isB2BMode={activeTab === 'b2b'}
        />
      )}

      {selectedCertificate && (
        <CertificateDetailModal
          cert={selectedCertificate}
          onClose={handleCloseCertificate}
          isB2BMode={activeTab === 'b2b'}
        />
      )}

      {selectedProduct && activeTab !== 'select' && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={handleCloseProduct}
          onBuyNow={handleBuyNow}
          onRequestQuote={(p) => handleOpenRfqModal(p)}
          isB2BMode={activeTab === 'b2b'}
        />
      )}

      {authModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          onClose={handleCloseAuth}
        />
      )}

      {b2bAuthModalOpen && (
        <B2BAuthModal
          initialMode={b2bAuthMode}
          onClose={handleCloseB2BAuth}
          onSuccess={() => {
            refreshData();
            setActiveTab('b2b');
            handleSetB2bTab('dashboard');
          }}
        />
      )}

      {policyModalType && (
        <PolicyModal
          type={policyModalType}
          onClose={handleClosePolicyModal}
          onOpenFullPage={(type) => {
            setPolicyModalType(null);
            handleSetActiveTab(type);
          }}
        />
      )}

      {adminAuthModalOpen && (
        <AdminAuthModal
          initialMode={adminAuthMode}
          onClose={handleCloseAdminAuth}
          onSuccess={() => {
            refreshData();
            handleSetActiveTab('admin');
          }}
        />
      )}

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

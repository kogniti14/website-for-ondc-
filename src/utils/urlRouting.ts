/**
 * KOGNITI MINDS — Central Client-Side URL Routing System
 * Maps every page, section, category, product, and modal to a meaningful, canonical URL.
 * Supports direct deep links, browser back/forward navigation, and seamless state hydration.
 */

import { Product, Category, GalleryStory, CompanyCertification } from '../types';

/**
 * Convert string into clean, URL-safe slug
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, 'and') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Route URL Builders
 */
export const AppRoutes = {
  // Storefront & Consumer Routes
  home: () => '/',
  shop: () => '/shop',
  products: () => '/products',
  category: (catName: string) => (catName === 'All' ? '/products' : `/category/${slugify(catName)}`),
  product: (product: { id: string; slug?: string } | string) => {
    const idOrSlug = typeof product === 'string' ? product : product.slug || product.id;
    return `/product/${idOrSlug}`;
  },
  deals: () => '/deals',
  newArrivals: () => '/new-arrivals',
  successStories: () => '/success-stories',
  story: (story: { id: string; slug?: string } | string) => {
    const idOrSlug = typeof story === 'string' ? story : story.slug || story.id;
    return `/story/${idOrSlug}`;
  },
  certifications: () => '/certifications',
  certification: (cert: { id: string; slug?: string } | string) => {
    const idOrSlug = typeof cert === 'string' ? cert : cert.slug || cert.id;
    return `/certification/${idOrSlug}`;
  },
  cart: () => '/cart',
  checkout: () => '/checkout',
  orders: () => '/orders',
  wishlist: () => '/wishlist',
  account: () => '/account',
  track: () => '/track',
  support: (method?: 'phone' | 'whatsapp') => (method ? `/support?method=${method}` : '/support'),
  gstInputCredit: () => '/gst-input-credit',
  internships: () => '/internships',
  careers: () => '/internships',
  search: (q?: string) => (q && q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search'),

  // Auth Routes
  login: () => '/login',
  register: () => '/register',

  // Policies
  terms: () => '/terms',
  privacy: () => '/privacy',
  refund: () => '/refund',
  shipping: () => '/shipping',

  // Protocol Customer Route Aliases
  cancel: () => '/cancel',
  rating: () => '/rating',
  status: () => '/status',
  confirm: (orderId?: string) => (orderId ? `/confirm?orderId=${encodeURIComponent(orderId)}` : '/confirm'),
  init: () => '/init',
  update: () => '/update',

  // B2B Enterprise Portal Routes
  b2bOverview: () => '/b2b-overview',
  b2bCatalog: () => '/wholesale-catalog',
  b2bDeals: () => '/b2b-deals',
  b2bRfq: () => '/rfq',
  b2bDashboard: () => '/business-dashboard',
  b2bCart: () => '/b2b-cart',
  b2bCheckout: () => '/b2b-checkout',
  b2bLogin: () => '/business-login',
  b2bRegister: () => '/business-register',
  b2bStories: () => '/b2b-stories',
  b2bCompliance: () => '/b2b-compliance',

  // Admin Routes
  admin: () => '/admin',
  adminLogin: () => '/admin/login',
  adminRegister: () => '/admin/register',
  adminOndc: (sub?: string) => (sub ? `/admin/ondc/${sub}` : '/admin/ondc'),
};

export interface ParsedRoute {
  pathname: string;
  activeTab: string;
  b2bTab: string | null;
  productId: string | null;
  categoryName: string | null;
  storyId: string | null;
  certificateId: string | null;
  authModal: 'login' | 'register' | null;
  b2bAuthModal: 'login' | 'register' | null;
  adminAuthModal: 'login' | 'register' | null;
  isB2BCheckout: boolean;
  searchQuery: string | null;
  policyType: 'terms' | 'privacy' | 'refund' | 'shipping' | null;
}

/**
 * Parse current browser URL and return state actions
 */
export function parseCurrentRoute(
  categoriesList: Category[] = [],
  productsList: Product[] = []
): ParsedRoute {
  if (typeof window === 'undefined') {
    return {
      pathname: '/',
      activeTab: 'home',
      b2bTab: null,
      productId: null,
      categoryName: null,
      storyId: null,
      certificateId: null,
      authModal: null,
      b2bAuthModal: null,
      adminAuthModal: null,
      isB2BCheckout: false,
      searchQuery: null,
      policyType: null,
    };
  }

  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const hash = (window.location.hash || '').replace('#', '').toLowerCase();

  const result: ParsedRoute = {
    pathname,
    activeTab: 'home',
    b2bTab: null,
    productId: null,
    categoryName: null,
    storyId: null,
    certificateId: null,
    authModal: null,
    b2bAuthModal: null,
    adminAuthModal: null,
    isB2BCheckout: false,
    searchQuery: searchParams.get('q'),
    policyType: null,
  };

  // 1. Admin & Protocol Explorer
  if (pathname.startsWith('/admin')) {
    result.activeTab = 'admin';
    if (pathname === '/admin/login') {
      result.adminAuthModal = 'login';
    } else if (pathname === '/admin/register') {
      result.adminAuthModal = 'register';
    }
    return result;
  }
  if (pathname.startsWith('/on_')) {
    result.activeTab = 'admin';
    return result;
  }

  // 2. Product Detail Routes: /product/:idOrSlug or /select?productId=:id
  if (pathname.startsWith('/product/') || pathname === '/select') {
    result.activeTab = 'select';
    let targetIdOrSlug = '';
    if (pathname.startsWith('/product/')) {
      targetIdOrSlug = decodeURIComponent(pathname.replace(/^\/product\//, '').replace(/\/$/, ''));
    } else {
      targetIdOrSlug = searchParams.get('productId') || '';
    }
    result.productId = targetIdOrSlug;
    return result;
  }

  // 3. Category Routes: /category/:categorySlug or /products?category=...
  if (pathname.startsWith('/category/')) {
    result.activeTab = 'products';
    const catSlug = decodeURIComponent(pathname.replace(/^\/category\//, '').replace(/\/$/, ''));
    const matched = categoriesList.find(
      (c) =>
        (c.slug && c.slug.toLowerCase() === catSlug) ||
        slugify(c.name) === catSlug ||
        c.id.toLowerCase() === catSlug ||
        c.name.toLowerCase() === catSlug.replace(/-/g, ' ')
    );
    result.categoryName = matched ? matched.name : catSlug.replace(/-/g, ' ');
    return result;
  }

  // 4. Story Detail Routes: /story/:storyId or /success-stories?story=...
  if (pathname.startsWith('/story/')) {
    result.activeTab = 'stories';
    result.storyId = decodeURIComponent(pathname.replace(/^\/story\//, '').replace(/\/$/, ''));
    return result;
  }

  // 5. Certification Detail Routes: /certification/:certId or /certifications?cert=...
  if (pathname.startsWith('/certification/')) {
    result.activeTab = 'certifications';
    result.certificateId = decodeURIComponent(pathname.replace(/^\/certification\//, '').replace(/\/$/, ''));
    return result;
  }

  // 6. B2B Enterprise Portal Routes
  if (pathname === '/b2b' || pathname === '/b2b-overview' || pathname === '/b2b/overview') {
    result.activeTab = 'b2b';
    result.b2bTab = 'overview';
    return result;
  }
  if (pathname === '/wholesale-catalog' || pathname === '/b2b/catalog' || pathname === '/b2b-catalog') {
    result.activeTab = 'b2b';
    result.b2bTab = 'catalog';
    return result;
  }
  if (pathname === '/b2b-deals' || pathname === '/b2b/deals') {
    result.activeTab = 'b2b';
    result.b2bTab = 'deals';
    return result;
  }
  if (pathname === '/rfq' || pathname === '/b2b/rfq' || pathname === '/b2b-rfq') {
    result.activeTab = 'b2b';
    result.b2bTab = 'rfq';
    return result;
  }
  if (pathname === '/business-dashboard' || pathname === '/b2b/dashboard' || pathname === '/b2b-dashboard') {
    result.activeTab = 'b2b';
    result.b2bTab = 'dashboard';
    return result;
  }
  if (pathname === '/b2b-cart' || pathname === '/b2b/cart') {
    result.activeTab = 'b2b';
    result.b2bTab = 'cart';
    return result;
  }
  if (pathname === '/b2b-checkout') {
    result.activeTab = 'checkout';
    result.isB2BCheckout = true;
    return result;
  }
  if (pathname === '/business-login' || pathname === '/b2b/login') {
    result.activeTab = 'b2b';
    result.b2bTab = 'overview';
    result.b2bAuthModal = 'login';
    return result;
  }
  if (pathname === '/business-register' || pathname === '/b2b/register') {
    result.activeTab = 'b2b';
    result.b2bTab = 'overview';
    result.b2bAuthModal = 'register';
    return result;
  }
  if (pathname === '/b2b-stories' || pathname === '/b2b/stories') {
    result.activeTab = 'b2b';
    result.b2bTab = 'stories';
    return result;
  }
  if (pathname === '/b2b-compliance' || pathname === '/b2b/certifications' || pathname === '/b2b-certifications') {
    result.activeTab = 'b2b';
    result.b2bTab = 'certifications';
    return result;
  }

  // 7. Auth Routes
  if (pathname === '/login') {
    result.authModal = 'login';
    return result;
  }
  if (pathname === '/register') {
    result.authModal = 'register';
    return result;
  }

  // 8. Main Storefront Routes
  if (pathname === '/shop') {
    result.activeTab = 'shop';
    return result;
  }
  if (pathname === '/products') {
    result.activeTab = 'products';
    const catQuery = searchParams.get('category');
    if (catQuery) {
      result.categoryName = catQuery;
    }
    return result;
  }
  if (pathname === '/deals' || pathname === '/offers') {
    result.activeTab = 'deals';
    return result;
  }
  if (pathname === '/new-arrivals' || pathname === '/innovations') {
    result.activeTab = 'new-arrivals';
    return result;
  }
  if (pathname === '/success-stories' || pathname === '/stories') {
    result.activeTab = 'stories';
    const storyQuery = searchParams.get('story') || searchParams.get('id');
    if (storyQuery) result.storyId = storyQuery;
    return result;
  }
  if (pathname === '/certifications' || pathname === '/certifications-compliance' || pathname === '/compliance') {
    result.activeTab = 'certifications';
    const certQuery = searchParams.get('cert') || searchParams.get('id');
    if (certQuery) result.certificateId = certQuery;
    return result;
  }
  if (pathname === '/cart') {
    result.activeTab = 'cart';
    return result;
  }
  if (pathname === '/checkout') {
    result.activeTab = 'checkout';
    result.isB2BCheckout = searchParams.get('mode') === 'b2b';
    return result;
  }
  if (pathname === '/orders' || pathname === '/my-orders') {
    result.activeTab = 'orders';
    return result;
  }
  if (pathname === '/wishlist' || pathname === '/my-wishlist') {
    result.activeTab = 'wishlist';
    return result;
  }
  if (pathname === '/account' || pathname === '/my-account' || pathname === '/customer-dashboard') {
    result.activeTab = 'account';
    return result;
  }
  if (pathname === '/track' || pathname === '/track-order' || pathname === '/tracking') {
    result.activeTab = 'track';
    return result;
  }
  if (pathname === '/support' || pathname === '/contact' || pathname === '/help') {
    result.activeTab = 'support';
    return result;
  }
  if (pathname === '/gst-input-credit' || pathname === '/gst-credit' || pathname === '/itc-calculator') {
    result.activeTab = 'gst-input-credit';
    return result;
  }
  if (pathname === '/internships' || pathname === '/careers' || pathname === '/internship-opportunities') {
    result.activeTab = 'internships';
    return result;
  }
  if (pathname === '/search') {
    result.activeTab = 'search';
    return result;
  }

  // 9. Policies & Legal Pages
  if (pathname === '/terms' || pathname === '/terms-and-conditions') {
    result.activeTab = 'terms';
    result.policyType = 'terms';
    return result;
  }
  if (pathname === '/privacy' || pathname === '/privacy-policy') {
    result.activeTab = 'privacy';
    result.policyType = 'privacy';
    return result;
  }
  if (pathname === '/refund' || pathname === '/refund-policy') {
    result.activeTab = 'refund';
    result.policyType = 'refund';
    return result;
  }
  if (pathname === '/shipping' || pathname === '/shipping-policy') {
    result.activeTab = 'shipping';
    result.policyType = 'shipping';
    return result;
  }

  // 10. Customer Protocol Flow Routes
  if (['/init', '/confirm', '/status', '/cancel', '/update', '/rating'].includes(pathname)) {
    result.activeTab = pathname.slice(1);
    return result;
  }

  // 11. Hash Fallback
  if (hash && ['terms', 'privacy', 'refund', 'shipping', 'new-arrivals', 'certifications', 'stories', 'shop', 'products', 'b2b', 'admin', 'deals'].includes(hash)) {
    result.activeTab = hash;
    return result;
  }

  // Fallback to Home
  result.activeTab = 'home';
  return result;
}

/**
 * Client-Side Router Navigation Function
 * Updates URL via history.pushState and emits popstate event so listeners update state cleanly.
 */
export function navigateTo(targetPath: string, options: { replace?: boolean } = {}) {
  if (typeof window === 'undefined') return;

  const currentPathWithSearch = window.location.pathname + window.location.search + window.location.hash;
  if (currentPathWithSearch === targetPath) {
    return;
  }

  if (options.replace) {
    window.history.replaceState(null, '', targetPath);
  } else {
    window.history.pushState(null, '', targetPath);
  }

  // Dispatch popstate event to trigger state synchronization across components
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * KOGNITI MINDS - Components Module Barrel Export
 *
 * Centralizes primary layout, common UI, and modal component exports.
 */

// Layout Components
export { Navbar } from './layout/Navbar';
export { B2BNavbar } from './layout/B2BNavbar';
export { Footer } from './layout/Footer';

// Common Components
export { PolicyModal } from './common/PolicyModal';
export { WhatsAppFloatingButton } from './common/WhatsAppFloatingButton';
export { OrderInvoiceModal } from './common/OrderInvoiceModal';
export { ImageUpload } from './common/ImageUpload';
export { RoleSwitcher } from './common/RoleSwitcher';

// Auth Modals
export { AuthModal } from './auth/AuthModal';
export { B2BAuthModal } from './auth/B2BAuthModal';
export { AdminAuthModal } from './auth/AdminAuthModal';
export { UnregisteredUserModal } from './auth/UnregisteredUserModal';

// Product Components
export { ProductCard } from './products/ProductCard';
export { ProductDetailModal } from './products/ProductDetailModal';

// Payment Components
export { RazorpayCheckoutModal } from './payment/RazorpayCheckoutModal';

// B2B Modals
export { B2BInvoiceModal } from './b2b/B2BInvoiceModal';

/**
 * KOGNITI MINDS - Centralized API & Live Production Synchronizer
 *
 * Guarantees:
 * - Super Admin mutations (products, categories, banners, certificates, stories, coupons, settings)
 *   are NEVER trapped in localhost or single-client localStorage.
 * - When in production (kognitiminds.com), calls to '/api/data.php' execute natively on Hostinger LiteSpeed.
 * - When in local development (localhost / 127.0.0.1):
 *   Super Admin updates are dispatched DIRECTLY to live production (https://www.kognitiminds.com/api/data.php),
 *   as well as mirrored to Firebase Realtime Database.
 * - Every single visitor, customer, and browser across all devices sees live production data immediately.
 */

export const LIVE_PRODUCTION_ORIGIN = 'https://www.kognitiminds.com';

export const isLiveProductionHost = (): boolean => {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname.toLowerCase();
  return host === 'kognitiminds.com' || host === 'www.kognitiminds.com';
};

export const isLocalhost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
};

/**
 * Resolves the target API URL for server calls.
 * If running on localhost/staging, targets the authoritative LIVE PRODUCTION domain directly.
 */
export const getProductionApiUrl = (endpoint: string): string => {
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (isLiveProductionHost()) {
    return clean;
  }
  return `${LIVE_PRODUCTION_ORIGIN}${clean}`;
};

/**
 * Universal Super Admin authentication headers
 */
export const getAdminAuthHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Authorization': 'Bearer super_admin',
    'X-Admin-Role': 'super_admin',
  };
};

/**
 * Universal Super Admin query parameter for server dispatchers
 */
export const getAdminQueryParam = (): string => {
  return 'admin_role=super_admin';
};

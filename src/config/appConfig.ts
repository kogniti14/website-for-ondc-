/**
 * KOGNITI MINDS PRIVATE LIMITED - Centralized Application Configuration
 *
 * Single Source of Truth for brand constants, operational parameters,
 * API endpoint mappings, and timing constraints across the platform.
 *
 * Ownership: Core Architecture & Platform Engineering
 */

export const APP_CONFIG = {
  // Brand & Corporate Metadata
  company: {
    legalName: 'Kogniti Minds Private Limited',
    shortName: 'Kogniti Minds',
    tagline: 'Sustainable Agri-Waste Paper & Modern E-Commerce Platform',
    domain: 'kognitiminds.com',
    productionUrl: 'https://kognitiminds.com',
    supportEmail: 'support@kognitiminds.com',
    securityEmail: 'security@kognitiminds.com',
    ceoEmail: 'kogniti14@kognitiminds.com',
    defaultFromEmail: 'Kogniti Minds Security <security@kognitiminds.com>',
  },

  // Security & Authentication Timing
  auth: {
    otpLength: 6,
    otpExpiryMinutes: 10,
    otpExpiryMs: 10 * 60 * 1000,
    resendCooldownSeconds: 10,
    resendCooldownMs: 10 * 1000,
    maxVerifyAttempts: 5,
  },

  // API Endpoints
  endpoints: {
    health: '/api/health',
    healthPhp: '/api/health.php',
    authSendOtp: '/api/auth/send-otp',
    sendEmailPhp: '/api/send-email.php',
    resend: '/api/resend',
    dataStore: '/api/data',
    dataStorePhp: '/api/data.php',
    paymentCreateOrder: '/api/payment/create-order',
    paymentVerify: '/api/payment/verify',
  },

  // Storage Collection Names (Dual-Tier Persistence)
  collections: {
    products: 'products',
    categories: 'categories',
    b2cUsers: 'b2c_users',
    b2bBusinesses: 'b2b_businesses',
    b2cOrders: 'b2c_orders',
    b2bOrders: 'b2b_orders',
    b2bQuotations: 'b2b_quotations',
    adminUsers: 'admin_users',
    coupons: 'coupons',
    settings: 'settings',
  },

  // ONDC Protocol Specifications
  ondc: {
    version: '1.2.0',
    domain: 'ONDC:RETeB2B',
    subscriberId: 'kognitiminds.com',
    registryUrl: 'https://preprod.registry.ondc.org/ondc',
  },

  // Business Defaults
  business: {
    defaultCurrency: 'INR',
    currencySymbol: '₹',
    defaultGstPercent: 18,
    b2cFreeShippingThreshold: 500,
    b2cStandardShippingFee: 49,
  },
} as const;

export default APP_CONFIG;

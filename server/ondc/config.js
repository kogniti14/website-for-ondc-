/**
 * ONDC eB2B (ONDC:RETeB2B) Configuration Service
 * Kogniti Minds Private Limited
 */

export const ondcConfig = {
  env: (process.env.ONDC_ENV || 'preprod').toLowerCase(),
  port: parseInt(process.env.PORT || '3000', 10),
  
  // ONDC Network Identifiers
  subscriberId: process.env.ONDC_SUBSCRIBER_ID || 'kognitiminds.com',
  subscriberUri: process.env.ONDC_SUBSCRIBER_URI || 'https://kognitiminds.com',
  domain: process.env.ONDC_REGISTRY_DOMAIN || 'ONDC:RETeB2B',
  city: process.env.ONDC_CITY || 'std:080',
  country: process.env.ONDC_COUNTRY || 'IND',
  coreVersion: process.env.ONDC_CORE_VERSION || '1.2.5',
  
  // ONDC Workbench / Buyer App Callback Destination
  buyerBaseUrl: process.env.ONDC_BUYER_BASE_URL || 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer',
  
  // Cryptographic Keys (Ed25519 Signing & X25519 Encryption)
  keyId: process.env.ONDC_KEY_ID || 'kogniti-key-01',
  privateKey: (process.env.ONDC_PRIVATE_KEY || '').trim(),
  publicKey: (process.env.ONDC_PUBLIC_KEY || '').trim(),
  encrPrivateKey: (process.env.ONDC_ENCRYPTION_PRIVATE_KEY || '').trim(),
  encrPublicKey: (process.env.ONDC_ENCRYPTION_PUBLIC_KEY || '').trim(),
  
  // Registry Endpoints
  registryUrl: process.env.ONDC_REGISTRY_URL || 
    (process.env.ONDC_ENV === 'prod' 
      ? 'https://prod.registry.ondc.org/ondc' 
      : 'https://preprod.registry.ondc.org/ondc'),

  // Seller Details for Kogniti Minds
  seller: {
    id: 'kogniti-minds-bpp',
    name: 'KOGNITI MINDS PRIVATE LIMITED',
    shortDesc: 'Sustainable, Agri-Waste & Tree-Free Paper Manufacturer & Institutional Supplier',
    longDesc: 'Kogniti Minds manufactures premium sustainable copy paper and enterprise stationery crafted from upcycled agricultural crop residues (wheat straw, sugarcane bagasse, paddy stalks) to eliminate stubble burning and prevent deforestation.',
    cin: 'U21098DL2024PTC123456',
    gstin: process.env.SELLER_GSTIN || '07AABCK1234F1Z5',
    pan: process.env.SELLER_PAN || 'AABCK1234F',
    email: 'contact@kognitiminds.com',
    supportEmail: 'support@kognitiminds.com',
    phone: '+91 98111 22334',
    address: {
      street: 'Kogniti Corporate Towers, Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      country: 'IND'
    }
  },

  /**
   * Check if live cryptographic signing credentials are provided
   */
  hasKeys() {
    return Boolean(this.privateKey && this.publicKey);
  },

  /**
   * Return safe, sanitized configuration for health check & debugging (NO SECRETS)
   */
  getSanitized() {
    return {
      domain: this.domain,
      environment: this.env,
      subscriberId: this.subscriberId,
      subscriberUri: this.subscriberUri,
      keyId: this.keyId,
      hasSigningKeys: this.hasKeys(),
      hasEncryptionKeys: Boolean(this.encrPrivateKey && this.encrPublicKey),
      coreVersion: this.coreVersion,
      registryUrl: this.registryUrl,
      sellerName: this.seller.name,
      status: 'active'
    };
  }
};

export default ondcConfig;

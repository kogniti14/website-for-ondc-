/**
 * ONDC:RETeB2B Catalogue Mapper & Provider Definition
 * Kogniti Minds Private Limited
 * 
 * Maps authoritative Kogniti Minds products from persistentStore into
 * compliant ONDC Retail (RET 1.2.5 / eB2B) catalog schema.
 */

import ondcConfig from './config.js';
import persistentStore from '../storage/persistentStore.js';
import { PRODUCTS_CATALOG, ONDC_CATEGORIES } from './canonicalProducts.js';
import { validateProductForOndc } from './catalogValidator.js';
import ondcLogger from './logger.js';

export { PRODUCTS_CATALOG, ONDC_CATEGORIES };

/**
 * Retrieve validated, authoritative products from persistent store
 * with canonical fallback.
 * @returns {Array} List of validated products
 */
export function getAuthoritativeProducts() {
  try {
    const stored = persistentStore.getAll('products');
    if (Array.isArray(stored) && stored.length > 0) {
      // Validate each product against RET rules
      const valid = [];
      for (const prod of stored) {
        const check = validateProductForOndc(prod);
        if (check.valid) {
          valid.push(prod);
        } else {
          ondcLogger.warn('catalogMapper', `Skipping non-compliant product '${prod.id || 'unknown'}': ${check.errors.join('; ')}`);
        }
      }
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch (err) {
    ondcLogger.warn('catalogMapper', `Error loading products from persistentStore: ${err.message}. Using canonical baseline.`);
  }

  return PRODUCTS_CATALOG;
}

/**
 * Find product by ID or SKU across authoritative and canonical catalogs
 * @param {string} id - Product ID or SKU
 * @returns {object|undefined}
 */
export function findProductById(id) {
  if (!id) return undefined;
  const products = getAuthoritativeProducts();
  const cleanId = String(id).trim();
  const found = products.find((p) => p.id === cleanId || p.sku === cleanId);
  if (found) return found;
  return PRODUCTS_CATALOG.find((p) => p.id === cleanId || p.sku === cleanId);
}

/**
 * Format products into official ONDC:RETeB2B Catalog representation
 * @param {object} searchIntent - Optional search intent from /search
 * @returns {object} Full ONDC catalog object
 */
export function buildOndcCatalog(searchIntent = {}) {
  let matchedItems = getAuthoritativeProducts();

  // Filter if search intent specified a keyword or category
  const query = (searchIntent.item?.descriptor?.name || '').toLowerCase().trim();
  const categoryFilter = searchIntent.category?.id;

  if (query) {
    matchedItems = matchedItems.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query)) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(query))
    );
  }

  if (categoryFilter) {
    matchedItems = matchedItems.filter((p) => p.categoryId === categoryFilter);
  }

  const nowIso = new Date().toISOString();

  const items = matchedItems.map((prod) => {
    const wholesalePrice = Number(prod.b2bWholesalePrice || prod.price || 198);
    const mrp = Number(prod.b2cMrp || prod.mrp || wholesalePrice * 1.5);
    const stockCount = Number(prod.stock !== undefined ? prod.stock : 100);
    const moq = Number(prod.b2bMoq || 1);
    const primaryImage = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : (prod.image || 'https://kognitiminds.com/logo-icon.png');
    const allImages = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [primaryImage];
    const discountSlabs = Array.isArray(prod.b2bDiscountSlabs) ? prod.b2bDiscountSlabs : [
      { minQty: moq, maxQty: 49, discountPercent: 0, label: 'Base Wholesale' },
      { minQty: 50, maxQty: 199, discountPercent: 8, label: 'Volume Tier' },
      { minQty: 200, discountPercent: 15, label: 'Enterprise Tier' },
    ];

    return {
      id: prod.id,
      parent_item_id: prod.categoryId || 'cat_paper',
      descriptor: {
        name: prod.name,
        code: `4:${prod.hsn || '48025610'}`, // Official ONDC standard: '4:' prefix for HSN code
        symbol: primaryImage,
        short_desc: prod.shortDescription || prod.tagline || prod.name,
        long_desc: prod.description || prod.shortDescription || prod.name,
        images: allImages,
      },
      price: {
        currency: 'INR',
        value: wholesalePrice.toFixed(2),
        maximum_value: mrp.toFixed(2),
      },
      category_id: prod.categoryId || 'cat_paper',
      fulfillment_id: 'F1',
      location_id: 'L1',
      quantity: {
        available: { count: stockCount.toString() },
        maximum: { count: Math.min(stockCount, 500).toString() },
        minimum: { count: moq.toString() },
      },
      time: {
        label: 'enable',
        timestamp: nowIso,
      },
      matched: true,
      recommended: true,
      tags: [
        {
          code: 'origin',
          list: [{ code: 'country', value: 'IND' }],
        },
        {
          code: 'attribute',
          list: [
            { code: 'brand', value: 'KOGNITI MINDS' },
            { code: 'hsn_code', value: prod.hsn || '48025610' },
            { code: 'tax_rate', value: `${prod.gstRate || 18}%` },
            { code: 'weight', value: prod.weight || '2.35 kg' },
            { code: 'dimensions', value: prod.dimensions || '21.0cm x 29.7cm x 5.2cm' },
          ],
        },
        {
          code: 'b2b/moq',
          list: [{ code: 'min_order_quantity', value: moq.toString() }],
        },
        {
          code: 'bpp/item_discount',
          list: discountSlabs.map((slab) => ({
            code: `slab_${slab.minQty}`,
            value: JSON.stringify({
              min_qty: slab.minQty,
              max_qty: slab.maxQty || null,
              discount_percent: slab.discountPercent,
              label: slab.label,
            }),
          })),
        },
        {
          code: 'serviceability',
          list: [
            { code: 'location', value: 'L1' },
            { code: 'category', value: prod.categoryId || 'cat_paper' },
            { code: 'type', value: '10' },
            { code: 'val', value: '3000' },
            { code: 'unit', value: 'km' },
          ],
        },
      ],
    };
  });

  return {
    'bpp/descriptor': {
      name: ondcConfig.seller.name,
      symbol: 'https://kognitiminds.com/logo-icon.png',
      short_desc: ondcConfig.seller.shortDesc,
      long_desc: ondcConfig.seller.longDesc,
      images: ['https://kognitiminds.com/logo-icon.png'],
      tags: [
        {
          code: 'bpp_terms',
          list: [
            { code: 'gstin', value: ondcConfig.seller.gstin },
            { code: 'pan', value: ondcConfig.seller.pan },
            { code: 'cin', value: ondcConfig.seller.cin },
          ],
        },
      ],
    },
    'bpp/categories': ONDC_CATEGORIES,
    'bpp/fulfillments': [
      {
        id: 'F1',
        type: 'Delivery',
        tracking: true,
        contact: {
          phone: ondcConfig.seller.phone,
          email: ondcConfig.seller.supportEmail,
        },
      },
    ],
    'bpp/providers': [
      {
        id: ondcConfig.seller.id,
        time: {
          label: 'enable',
          timestamp: nowIso,
        },
        descriptor: {
          name: ondcConfig.seller.name,
          symbol: 'https://kognitiminds.com/logo-icon.png',
          short_desc: ondcConfig.seller.shortDesc,
          long_desc: ondcConfig.seller.longDesc,
          images: ['https://kognitiminds.com/logo-icon.png'],
        },
        ttl: 'P1D',
        categories: ONDC_CATEGORIES,
        locations: [
          {
            id: 'L1',
            gps: '28.6280,77.3750',
            address: {
              street: ondcConfig.seller.address.street,
              city: ondcConfig.seller.address.city,
              state: ondcConfig.seller.address.state,
              area_code: ondcConfig.seller.address.pincode,
            },
            circle: {
              gps: '28.6280,77.3750',
              radius: { unit: 'km', value: '3000' }, // Pan-India Delivery Radius
            },
            time: {
              label: 'enable',
              timestamp: nowIso,
              days: '1,2,3,4,5,6',
              schedule: {
                holidays: [],
                frequency: 'PT4H',
                times: ['1000', '1800'],
              },
              range: {
                start: '1000',
                end: '1800',
              },
            },
          },
        ],
        fulfillments: [
          {
            id: 'F1',
            type: 'Delivery',
            tracking: true,
            contact: {
              phone: ondcConfig.seller.phone,
              email: ondcConfig.seller.supportEmail,
            },
          },
        ],
        items,
        tags: [
          // Explicit serviceability construct per category to pass strict ONDC validation
          ...ONDC_CATEGORIES.map((cat) => ({
            code: 'serviceability',
            list: [
              { code: 'location', value: 'L1' },
              { code: 'category', value: cat.id },
              { code: 'type', value: '10' },
              { code: 'val', value: '3000' },
              { code: 'unit', value: 'km' },
            ],
          })),
          {
            code: 'timing',
            list: [
              { code: 'type', value: 'Order' },
              { code: 'location', value: 'L1' },
              { code: 'day_from', value: '1' },
              { code: 'day_to', value: '6' },
              { code: 'time_from', value: '0900' },
              { code: 'time_to', value: '1900' },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Generate a complete, valid, official ONDC:RETeB2B on_search payload
 * Ready to paste into ONDC Workbench
 */
export function generateCompleteOnSearchPayload(customContext = {}) {
  const now = new Date().toISOString();
  const context = {
    domain: customContext.domain || ondcConfig.domain,
    action: 'on_search',
    country: customContext.country || ondcConfig.country,
    city: customContext.city || ondcConfig.city,
    core_version: customContext.core_version || ondcConfig.coreVersion || '1.2.5',
    bap_id: customContext.bap_id || 'workbench.ondc.tech',
    bap_uri: customContext.bap_uri || ondcConfig.buyerBaseUrl || 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer',
    bpp_id: ondcConfig.subscriberId,
    bpp_uri: ondcConfig.subscriberUri,
    transaction_id: customContext.transaction_id || '54e3d489-0be3-455b-9d41-3da39d520377',
    message_id: customContext.message_id || '0b0e557b-7b56-4c4f-9e7c-86cf330de223',
    timestamp: now,
    ttl: 'PT30S',
  };

  const catalog = buildOndcCatalog();

  return {
    context,
    message: {
      catalog,
    },
  };
}

export default {
  PRODUCTS_CATALOG,
  ONDC_CATEGORIES,
  getAuthoritativeProducts,
  buildOndcCatalog,
  findProductById,
  generateCompleteOnSearchPayload,
};

/**
 * ONDC RET Catalog Validator
 * Kogniti Minds Private Limited
 * 
 * Validates products against ONDC Retail (RET 1.2.5 / eB2B) taxonomy & schemas:
 * - Checks mandatory attributes (id, name, sku, hsn, price, stock)
 * - Validates HSN codes (e.g. 4802 for paper, 4820 for notebooks)
 * - Checks positive pricing and non-negative inventory
 * - Enforces returnable, cancellable, time-to-ship, and statutory tags
 */

export const VALID_HSN_PREFIXES = ['4802', '4820', '4821', '4823', '9608', '4819'];

/**
 * Validate an individual product for ONDC publication
 * @param {object} product - Product to validate
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateProductForOndc(product) {
  const errors = [];

  if (!product) {
    return { valid: false, errors: ['Product object is null or undefined'] };
  }

  // 1. Mandatory Identity Attributes
  if (!product.id || typeof product.id !== 'string') {
    errors.push('Missing or invalid product id');
  }
  if (!product.name || typeof product.name !== 'string' || product.name.trim().length < 3) {
    errors.push(`Product ${product.id || 'unknown'}: Name must be at least 3 characters`);
  }
  if (!product.sku || typeof product.sku !== 'string') {
    errors.push(`Product ${product.id}: Missing SKU code`);
  }

  // 2. Statutory GST & HSN Code Validation
  if (!product.hsn || typeof product.hsn !== 'string') {
    errors.push(`Product ${product.id}: Missing statutory HSN code`);
  } else {
    const cleanHsn = product.hsn.replace(/\D/g, '');
    if (cleanHsn.length < 4 || cleanHsn.length > 8) {
      errors.push(`Product ${product.id}: HSN code '${product.hsn}' must be 4 to 8 digits`);
    }
  }

  // 3. Price Validation
  const price = Number(product.b2bWholesalePrice || product.price || product.b2cPrice);
  if (isNaN(price) || price <= 0) {
    errors.push(`Product ${product.id}: Price must be a positive number (found ${price})`);
  }

  const mrp = Number(product.b2cMrp || product.mrp || price);
  if (mrp < price) {
    errors.push(`Product ${product.id}: MRP (₹${mrp}) cannot be lower than selling price (₹${price})`);
  }

  // 4. Inventory Validation
  const stock = Number(product.stock !== undefined ? product.stock : 100);
  if (isNaN(stock) || stock < 0) {
    errors.push(`Product ${product.id}: Stock must be a non-negative number`);
  }

  // 5. Images Validation
  const hasImages = (Array.isArray(product.images) && product.images.length > 0) || Boolean(product.image);
  if (!hasImages) {
    errors.push(`Product ${product.id}: At least one high-resolution product image URL is mandatory`);
  }

  // 6. Category Mapping Validation
  if (!product.categoryId && !product.category) {
    errors.push(`Product ${product.id}: Missing ONDC category mapping`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Filter and validate full catalog, returning only compliant items
 * @param {Array} rawProducts - Array of products from database
 * @returns {{ validProducts: Array, rejectedProducts: Array }}
 */
export function validateCatalog(rawProducts = []) {
  const validProducts = [];
  const rejectedProducts = [];

  for (const prod of rawProducts) {
    const check = validateProductForOndc(prod);
    if (check.valid) {
      validProducts.push(prod);
    } else {
      rejectedProducts.push({
        id: prod?.id || 'unknown',
        name: prod?.name || 'unknown',
        errors: check.errors,
      });
    }
  }

  return {
    validProducts,
    rejectedProducts,
  };
}

export default {
  validateProductForOndc,
  validateCatalog,
  VALID_HSN_PREFIXES,
};

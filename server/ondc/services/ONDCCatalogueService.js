/**
 * ONDCCatalogueService
 * Catalogs authoritative eco-friendly paper & stationery items per ONDC RETeB2B 1.2.5
 * Kogniti Minds Private Limited
 */

import {
  buildOndcCatalog,
  getAuthoritativeProducts,
  PRODUCTS_CATALOG,
  generateCompleteOnSearchPayload,
} from '../catalogMapper.js';
import { validateProductForOndc, validateCatalog } from '../catalogValidator.js';

export class ONDCCatalogueService {
  /**
   * Get all authoritative products
   */
  static getProducts() {
    return getAuthoritativeProducts();
  }

  /**
   * Build complete ONDC BPP Catalog
   */
  static buildCatalog() {
    return buildOndcCatalog();
  }

  /**
   * Generate complete on_search payload with context
   */
  static generateOnSearchPayload(params) {
    return generateCompleteOnSearchPayload(params);
  }

  /**
   * Validate catalog products against ONDC taxonomy
   */
  static validate(products) {
    return validateCatalog(products || getAuthoritativeProducts());
  }

  /**
   * Search catalog items by text query or category
   */
  static searchItems(query = '', categoryId = '') {
    const products = getAuthoritativeProducts();
    const cleanQuery = query.trim().toLowerCase();

    return products.filter((p) => {
      if (cleanQuery) {
        const matches =
          (p.name || '').toLowerCase().includes(cleanQuery) ||
          (p.sku || '').toLowerCase().includes(cleanQuery) ||
          (p.shortDescription || '').toLowerCase().includes(cleanQuery) ||
          (p.categoryId || '').toLowerCase().includes(cleanQuery);
        if (!matches) return false;
      }

      if (categoryId && categoryId !== 'All') {
        const pCat = (p.categoryId || '').toLowerCase();
        const target = categoryId.toLowerCase();
        if (pCat !== target && !pCat.includes(target)) {
          return false;
        }
      }

      return true;
    });
  }
}

export default ONDCCatalogueService;

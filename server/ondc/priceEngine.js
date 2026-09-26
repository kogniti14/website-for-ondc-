/**
 * Central Price, Tax & Delivery Engine
 * Kogniti Minds Private Limited
 * 
 * Shared calculation logic across ONDC (B2B/B2C), Website, and Admin:
 * - Base price & quantity-based tier discounts
 * - Statutory GST (18% for paper HSN 48025610, notebooks HSN 48201000)
 * - Interstate (100% IGST) vs Intrastate (50% CGST + 50% SGST)
 * - Dimensional weight delivery fee calculation
 * - Proportional refund calculation for returns
 */

import ondcConfig from './config.js';

export const SELLER_STATE = ondcConfig.seller.address.state || 'Uttar Pradesh';
export const SELLER_PINCODE = ondcConfig.seller.address.pincode || '201309';

/**
 * Calculate tiered bulk wholesale discount for an item
 * @param {object} product - Canonical product object
 * @param {number} quantity - Purchased count
 * @returns {{ discountPercent: number, slabLabel: string, baseUnitPrice: number, effectiveUnitPrice: number }}
 */
export function calculateItemUnitPrice(product, quantity = 1) {
  const count = Math.max(1, parseInt(quantity, 10) || 1);
  const baseWholesale = Number(product.b2bWholesalePrice || product.price || product.b2cPrice || 200);

  let discountPercent = 0;
  let slabLabel = 'Standard Price';

  if (Array.isArray(product.b2bDiscountSlabs) && product.b2bDiscountSlabs.length > 0) {
    for (const slab of product.b2bDiscountSlabs) {
      if (count >= slab.minQty && (!slab.maxQty || count <= slab.maxQty)) {
        discountPercent = slab.discountPercent;
        slabLabel = slab.label || `${slab.discountPercent}% Bulk Tier`;
      }
    }
  }

  const effectiveUnitPrice = Number((baseWholesale * (1 - discountPercent / 100)).toFixed(2));
  return {
    baseUnitPrice: baseWholesale,
    effectiveUnitPrice,
    discountPercent,
    slabLabel,
  };
}

/**
 * Calculate statutory GST breakup based on delivery address
 * @param {number} taxableAmount - Subtotal after discounts
 * @param {number} [gstRate=18] - Standard GST rate (default 18%)
 * @param {string} [destinationState=''] - Destination state
 * @returns {{ isInterstate: boolean, gstRate: number, totalGst: number, igst: number, cgst: number, sgst: number }}
 */
export function calculateGstBreakup(taxableAmount, gstRate = 18, destinationState = '') {
  const isInterstate = Boolean(
    destinationState &&
    destinationState.trim().toLowerCase() !== SELLER_STATE.toLowerCase()
  );

  const totalGst = Number(((taxableAmount * gstRate) / 100).toFixed(2));

  if (isInterstate) {
    return {
      isInterstate: true,
      gstRate,
      totalGst,
      igst: totalGst,
      cgst: 0,
      sgst: 0,
    };
  }

  const halfGst = Number((totalGst / 2).toFixed(2));
  return {
    isInterstate: false,
    gstRate,
    totalGst,
    igst: 0,
    cgst: halfGst,
    sgst: Number((totalGst - halfGst).toFixed(2)),
  };
}

/**
 * Calculate dynamic delivery charge based on weight and destination
 * @param {Array} items - List of items with weights
 * @param {object} [destination={}] - Delivery address
 * @returns {{ deliveryCharge: number, estimatedDays: number, totalWeightKg: number }}
 */
export function calculateDeliveryFee(items = [], destination = {}) {
  let totalWeightKg = 0;

  for (const item of items) {
    const count = parseInt(item.quantity?.count || item.quantity || 1, 10);
    let itemWeightKg = 2.5; // default 2.5 kg per ream
    if (item.weight) {
      const match = String(item.weight).match(/([0-9.]+)/);
      if (match) itemWeightKg = parseFloat(match[1]);
    }
    totalWeightKg += itemWeightKg * count;
  }

  // Base institutional delivery slab: Free for orders >= 20 reams or carton bulk (> ₹5,000)
  // Otherwise standard surface logistics rate: ₹15/kg for local UP/Delhi NCR, ₹35/kg interstate
  const isInterstate = Boolean(
    destination.state &&
    destination.state.trim().toLowerCase() !== SELLER_STATE.toLowerCase()
  );

  const ratePerKg = isInterstate ? 30 : 15;
  let deliveryCharge = 0;

  if (totalWeightKg < 50) {
    deliveryCharge = Math.max(99, Math.round(totalWeightKg * ratePerKg));
  } else if (totalWeightKg >= 50 && totalWeightKg < 200) {
    deliveryCharge = Math.round(totalWeightKg * (ratePerKg * 0.7)); // 30% logistics subsidy
  } else {
    // Large institutional bulk / pallet order: subsidized freight
    deliveryCharge = 0; // Free institutional delivery
  }

  const estimatedDays = isInterstate ? 4 : 2;

  return {
    deliveryCharge,
    estimatedDays,
    totalWeightKg: Number(totalWeightKg.toFixed(2)),
  };
}

/**
 * Calculate full quotation with itemized ONDC quote breakup
 * @param {Array} requestedItems - Items with id and quantity
 * @param {object} [deliveryAddress={}] - Destination address object
 * @param {Function} findProductFn - Function to look up canonical product
 * @returns {object} Quotation result with quoteBreakup
 */
export function calculateFullQuotation(requestedItems = [], deliveryAddress = {}, findProductFn) {
  let subtotal = 0;
  let bulkDiscountTotal = 0;
  let totalTaxable = 0;
  let totalGst = 0;
  const quoteBreakup = [];
  const processedItems = [];

  const destinationState = deliveryAddress.state || '';

  for (const reqItem of requestedItems) {
    const product = findProductFn(reqItem.id);
    if (!product) {
      throw new Error(`Product ${reqItem.id} not found in Kogniti Minds catalogue.`);
    }

    const count = parseInt(reqItem.quantity?.count || reqItem.quantity || 1, 10);
    const priceInfo = calculateItemUnitPrice(product, count);
    const itemTaxable = Number((priceInfo.effectiveUnitPrice * count).toFixed(2));
    const baseTotal = Number((priceInfo.baseUnitPrice * count).toFixed(2));
    const itemDiscount = Number((baseTotal - itemTaxable).toFixed(2));

    const gstInfo = calculateGstBreakup(itemTaxable, product.gstRate || 18, destinationState);

    subtotal += baseTotal;
    bulkDiscountTotal += itemDiscount;
    totalTaxable += itemTaxable;
    totalGst += gstInfo.totalGst;

    processedItems.push({
      id: product.id,
      name: product.name,
      sku: product.sku,
      hsn: product.hsn || '48025610',
      quantity: count,
      baseUnitPrice: priceInfo.baseUnitPrice,
      effectiveUnitPrice: priceInfo.effectiveUnitPrice,
      discountPercent: priceInfo.discountPercent,
      slabLabel: priceInfo.slabLabel,
      taxableAmount: itemTaxable,
      gstRate: product.gstRate || 18,
      gstBreakup: gstInfo,
      gstAmount: gstInfo.totalGst,
      totalAmount: Number((itemTaxable + gstInfo.totalGst).toFixed(2)),
      image: Array.isArray(product.images) ? product.images[0] : (product.image || ''),
      weight: product.weight || '2.35 kg',
      dimensions: product.dimensions || '21cm x 29.7cm x 5.2cm',
    });

    // 1. Item line entry in ONDC Quote Breakup
    quoteBreakup.push({
      '@ondc/org/item_id': product.id,
      '@ondc/org/item_quantity': { count },
      title: product.name,
      '@ondc/org/title_type': 'item',
      price: {
        currency: 'INR',
        value: itemTaxable.toFixed(2),
      },
      item: {
        quantity: {
          available: { count: String(product.stock || 500) },
          maximum: { count: String(Math.min(product.stock || 500, 500)) },
        },
        price: {
          currency: 'INR',
          value: priceInfo.effectiveUnitPrice.toFixed(2),
        },
      },
    });

    // 2. Tax entry in ONDC Quote Breakup
    quoteBreakup.push({
      '@ondc/org/item_id': product.id,
      title: gstInfo.isInterstate
        ? `Tax (IGST ${gstInfo.gstRate}%)`
        : `Tax (CGST ${gstInfo.gstRate / 2}% + SGST ${gstInfo.gstRate / 2}%)`,
      '@ondc/org/title_type': 'tax',
      price: {
        currency: 'INR',
        value: gstInfo.totalGst.toFixed(2),
      },
    });
  }

  // 3. Delivery fee entry
  const deliveryInfo = calculateDeliveryFee(processedItems, deliveryAddress);
  if (deliveryInfo.deliveryCharge > 0) {
    quoteBreakup.push({
      title: 'Delivery charges (Surface Logistics)',
      '@ondc/org/title_type': 'delivery',
      price: {
        currency: 'INR',
        value: deliveryInfo.deliveryCharge.toFixed(2),
      },
    });
  }

  const grandTotal = Number((totalTaxable + totalGst + deliveryInfo.deliveryCharge).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    bulkDiscountTotal: Number(bulkDiscountTotal.toFixed(2)),
    taxableAmount: Number(totalTaxable.toFixed(2)),
    totalGst: Number(totalGst.toFixed(2)),
    deliveryCharge: deliveryInfo.deliveryCharge,
    estimatedDeliveryDays: deliveryInfo.estimatedDays,
    grandTotal,
    items: processedItems,
    quoteBreakup,
    isInterstate: processedItems[0]?.gstBreakup?.isInterstate || false,
  };
}

/**
 * Calculate refund amount for buyer returns (Full or Partial)
 * @param {object} order - Existing confirmed order
 * @param {Array} returnItems - Items being returned
 * @returns {{ isFullOrder: boolean, refundAmount: number, returnedItems: Array }}
 */
export function calculateRefund(order, returnItems = []) {
  if (!order || !Array.isArray(order.items)) {
    throw new Error('Invalid order for return calculation');
  }

  // If no specific items specified, assume full return
  if (!returnItems || returnItems.length === 0) {
    return {
      isFullOrder: true,
      refundAmount: order.grandTotal,
      returnedItems: order.items,
    };
  }

  let isFullOrder = true;
  let partialTaxableRefund = 0;
  let partialGstRefund = 0;
  const processedReturnItems = [];

  for (const originalItem of order.items) {
    const matchedReturn = returnItems.find((r) => r.id === originalItem.id);
    if (!matchedReturn) {
      isFullOrder = false;
      continue;
    }

    const returnQty = parseInt(matchedReturn.quantity?.count || matchedReturn.quantity || originalItem.quantity, 10);
    if (returnQty < originalItem.quantity) {
      isFullOrder = false;
    }

    const effectiveReturnQty = Math.min(returnQty, originalItem.quantity);
    const itemUnit = originalItem.effectiveUnitPrice || (originalItem.taxableAmount / originalItem.quantity);
    const itemTaxable = Number((itemUnit * effectiveReturnQty).toFixed(2));
    const itemGst = Number(((itemTaxable * (originalItem.gstRate || 18)) / 100).toFixed(2));

    partialTaxableRefund += itemTaxable;
    partialGstRefund += itemGst;

    processedReturnItems.push({
      ...originalItem,
      returnedQuantity: effectiveReturnQty,
      itemRefundAmount: Number((itemTaxable + itemGst).toFixed(2)),
    });
  }

  if (isFullOrder) {
    return {
      isFullOrder: true,
      refundAmount: order.grandTotal,
      returnedItems: processedReturnItems,
    };
  }

  return {
    isFullOrder: false,
    refundAmount: Number((partialTaxableRefund + partialGstRefund).toFixed(2)),
    returnedItems: processedReturnItems,
  };
}

export default {
  calculateItemUnitPrice,
  calculateGstBreakup,
  calculateDeliveryFee,
  calculateFullQuotation,
  calculateRefund,
  SELLER_STATE,
  SELLER_PINCODE,
};

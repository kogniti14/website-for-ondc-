/**
 * ONDC:RETeB2B Buyer-Initiated Return Handler
 * Implements the active ONDC Workbench Flow:
 * Buyer_Initiated_Return_(Full_Order_and_Partial_Order)
 * 
 * Handles /update requests and crafts official /on_update callbacks
 */

import { getOrderById, updateOrderStatus } from './orderManager.js';
import ondcConfig from './config.js';
import { PRODUCTS_CATALOG } from './catalogMapper.js';
import stateManager from './stateManager.js';

export function handleBuyerInitiatedReturn({ context, updatePayload }) {
  const orderId = updatePayload.order?.id;
  const order = getOrderById(orderId);

  const updateTarget = (updatePayload.update_target || 'fulfillment').toLowerCase();
  const requestedReturnItems = updatePayload.order?.items || [];
  const requestedFulfillments = updatePayload.order?.fulfillments || [];

  // Determine returned items and quantities
  const returnItemsDetails = [];
  let totalRefundTaxable = 0;
  let totalRefundGst = 0;

  // If items array specified in update payload
  if (requestedReturnItems.length > 0) {
    for (const reqItem of requestedReturnItems) {
      const existingItem = order.items.find((i) => i.id === reqItem.id) || order.items[0];
      const returnCount = parseInt(reqItem.quantity?.count || reqItem.quantity || existingItem.quantity, 10);
      
      // Strict quantity validation
      if (returnCount > existingItem.quantity) {
        const err = new Error(`Return quantity (${returnCount}) exceeds purchased count (${existingItem.quantity}) for item '${existingItem.name}'`);
        err.code = '40004';
        throw err;
      }

      const unitPrice = existingItem.effectiveUnitPrice || existingItem.baseWholesalePrice || 198;
      const gstRate = existingItem.gstRate || 18;
      
      const itemTaxableRefund = Number((unitPrice * returnCount).toFixed(2));
      const itemGstRefund = Number(((itemTaxableRefund * gstRate) / 100).toFixed(2));

      totalRefundTaxable += itemTaxableRefund;
      totalRefundGst += itemGstRefund;

      returnItemsDetails.push({
        id: reqItem.id,
        returnCount,
        originalCount: existingItem.quantity,
        unitPrice,
        taxableRefund: itemTaxableRefund,
        gstRefund: itemGstRefund,
        totalRefund: Number((itemTaxableRefund + itemGstRefund).toFixed(2)),
      });
    }
  } else {
    // If entire order is targeted
    for (const item of order.items) {
      const itemTaxableRefund = item.taxableAmount;
      const itemGstRefund = item.gstAmount;
      totalRefundTaxable += itemTaxableRefund;
      totalRefundGst += itemGstRefund;

      returnItemsDetails.push({
        id: item.id,
        returnCount: item.quantity,
        originalCount: item.quantity,
        unitPrice: item.effectiveUnitPrice,
        taxableRefund: itemTaxableRefund,
        gstRefund: itemGstRefund,
        totalRefund: Number((itemTaxableRefund + itemGstRefund).toFixed(2)),
      });
    }
  }

  const totalRefundAmount = Number((totalRefundTaxable + totalRefundGst).toFixed(2));

  // Determine if this is a Full Order Return or Partial Order Return
  let isFullOrder = true;
  for (const item of order.items) {
    const ret = returnItemsDetails.find((r) => r.id === item.id);
    if (!ret || ret.returnCount < item.quantity) {
      isFullOrder = false;
      break;
    }
  }

  const returnType = isFullOrder ? 'Full_Order_Return' : 'Partial_Order_Return';

  // Update order history
  order.returnDetails = {
    returnType,
    returnApprovedAt: new Date().toISOString(),
    returnItems: returnItemsDetails,
    refundAmount: totalRefundAmount,
    status: 'Return_Approved',
  };

  order.statusTimeline.push({
    status: 'RETURN_APPROVED',
    timestamp: new Date().toISOString(),
    note: `Buyer-initiated return approved (${returnType.replace('_', ' ')}). Refund amount: ₹${totalRefundAmount.toFixed(2)}`,
  });

  stateManager.recordTransition({
    transactionId: context.transaction_id,
    messageId: context.message_id,
    action: 'update',
    orderId: order.id,
    nextState: isFullOrder ? 'Completed' : 'Completed',
    fulfillmentState: 'Return_Approved',
    requestSummary: `${returnType}: ${returnItemsDetails.length} items requested for return`,
    responseSummary: `Return_Approved with refund amount ₹${totalRefundAmount.toFixed(2)}`,
  });

  // Build the official /on_update order payload
  const pickupStart = new Date(Date.now() + 12 * 3600000).toISOString();
  const pickupEnd = new Date(Date.now() + 36 * 3600000).toISOString();

  // Return Fulfillment (Reverse Logistics)
  const returnFulfillmentId = requestedFulfillments[0]?.id || `R_${Date.now()}`;
  const returnFulfillment = {
    id: returnFulfillmentId,
    type: 'Return',
    state: {
      descriptor: {
        code: 'Return_Approved',
        name: 'Return Request Approved by Kogniti Minds',
      },
    },
    start: {
      time: {
        range: {
          start: pickupStart,
          end: pickupEnd,
        },
      },
      instructions: {
        name: 'Reverse Quality Inspection and Mill Return Pickup',
        short_desc: 'Ensure paper boxes remain shrink-wrapped with batch barcodes intact.',
        images: ['https://kognitiminds.com/logo-icon.png'],
      },
      contact: {
        phone: ondcConfig.seller.phone,
        email: ondcConfig.seller.supportEmail,
      },
    },
    tracking: true,
    tags: [
      {
        code: 'return_request',
        list: [
          { code: 'return_type', value: returnType },
          { code: 'approval_status', value: 'approved' },
          { code: 'refund_amount', value: totalRefundAmount.toFixed(2) },
          { code: 'ttl_reverseqc', value: 'P3D' },
        ],
      },
    ],
  };

  // Keep delivered fulfillment intact alongside return fulfillment
  const fulfillments = [
    {
      id: 'F1',
      type: 'Delivery',
      state: { descriptor: { code: 'Order-delivered' } },
      tracking: false,
    },
    returnFulfillment,
  ];

  // Build updated quote showing refund adjustment
  const updatedBreakup = [];
  for (const item of order.items) {
    updatedBreakup.push({
      '@ondc/org/item_id': item.id,
      '@ondc/org/item_quantity': { count: item.quantity },
      title: item.name,
      '@ondc/org/title_type': 'item',
      price: {
        currency: 'INR',
        value: item.taxableAmount.toFixed(2),
      },
    });
    updatedBreakup.push({
      '@ondc/org/item_id': item.id,
      title: `GST (${item.gstRate || 18}%)`,
      '@ondc/org/title_type': 'tax',
      price: {
        currency: 'INR',
        value: item.gstAmount.toFixed(2),
      },
    });
  }

  // Add refund / credit adjustment line item
  updatedBreakup.push({
    '@ondc/org/item_id': returnItemsDetails[0]?.id || order.items[0]?.id,
    title: `Reverse Logistics Refund (${returnType.replace('_', ' ')})`,
    '@ondc/org/title_type': 'refund',
    price: {
      currency: 'INR',
      value: (-totalRefundAmount).toFixed(2),
    },
  });

  const netPayable = Math.max(0, Number((order.grandTotal - totalRefundAmount).toFixed(2)));

  const onUpdateOrder = {
    id: order.id,
    state: isFullOrder ? 'Completed' : 'Completed',
    provider: {
      id: ondcConfig.seller.id,
      locations: [{ id: 'L1' }],
    },
    items: order.items.map((i) => {
      const ret = returnItemsDetails.find((r) => r.id === i.id);
      return {
        id: i.id,
        fulfillment_id: ret ? returnFulfillmentId : 'F1',
        quantity: { count: i.quantity },
        tags: ret
          ? [
              {
                code: 'return_status',
                list: [
                  { code: 'return_quantity', value: ret.returnCount.toString() },
                  { code: 'status', value: 'Return_Approved' },
                  { code: 'refund_value', value: ret.totalRefund.toFixed(2) },
                ],
              },
            ]
          : [],
      };
    }),
    billing: order.billingAddress,
    fulfillments,
    quote: {
      price: {
        currency: 'INR',
        value: netPayable.toFixed(2),
      },
      breakup: updatedBreakup,
      ttl: 'P1D',
    },
    payment: {
      type: 'ON-FULFILLMENT',
      status: 'PAID',
      params: {
        amount: totalRefundAmount.toFixed(2),
        currency: 'INR',
      },
      tags: [
        {
          code: 'settlement_details',
          list: [
            { code: 'settlement_phase', value: 'refund' },
            { code: 'settlement_type', value: 'neft' },
            { code: 'settlement_status', value: 'INITIATED' },
            { code: 'beneficiary_name', value: order.businessName },
            { code: 'settlement_amount', value: totalRefundAmount.toFixed(2) },
          ],
        },
      ],
    },
    updated_at: new Date().toISOString(),
  };

  return {
    returnType,
    totalRefundAmount,
    isFullOrder,
    onUpdateOrder,
  };
}

export default {
  handleBuyerInitiatedReturn,
};

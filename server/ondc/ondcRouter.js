/**
 * ONDC:RETeB2B Express Router
 * Implements seller-side protocol endpoints and callbacks for ONDC eB2B
 * Kogniti Minds Private Limited
 */

import express from 'express';
import crypto from 'crypto';
import ondcConfig from './config.js';
import { createAuthorizationHeader, verifyAuthorization } from './crypto.js';
import { buildOndcCatalog, PRODUCTS_CATALOG, generateCompleteOnSearchPayload } from './catalogMapper.js';
import {
  calculateQuote,
  createOndcOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from './orderManager.js';
import { handleBuyerInitiatedReturn } from './returnHandler.js';
import ondcLogger from './logger.js';

export const ondcRouter = express.Router();

// Middleware to capture raw body for signature verification
ondcRouter.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

/**
 * Standard ONDC ACK / NACK responses
 */
export function sendAck(res) {
  return res.status(200).json({
    message: {
      ack: {
        status: 'ACK',
      },
    },
  });
}

export function sendNack(res, code, message, path = '') {
  return res.status(400).json({
    message: {
      ack: {
        status: 'NACK',
      },
    },
    error: {
      type: 'DOMAIN-ERROR',
      code: code || '30000',
      path,
      message,
    },
  });
}

/**
 * Helper to build standard ONDC context for outgoing callbacks
 */
function buildCallbackContext(incomingContext, action) {
  return {
    domain: incomingContext.domain || ondcConfig.domain,
    country: incomingContext.country || ondcConfig.country,
    city: incomingContext.city || ondcConfig.city,
    action,
    core_version: incomingContext.core_version || ondcConfig.coreVersion,
    bap_id: incomingContext.bap_id,
    bap_uri: incomingContext.bap_uri,
    bpp_id: ondcConfig.subscriberId,
    bpp_uri: ondcConfig.subscriberUri,
    transaction_id: incomingContext.transaction_id,
    message_id: crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    ttl: 'PT30S',
  };
}

/**
 * Dispatch asynchronous callback to BAP with cryptographic authorization
 */
async function dispatchCallback(bapUri, action, payload) {
  if (!bapUri) {
    ondcLogger.warn(action, 'No bap_uri provided in request context; skipping HTTP dispatch');
    return;
  }

  // Format destination URL: e.g. https://buyer-app.com/on_search
  const cleanUri = bapUri.replace(/\/+$/, '');
  const url = cleanUri.endsWith(action) ? cleanUri : `${cleanUri}/${action}`;

  const stringifiedBody = JSON.stringify(payload);

  let authHeader = '';
  if (ondcConfig.hasKeys()) {
    try {
      authHeader = createAuthorizationHeader({
        body: stringifiedBody,
        action,
        subscriberId: ondcConfig.subscriberId,
        keyId: ondcConfig.keyId,
        privateKey: ondcConfig.privateKey,
      });
    } catch (err) {
      ondcLogger.error(action, 'Failed to sign outgoing authorization header', err);
    }
  }

  const headers = {
    'Content-Type': 'application/json',
  };
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  ondcLogger.info(action, `Dispatching asynchronous callback to: ${url}`, {
    transactionId: payload.context?.transaction_id,
    messageId: payload.context?.message_id,
  });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: stringifiedBody,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    ondcLogger.info(action, `Callback dispatched successfully. Status: ${response.status}`, {
      bapUri,
      status: response.status,
    });
  } catch (err) {
    // Log error gracefully (do not crash)
    ondcLogger.warn(action, `Callback dispatch notice for ${url}: ${err.message}`, {
      bapUri,
      error: err.message,
    });
  }
}

/**
 * Middleware to validate common ONDC context
 */
async function validateOndcRequest(req, res, next) {
  const { context } = req.body || {};
  if (!context || !context.domain || !context.action || !context.transaction_id || !context.message_id) {
    return sendNack(res, '10000', 'Missing required context attributes (domain, action, transaction_id, message_id)');
  }

  const authHeader = req.headers['authorization'];
  const verification = await verifyAuthorization({
    header: authHeader,
    rawBody: req.rawBody || JSON.stringify(req.body),
    action: context.action,
  });

  if (!verification.valid) {
    ondcLogger.warn(context.action, `Authorization verification failed: ${verification.error}`, {
      transactionId: context.transaction_id,
    });
    return sendNack(res, '20001', verification.error || 'Unauthorized ONDC request');
  }

  next();
}

/* ==========================================================================
   ONDC Endpoints
   ========================================================================== */

/**
 * GET /ondc/health - Internal Service Health Check
 */
ondcRouter.get('/ondc/health', (req, res) => {
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: ondcConfig.getSanitized(),
    catalogItemCount: PRODUCTS_CATALOG.length,
    activeWorkbenchFlow: 'Buyer_Initiated_Return_(Full_Order_and_Partial_Order)',
  });
});

/**
 * GET /ondc/on_search_sample - Generates complete official on_search payload
 * Useful for copying/testing with ONDC Workbench "Paste on_search" step
 */
ondcRouter.get(['/ondc/on_search_sample', '/on_search_sample'], (req, res) => {
  const samplePayload = generateCompleteOnSearchPayload({
    bap_id: req.query.bap_id || 'buyer-app-preprod.ondc.org',
    bap_uri: req.query.bap_uri || 'https://buyer-app-preprod.ondc.org/protocol/v1',
    transaction_id: req.query.transaction_id || '54e3d489-0be3-455b-9d41-3da39d520377',
    message_id: req.query.message_id || '0b0e557b-7b56-4c4f-9e7c-86cf330de223',
    domain: req.query.domain || ondcConfig.domain,
    core_version: req.query.core_version || ondcConfig.coreVersion,
  });
  return res.status(200).json(samplePayload);
});

/**
 * POST /search -> returns ACK, async callback /on_search
 */
ondcRouter.post('/search', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  ondcLogger.info('search', 'Received search request', {
    transactionId: context.transaction_id,
    bapId: context.bap_id,
    intent: message?.intent?.item?.descriptor?.name || 'broad_search',
  });

  sendAck(res);

  // Asynchronously generate catalog and invoke on_search
  setImmediate(async () => {
    try {
      const catalog = buildOndcCatalog(message?.intent || {});
      const callbackPayload = {
        context: buildCallbackContext(context, 'on_search'),
        message: {
          catalog,
        },
      };

      await dispatchCallback(context.bap_uri, 'on_search', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_search', 'Error preparing on_search payload', err);
    }
  });
});

/**
 * POST /select -> returns ACK, async callback /on_select
 */
ondcRouter.post('/select', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  ondcLogger.info('select', 'Received select request', {
    transactionId: context.transaction_id,
    itemsCount: message?.order?.items?.length || 0,
  });

  sendAck(res);

  setImmediate(async () => {
    try {
      const items = message?.order?.items || [];
      const deliveryAddress = message?.order?.fulfillments?.[0]?.end?.location?.address || {};
      const quoteResult = calculateQuote(items, deliveryAddress);

      const callbackPayload = {
        context: buildCallbackContext(context, 'on_select'),
        message: {
          order: {
            provider: {
              id: ondcConfig.seller.id,
            },
            items: quoteResult.items.map((it) => ({
              id: it.id,
              fulfillment_id: 'F1',
              quantity: { count: it.quantity },
            })),
            fulfillments: [
              {
                id: 'F1',
                type: 'Delivery',
                tracking: true,
                state: {
                  descriptor: {
                    code: 'Serviceable',
                  },
                },
              },
            ],
            quote: quoteResult.ondcQuote,
          },
        },
      };

      await dispatchCallback(context.bap_uri, 'on_select', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_select', 'Error preparing on_select payload', err);
    }
  });
});

/**
 * POST /init -> returns ACK, async callback /on_init
 */
ondcRouter.post('/init', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  ondcLogger.info('init', 'Received init request', {
    transactionId: context.transaction_id,
    buyerName: message?.order?.billing?.name,
  });

  sendAck(res);

  setImmediate(async () => {
    try {
      const orderReq = message?.order || {};
      const quoteResult = calculateQuote(orderReq.items || [], orderReq.fulfillments?.[0]?.end?.location?.address || {});

      const callbackPayload = {
        context: buildCallbackContext(context, 'on_init'),
        message: {
          order: {
            provider: {
              id: ondcConfig.seller.id,
            },
            provider_location: {
              id: 'L1',
            },
            items: quoteResult.items.map((it) => ({
              id: it.id,
              fulfillment_id: 'F1',
              quantity: { count: it.quantity },
            })),
            billing: orderReq.billing,
            fulfillments: orderReq.fulfillments || [
              {
                id: 'F1',
                type: 'Delivery',
                tracking: true,
              },
            ],
            quote: quoteResult.ondcQuote,
            payment: {
              type: 'ON-FULFILLMENT',
              status: 'NOT-PAID',
            },
          },
        },
      };

      await dispatchCallback(context.bap_uri, 'on_init', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_init', 'Error preparing on_init payload', err);
    }
  });
});

/**
 * POST /confirm -> returns ACK, persists order, async callback /on_confirm
 */
ondcRouter.post('/confirm', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  ondcLogger.info('confirm', 'Received confirm request', {
    transactionId: context.transaction_id,
    orderId: message?.order?.id,
  });

  sendAck(res);

  setImmediate(async () => {
    try {
      const orderReq = message?.order || {};
      const savedOrder = createOndcOrder({
        ondcOrderId: orderReq.id,
        context,
        orderPayload: orderReq,
      });

      const callbackPayload = {
        context: buildCallbackContext(context, 'on_confirm'),
        message: {
          order: {
            id: savedOrder.id,
            state: 'Created',
            provider: {
              id: ondcConfig.seller.id,
              locations: [{ id: 'L1' }],
            },
            items: savedOrder.items.map((it) => ({
              id: it.id,
              fulfillment_id: 'F1',
              quantity: { count: it.quantity },
            })),
            billing: savedOrder.billingAddress,
            fulfillments: savedOrder.fulfillments,
            quote: {
              price: {
                currency: 'INR',
                value: savedOrder.grandTotal.toFixed(2),
              },
              breakup: savedOrder.items.map((it) => ({
                '@ondc/org/item_id': it.id,
                title: it.name,
                '@ondc/org/title_type': 'item',
                price: { currency: 'INR', value: it.taxableAmount.toFixed(2) },
              })),
            },
            payment: {
              type: 'ON-FULFILLMENT',
              status: savedOrder.paymentStatus === 'paid' ? 'PAID' : 'NOT-PAID',
            },
            created_at: savedOrder.createdAt,
            updated_at: savedOrder.createdAt,
          },
        },
      };

      await dispatchCallback(context.bap_uri, 'on_confirm', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_confirm', 'Error preparing on_confirm payload', err);
    }
  });
});

/**
 * POST /status -> returns ACK, async callback /on_status
 */
ondcRouter.post('/status', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  const orderId = message?.order_id || message?.order?.id;
  ondcLogger.info('status', 'Received status query', {
    transactionId: context.transaction_id,
    orderId,
  });

  sendAck(res);

  setImmediate(async () => {
    try {
      const order = getOrderById(orderId);
      const callbackPayload = {
        context: buildCallbackContext(context, 'on_status'),
        message: {
          order: {
            id: order.id,
            state: order.orderStatus === 'delivered' ? 'Completed' : 'Accepted',
            provider: { id: ondcConfig.seller.id },
            items: order.items.map((i) => ({
              id: i.id,
              quantity: { count: i.quantity },
            })),
            fulfillments: [
              {
                id: 'F1',
                type: 'Delivery',
                state: {
                  descriptor: {
                    code: order.orderStatus === 'delivered' ? 'Order-delivered' : 'Order-picked-up',
                  },
                },
                tracking: true,
              },
            ],
            updated_at: new Date().toISOString(),
          },
        },
      };

      await dispatchCallback(context.bap_uri, 'on_status', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_status', 'Error preparing on_status payload', err);
    }
  });
});

/**
 * POST /cancel -> returns ACK, cancels order, async callback /on_cancel
 */
ondcRouter.post('/cancel', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  const orderId = message?.order_id || message?.order?.id;
  const reasonId = message?.cancellation_reason_id || '001';
  ondcLogger.info('cancel', 'Received cancel request', {
    transactionId: context.transaction_id,
    orderId,
    reasonId,
  });

  sendAck(res);

  setImmediate(async () => {
    try {
      const cancelledOrder = cancelOrder(orderId, reasonId);
      const callbackPayload = {
        context: buildCallbackContext(context, 'on_cancel'),
        message: {
          order: {
            id: cancelledOrder.id,
            state: 'Cancelled',
            tags: {
              cancellation_reason_id: reasonId,
            },
          },
        },
      };

      await dispatchCallback(context.bap_uri, 'on_cancel', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_cancel', 'Error preparing on_cancel payload', err);
    }
  });
});

/**
 * POST /update -> Active Workbench Flow: Buyer_Initiated_Return_(Full_Order_and_Partial_Order)
 * Returns ACK, processes return, async callback /on_update
 */
ondcRouter.post('/update', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  ondcLogger.info('update', 'Received update request (Buyer-Initiated Return)', {
    transactionId: context.transaction_id,
    orderId: message?.order?.id,
    updateTarget: message?.update_target,
  });

  sendAck(res);

  setImmediate(async () => {
    try {
      const returnResult = handleBuyerInitiatedReturn({
        context,
        updatePayload: message,
      });

      ondcLogger.info('on_update', `Processed ${returnResult.returnType}. Refund amount: ₹${returnResult.totalRefundAmount}`, {
        transactionId: context.transaction_id,
        returnType: returnResult.returnType,
        refundAmount: returnResult.totalRefundAmount,
      });

      const callbackPayload = {
        context: buildCallbackContext(context, 'on_update'),
        message: {
          order: returnResult.onUpdateOrder,
        },
      };

      await dispatchCallback(context.bap_uri, 'on_update', callbackPayload);
    } catch (err) {
      ondcLogger.error('on_update', 'Error processing buyer-initiated return in on_update', err);
    }
  });
});

/**
 * POST /rating -> returns ACK, async callback /on_rating
 */
ondcRouter.post('/rating', validateOndcRequest, async (req, res) => {
  const { context } = req.body;
  sendAck(res);

  setImmediate(async () => {
    const callbackPayload = {
      context: buildCallbackContext(context, 'on_rating'),
      message: {
        feedback_form: null,
      },
    };
    await dispatchCallback(context.bap_uri, 'on_rating', callbackPayload);
  });
});

/**
 * POST /track -> returns ACK, async callback /on_track
 */
ondcRouter.post('/track', validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  const orderId = message?.order_id || 'ondc';
  sendAck(res);

  setImmediate(async () => {
    const callbackPayload = {
      context: buildCallbackContext(context, 'on_track'),
      message: {
        tracking: {
          url: `https://kognitiminds.com/track/${orderId}`,
          status: 'active',
        },
      },
    };
    await dispatchCallback(context.bap_uri, 'on_track', callbackPayload);
  });
});

/**
 * POST /support -> returns ACK, async callback /on_support
 */
ondcRouter.post('/support', validateOndcRequest, async (req, res) => {
  const { context } = req.body;
  sendAck(res);

  setImmediate(async () => {
    const callbackPayload = {
      context: buildCallbackContext(context, 'on_support'),
      message: {
        phone: ondcConfig.seller.phone,
        email: ondcConfig.seller.supportEmail,
        uri: 'https://kognitiminds.com/contact',
      },
    };
    await dispatchCallback(context.bap_uri, 'on_support', callbackPayload);
  });
});

export default ondcRouter;

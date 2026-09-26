/**
 * ONDC:RETeB2B Express Router
 * Implements seller-side protocol endpoints, callbacks, and simulation for ONDC Retail (RET 1.2.5 / eB2B)
 * Kogniti Minds Private Limited
 */

import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ondcConfig from './config.js';
import { createAuthorizationHeader, verifyAuthorization } from './security/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
import {
  buildOndcCatalog,
  getAuthoritativeProducts,
  PRODUCTS_CATALOG,
  generateCompleteOnSearchPayload,
} from './catalogMapper.js';
import {
  calculateQuote,
  createOndcOrder,
  getOrderById,
  getAllOndcOrders,
  updateOrderStatus,
  cancelOrder,
} from './orderManager.js';
import { handleBuyerInitiatedReturn } from './returnHandler.js';
import { validateProductForOndc, validateCatalog } from './catalogValidator.js';
import ondcLogger from './logger.js';
import stateManager from './stateManager.js';

export const ondcRouter = express.Router();

// Sliding-window in-memory rate limiter (240 requests/minute per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 240;

export function ondcRateLimiter(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > entry.resetTime) {
    entry.count = 1;
    entry.resetTime = now + RATE_LIMIT_WINDOW_MS;
  } else {
    entry.count++;
  }

  rateLimitMap.set(ip, entry);

  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      message: { ack: { status: 'NACK' } },
      error: {
        type: 'CORE-ERROR',
        code: '90001',
        message: 'Rate limit exceeded. Too many requests from this IP.',
      },
    });
  }

  next();
}

ondcRouter.use(ondcRateLimiter);

// Middleware to capture raw body for signature verification
ondcRouter.use(
  express.json({
    limit: '5mb',
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
    core_version: incomingContext.core_version || ondcConfig.coreVersion || '1.2.5',
    bap_id: incomingContext.bap_id || 'workbench.ondc.tech',
    bap_uri: incomingContext.bap_uri || ondcConfig.buyerBaseUrl || 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer',
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
  const targetUri = bapUri || ondcConfig.buyerBaseUrl || 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer';
  if (!targetUri) {
    ondcLogger.warn(action, 'No bap_uri provided in request context; skipping HTTP dispatch');
    return;
  }

  // Format destination URL: e.g. https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer/<action>
  const cleanUri = targetUri.replace(/\/+$/, '');
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
    ondcLogger.warn(action, `Callback dispatch notice for ${url}: ${err.message}`, {
      bapUri,
      error: err.message,
    });
  }
}

/**
 * Middleware to validate common ONDC context, authorization, idempotency, and state transitions
 */
async function validateOndcRequest(req, res, next) {
  const { context } = req.body || {};
  if (!context || !context.domain || !context.action || !context.transaction_id || !context.message_id) {
    return sendNack(res, '10000', 'Missing required context attributes (domain, action, transaction_id, message_id)');
  }

  // Domain verification: must be ONDC:RETeB2B
  if (context.domain !== ondcConfig.domain) {
    return sendNack(res, '10001', `Invalid domain '${context.domain}'. Expected '${ondcConfig.domain}'.`);
  }

  // Idempotency check: prevent duplicate order creation, inventory deductions, or double cancellations
  const idempotency = stateManager.checkIdempotency(context.transaction_id, context.message_id, context.action);
  if (idempotency.isDuplicate) {
    ondcLogger.info(context.action, 'Idempotent duplicate request detected. Returning synchronous ACK.', {
      transactionId: context.transaction_id,
      messageId: context.message_id,
    });
    return sendAck(res);
  }

  // Cryptographic authorization verification
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

  // State machine transition validation
  const transitionCheck = stateManager.validateTransition(
    context.transaction_id,
    context.action,
    req.body.message
  );

  if (!transitionCheck.valid) {
    ondcLogger.warn(context.action, `State transition rejected: ${transitionCheck.message}`, {
      transactionId: context.transaction_id,
      code: transitionCheck.code,
    });
    stateManager.addLog({
      action: context.action,
      transactionId: context.transaction_id,
      messageId: context.message_id,
      status: 400,
      error: { message: transitionCheck.message },
    });
    return sendNack(res, transitionCheck.code || '30000', transitionCheck.message);
  }

  // Record valid transition & register idempotency
  stateManager.recordIdempotency(context.transaction_id, context.message_id, context.action, { status: 'ACK' });
  stateManager.recordTransition({
    transactionId: context.transaction_id,
    messageId: context.message_id,
    action: context.action,
    orderId: req.body.message?.order?.id || req.body.message?.order_id || null,
  });

  next();
}

/* ==========================================================================
   Protocol Outbound Endpoints (Buyer -> Seller)
   ========================================================================== */

/**
 * GET /health and GET /ondc/health - Service Health Check
 */
ondcRouter.get(['/health', '/ondc/health'], (req, res) => {
  const products = getAuthoritativeProducts();
  return res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    config: ondcConfig.getSanitized(),
    catalogItemCount: products.length,
    activeWorkbenchFlow: 'Buyer_Initiated_Return_(Full_Order_and_Partial_Order)',
  });
});

/**
 * GET /on_search_sample and GET /ondc/on_search_sample
 */
ondcRouter.get(['/on_search_sample', '/ondc/on_search_sample'], (req, res) => {
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
ondcRouter.post(['/search', '/ondc/search'], validateOndcRequest, async (req, res) => {
  const { context, message } = req.body;
  ondcLogger.info('search', 'Received search request', {
    transactionId: context.transaction_id,
    bapId: context.bap_id,
    intent: message?.intent?.item?.descriptor?.name || 'broad_search',
  });

  sendAck(res);

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
ondcRouter.post(['/select', '/ondc/select'], validateOndcRequest, async (req, res) => {
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
ondcRouter.post(['/init', '/ondc/init'], validateOndcRequest, async (req, res) => {
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
 * POST /confirm -> returns ACK, atomically reserves inventory, persists order, async callback /on_confirm
 */
ondcRouter.post(['/confirm', '/ondc/confirm'], validateOndcRequest, async (req, res) => {
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
 * POST /status -> returns ACK, queries genuine order, async callback /on_status
 */
ondcRouter.post(['/status', '/ondc/status'], validateOndcRequest, async (req, res) => {
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
      if (!order) {
        ondcLogger.warn('on_status', `Order '${orderId}' not found for status query`);
        return;
      }

      const callbackPayload = {
        context: buildCallbackContext(context, 'on_status'),
        message: {
          order: {
            id: order.id,
            state: order.orderStatus === 'delivered' ? 'Completed' : (order.orderStatus === 'cancelled' ? 'Cancelled' : 'Accepted'),
            provider: { id: ondcConfig.seller.id },
            items: order.items.map((i) => ({
              id: i.id,
              quantity: { count: i.quantity },
            })),
            fulfillments: order.fulfillments || [
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
 * POST /cancel -> returns ACK, restores inventory, async callback /on_cancel
 */
ondcRouter.post(['/cancel', '/ondc/cancel'], validateOndcRequest, async (req, res) => {
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
      if (!cancelledOrder) {
        ondcLogger.warn('on_cancel', `Order ${orderId} could not be cancelled (not found)`);
        return;
      }

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
 * Returns ACK, processes return, restores returned inventory, async callback /on_update
 */
ondcRouter.post(['/update', '/ondc/update'], validateOndcRequest, async (req, res) => {
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
ondcRouter.post(['/rating', '/ondc/rating'], validateOndcRequest, async (req, res) => {
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
ondcRouter.post(['/track', '/ondc/track'], validateOndcRequest, async (req, res) => {
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
ondcRouter.post(['/support', '/ondc/support'], validateOndcRequest, async (req, res) => {
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

/* ==========================================================================
   Protocol Inbound Callback Endpoints (Gateway / Buyer -> Seller)
   ========================================================================== */

const INBOUND_CALLBACK_ACTIONS = [
  'on_search',
  'on_select',
  'on_init',
  'on_confirm',
  'on_status',
  'on_track',
  'on_cancel',
  'on_update',
  'on_rating',
  'on_support',
];

for (const cbAction of INBOUND_CALLBACK_ACTIONS) {
  ondcRouter.post([`/${cbAction}`, `/ondc/${cbAction}`], async (req, res) => {
    const { context } = req.body || {};
    if (!context || !context.transaction_id || !context.message_id) {
      return sendNack(res, '10000', 'Missing context in callback');
    }

    // Check idempotency for inbound callbacks
    const idempotency = stateManager.checkIdempotency(context.transaction_id, context.message_id, cbAction);
    if (idempotency.isDuplicate) {
      return sendAck(res);
    }

    stateManager.recordIdempotency(context.transaction_id, context.message_id, cbAction, { status: 'ACK' });
    stateManager.recordTransition({
      transactionId: context.transaction_id,
      messageId: context.message_id,
      action: cbAction,
      orderId: req.body.message?.order?.id || null,
    });

    ondcLogger.info(cbAction, `Inbound callback received from ${context.bap_id || 'network'}`, {
      transactionId: context.transaction_id,
      messageId: context.message_id,
    });

    return sendAck(res);
  });
}

/* ==========================================================================
   Admin Diagnostic, Observability & Workbench Simulation Endpoints
   ========================================================================== */

/**
 * POST /api/admin/ondc/workbench/simulate
 * Simulates an end-to-end ONDC scenario executing genuine production business logic
 */
ondcRouter.post('/api/admin/ondc/workbench/simulate', async (req, res) => {
  const startTime = Date.now();
  const { scenario = 'search', payload = {} } = req.body || {};

  try {
    let resultPayload = null;
    let validationReport = { valid: true, errors: [] };

    switch (scenario) {
      case 'search': {
        const catalog = buildOndcCatalog(payload.intent || {});
        resultPayload = {
          context: buildCallbackContext(payload.context || { transaction_id: `sim_txn_${Date.now()}`, message_id: `sim_msg_${Date.now()}` }, 'on_search'),
          message: { catalog },
        };
        const allProds = getAuthoritativeProducts();
        const catVal = validateCatalog(allProds);
        validationReport = {
          valid: catVal.validProducts.length > 0,
          totalCatalogItems: allProds.length,
          compliantItems: catVal.validProducts.length,
          rejectedItems: catVal.rejectedProducts,
        };
        break;
      }

      case 'select': {
        const items = payload.items || [{ id: 'km-agri-a4-75', quantity: { count: 10 } }];
        const address = payload.address || { state: 'Uttar Pradesh', city: 'Noida' };
        const quoteResult = calculateQuote(items, address);
        resultPayload = {
          context: buildCallbackContext(payload.context || { transaction_id: `sim_txn_${Date.now()}`, message_id: `sim_msg_${Date.now()}` }, 'on_select'),
          message: {
            order: {
              provider: { id: ondcConfig.seller.id },
              items: quoteResult.items.map((it) => ({ id: it.id, fulfillment_id: 'F1', quantity: { count: it.quantity } })),
              fulfillments: [{ id: 'F1', type: 'Delivery', tracking: true, state: { descriptor: { code: 'Serviceable' } } }],
              quote: quoteResult.ondcQuote,
            },
          },
        };
        break;
      }

      case 'init': {
        const items = payload.items || [{ id: 'km-agri-a4-75', quantity: { count: 10 } }];
        const billing = payload.billing || { name: 'Acme Enterprises', address: { city: 'Noida', state: 'Uttar Pradesh' } };
        const quoteResult = calculateQuote(items, billing.address);
        resultPayload = {
          context: buildCallbackContext(payload.context || { transaction_id: `sim_txn_${Date.now()}`, message_id: `sim_msg_${Date.now()}` }, 'on_init'),
          message: {
            order: {
              provider: { id: ondcConfig.seller.id },
              provider_location: { id: 'L1' },
              items: quoteResult.items.map((it) => ({ id: it.id, fulfillment_id: 'F1', quantity: { count: it.quantity } })),
              billing,
              fulfillments: [{ id: 'F1', type: 'Delivery', tracking: true }],
              quote: quoteResult.ondcQuote,
              payment: { type: 'ON-FULFILLMENT', status: 'NOT-PAID' },
            },
          },
        };
        break;
      }

      case 'confirm': {
        const orderId = payload.orderId || `sim_ord_${Date.now()}`;
        const items = payload.items || [{ id: 'km-agri-a4-75', quantity: { count: 10 } }];
        const context = payload.context || {
          transaction_id: `sim_txn_${Date.now()}`,
          message_id: `sim_msg_${Date.now()}`,
          domain: ondcConfig.domain,
        };
        const saved = createOndcOrder({
          ondcOrderId: orderId,
          context,
          orderPayload: {
            id: orderId,
            items,
            billing: payload.billing || { name: 'Acme Enterprises' },
          },
        });
        resultPayload = {
          context: buildCallbackContext(context, 'on_confirm'),
          message: {
            order: {
              id: saved.id,
              state: 'Created',
              grandTotal: saved.grandTotal,
              items: saved.items,
            },
          },
        };
        break;
      }

      case 'update_return': {
        const orderId = payload.orderId || getAllOndcOrders()[0]?.id;
        if (!orderId) {
          throw new Error('No confirmed order available to return. Please run confirm simulation first.');
        }
        const returnRes = handleBuyerInitiatedReturn({
          context: payload.context || { transaction_id: `sim_txn_${Date.now()}`, message_id: `sim_msg_${Date.now()}` },
          updatePayload: {
            update_target: 'fulfillment',
            order: {
              id: orderId,
              items: payload.items || [],
            },
          },
        });
        resultPayload = {
          returnType: returnRes.returnType,
          refundAmount: returnRes.totalRefundAmount,
          order: returnRes.onUpdateOrder,
        };
        break;
      }

      default:
        throw new Error(`Unsupported simulation scenario: '${scenario}'`);
    }

    return res.status(200).json({
      success: true,
      scenario,
      executionTimeMs: Date.now() - startTime,
      validation: validationReport,
      result: resultPayload,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      scenario,
      executionTimeMs: Date.now() - startTime,
      error: err.message,
    });
  }
});

/**
 * GET /api/admin/ondc/orders - Fetch all ONDC orders for admin dashboard
 */
ondcRouter.get('/api/admin/ondc/orders', (req, res) => {
  const orders = getAllOndcOrders();
  return res.status(200).json({
    success: true,
    total: orders.length,
    orders,
  });
});

/**
 * GET /api/admin/ondc/transactions - Fetch all state machine transaction records
 */
ondcRouter.get('/api/admin/ondc/transactions', (req, res) => {
  const transactions = stateManager.getAllTransactions();
  return res.status(200).json({
    success: true,
    total: transactions.length,
    transactions,
  });
});

/**
 * GET /api/admin/ondc/logs - Fetch recent audit and error logs
 */
ondcRouter.get('/api/admin/ondc/logs', (req, res) => {
  const limit = parseInt(req.query.limit || '100', 10);
  const logs = stateManager.getRecentLogs(limit);
  return res.status(200).json({
    success: true,
    total: logs.length,
    logs,
  });
});

/**
 * GET /api/admin/ondc/stats - Overview metrics
 */
ondcRouter.get('/api/admin/ondc/stats', (req, res) => {
  const orders = getAllOndcOrders();
  const transactions = stateManager.getAllTransactions();
  const logs = stateManager.getRecentLogs(200);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalReturns = orders.filter((o) => o.returnDetails || o.orderStatus === 'Return_Approved').length;
  const totalCancellations = orders.filter((o) => o.orderStatus === 'cancelled').length;

  return res.status(200).json({
    success: true,
    domain: ondcConfig.domain,
    coreVersion: ondcConfig.coreVersion,
    totalOrders: orders.length,
    totalRevenue,
    totalReturns,
    totalCancellations,
    activeTransactions: transactions.length,
    recentErrors: logs.filter((l) => l.error || l.status >= 400).length,
  });
});

/**
 * GET /api/admin/ondc/workbench/files - List all downloadable workbench files and kit info
 */
ondcRouter.get('/api/admin/ondc/workbench/files', (req, res) => {
  const workbenchDir = [
    path.join(projectRoot, 'public', 'ondc-workbench'),
    path.join(projectRoot, 'dist', 'ondc-workbench'),
  ].find((d) => fs.existsSync(d));

  if (!workbenchDir) {
    return res.status(404).json({ success: false, error: 'Workbench directory not found' });
  }

  try {
    const rawFiles = fs.readdirSync(workbenchDir);
    const files = rawFiles
      .filter((f) => f.endsWith('.json') || f.endsWith('.md'))
      .sort()
      .map((fileName) => {
        const filePath = path.join(workbenchDir, fileName);
        const stats = fs.statSync(filePath);
        return {
          filename: fileName,
          sizeBytes: stats.size,
          downloadUrl: `/ondc/download/workbench-file/${fileName}`,
        };
      });

    return res.status(200).json({
      success: true,
      totalFiles: files.length,
      files,
      kitDownloadUrl: '/ondc/download/workbench-kit',
      kitDirectUrl: '/ondc-workbench-kit.zip',
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Helper to stream / download workbench zip kit
 */
const serveWorkbenchZip = (req, res) => {
  const candidatePaths = [
    path.join(projectRoot, 'public', 'ondc-workbench-kit.zip'),
    path.join(projectRoot, 'dist', 'ondc-workbench-kit.zip'),
    path.join(projectRoot, 'ondc-workbench-kit.zip'),
  ];

  const zipPath = candidatePaths.find((p) => fs.existsSync(p));
  if (!zipPath) {
    return res.status(404).json({ success: false, error: 'Workbench ZIP package not found on server' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="ondc-workbench-kit.zip"');
  return res.sendFile(zipPath);
};

ondcRouter.get(['/download/workbench-kit', '/ondc/download/workbench-kit', '/ondc-workbench-kit.zip'], serveWorkbenchZip);

/**
 * GET /ondc/download/workbench-file/:filename - Download individual scenario file
 */
ondcRouter.get(
  ['/download/workbench-file/:filename', '/ondc/download/workbench-file/:filename'],
  (req, res) => {
  const rawFilename = req.params.filename || '';
  const filename = path.basename(rawFilename);

  if (!filename || (!filename.endsWith('.json') && !filename.endsWith('.md'))) {
    return res.status(400).json({ success: false, error: 'Invalid file requested' });
  }

  const candidateDirs = [
    path.join(projectRoot, 'public', 'ondc-workbench'),
    path.join(projectRoot, 'dist', 'ondc-workbench'),
  ];

  let targetPath = null;
  for (const dir of candidateDirs) {
    const p = path.join(dir, filename);
    if (fs.existsSync(p)) {
      targetPath = p;
      break;
    }
  }

  if (!targetPath) {
    return res.status(404).json({ success: false, error: `File '${filename}' not found` });
  }

  res.setHeader('Content-Type', filename.endsWith('.json') ? 'application/json' : 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.sendFile(targetPath);
});

export default ondcRouter;

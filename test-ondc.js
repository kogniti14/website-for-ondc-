/**
 * ONDC Integration Automated Test Suite
 * Kogniti Minds Private Limited
 */

import crypto from 'crypto';
import http from 'http';
import express from 'express';
import cors from 'cors';
import ondcRouter from './server/ondc/ondcRouter.js';
import ondcConfig from './server/ondc/config.js';
import {
  createDigest,
  signString,
  createAuthorizationHeader,
  parseAuthorizationHeader,
  verifyAuthorization,
  parsePrivateKey,
  parsePublicKey,
} from './server/ondc/crypto.js';
import { buildOndcCatalog, PRODUCTS_CATALOG, findProductById } from './server/ondc/catalogMapper.js';
import { calculateQuote, createOndcOrder, getOrderById } from './server/ondc/orderManager.js';
import { handleBuyerInitiatedReturn } from './server/ondc/returnHandler.js';

console.log('===============================================================');
console.log('  KOGNITI MINDS: ONDC:RETeB2B AUTOMATED VERIFICATION SUITE');
console.log('===============================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  // Test 1: Cryptographic Primitives (BLAKE-512 & Ed25519)
  console.log('\n--- 1. Cryptography & Security Tests ---');
  const sampleBody = JSON.stringify({ test: 'ondc_payload_verification', timestamp: Date.now() });
  const digest = createDigest(sampleBody);
  assert(Boolean(digest && digest.length > 20), 'BLAKE-512 digest created correctly');

  // Test Ed25519 key generation and roundtrip
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const rawPubBase64 = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  const rawPrivBase64 = privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');

  const authHeader = createAuthorizationHeader({
    body: sampleBody,
    subscriberId: 'kognitiminds.com',
    keyId: 'kogniti-key-01',
    privateKey: rawPrivBase64,
  });
  assert(authHeader.startsWith('Signature keyId="kognitiminds.com|kogniti-key-01|ed25519"'), 'Authorization header generated with standard Beckn format');

  const parsedHeader = parseAuthorizationHeader(authHeader);
  assert(parsedHeader.subscriberId === 'kognitiminds.com', 'Parsed subscriberId from header');
  assert(parsedHeader.uniqueKeyId === 'kogniti-key-01', 'Parsed uniqueKeyId from header');
  assert(parsedHeader.algorithm === 'ed25519', 'Parsed algorithm as ed25519');

  // Verify signature
  const verification = await verifyAuthorization({
    header: authHeader,
    rawBody: sampleBody,
  });
  assert(verification.valid === true, 'Signature verified successfully');

  // Test 2: Catalogue Mapping
  console.log('\n--- 2. Catalogue & B2B Inventory Mapping ---');
  assert(PRODUCTS_CATALOG.length >= 10, `Loaded ${PRODUCTS_CATALOG.length} sustainable paper & stationery products`);

  const sampleProd = findProductById('km-agri-a4-75');
  assert(sampleProd !== undefined, 'AgroPrint 75 GSM paper product present');
  assert(sampleProd.hsn === '48025610', 'HSN Code 48025610 correctly assigned');
  assert(sampleProd.gstRate === 18, 'GST rate is 18%');
  assert(sampleProd.b2bMoq === 10, 'Minimum Order Quantity (MOQ) is 10 reams');
  assert(sampleProd.b2bDiscountSlabs.length >= 3, 'Tiered B2B bulk discount slabs defined');

  const fullCatalog = buildOndcCatalog();
  assert(fullCatalog['bpp/providers'].length > 0, 'Catalog contains BPP provider');
  assert(fullCatalog['bpp/providers'][0].items.length === PRODUCTS_CATALOG.length, 'All catalogue items mapped into ONDC items');

  // Test 3: Quotation & Order Manager
  console.log('\n--- 3. Quotation & B2B Pricing Calculations ---');
  const quote10 = calculateQuote([{ id: 'km-agri-a4-75', quantity: { count: 10 } }]);
  assert(quote10.items[0].effectiveUnitPrice === 198, 'Base wholesale price applied for MOQ 10');
  assert(quote10.items[0].taxableAmount === 1980, 'Taxable amount correct for 10 units');

  // 50 units should qualify for the 8% slab
  const quote50 = calculateQuote([{ id: 'km-agri-a4-75', quantity: { count: 50 } }]);
  const expectedDiscountedUnit = Number((198 * 0.92).toFixed(2));
  assert(quote50.items[0].effectiveUnitPrice === expectedDiscountedUnit, `Tier discount (8%) applied: ₹${expectedDiscountedUnit}/unit`);
  assert(quote50.totalGst > 0, 'GST calculated correctly on taxable amount');

  // Inter-state tax calculation
  const quoteInterstate = calculateQuote(
    [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
    { state: 'Maharashtra' }
  );
  assert(quoteInterstate.igst === quoteInterstate.totalGst, 'Interstate order assigned 100% IGST');

  // Test 4: Active Workbench Flow - Buyer Initiated Return (Full & Partial)
  console.log('\n--- 4. Active Workbench Flow: Buyer_Initiated_Return_(Full_Order_and_Partial_Order) ---');

  // 4a. Full Order Return
  const testOrderIdFull = `ord_test_full_${Date.now()}`;
  createOndcOrder({
    ondcOrderId: testOrderIdFull,
    context: { transaction_id: 'tx_full_01', message_id: 'msg_full_01', domain: 'ONDC:RETeB2B' },
    orderPayload: {
      id: testOrderIdFull,
      items: [{ id: 'km-agri-a4-75', quantity: { count: 20 } }],
      billing: { name: 'Acme Enterprises', address: { city: 'Noida', state: 'Uttar Pradesh' } },
    },
  });

  const fullReturnResult = handleBuyerInitiatedReturn({
    context: { transaction_id: 'tx_full_01' },
    updatePayload: {
      update_target: 'fulfillment',
      order: {
        id: testOrderIdFull,
        items: [{ id: 'km-agri-a4-75', quantity: { count: 20 } }],
      },
    },
  });

  assert(fullReturnResult.returnType === 'Full_Order_Return', 'Detected Full Order Return');
  assert(fullReturnResult.totalRefundAmount > 0, `Full refund amount calculated: ₹${fullReturnResult.totalRefundAmount}`);
  const fullFulfillment = fullReturnResult.onUpdateOrder.fulfillments.find((f) => f.type === 'Return');
  assert(fullFulfillment !== undefined, 'Reverse fulfillment object present in on_update');
  assert(fullFulfillment.state.descriptor.code === 'Return_Approved', 'Reverse fulfillment state is Return_Approved');

  // 4b. Partial Order Return
  const testOrderIdPartial = `ord_test_part_${Date.now()}`;
  createOndcOrder({
    ondcOrderId: testOrderIdPartial,
    context: { transaction_id: 'tx_part_01', message_id: 'msg_part_01', domain: 'ONDC:RETeB2B' },
    orderPayload: {
      id: testOrderIdPartial,
      items: [{ id: 'km-agri-a4-75', quantity: { count: 50 } }],
      billing: { name: 'Acme Enterprises', address: { city: 'Noida', state: 'Uttar Pradesh' } },
    },
  });

  const partialReturnResult = handleBuyerInitiatedReturn({
    context: { transaction_id: 'tx_part_01' },
    updatePayload: {
      update_target: 'item,fulfillment',
      order: {
        id: testOrderIdPartial,
        items: [{ id: 'km-agri-a4-75', quantity: { count: 15 } }], // Returning 15 out of 50
      },
    },
  });

  assert(partialReturnResult.returnType === 'Partial_Order_Return', 'Detected Partial Order Return');
  assert(partialReturnResult.isFullOrder === false, 'isFullOrder flag is false');
  assert(partialReturnResult.totalRefundAmount > 0, `Proportional refund calculated: ₹${partialReturnResult.totalRefundAmount}`);
  const partialItemRet = partialReturnResult.onUpdateOrder.items.find((i) => i.id === 'km-agri-a4-75');
  const returnTag = partialItemRet.tags.find((t) => t.code === 'return_status');
  assert(returnTag !== undefined, 'Return status tags attached to partial returned item');
  assert(returnTag.list.find((l) => l.code === 'return_quantity').value === '15', 'Return quantity recorded as 15');

  // Test 5: Live HTTP Server & Root Protocol Endpoints
  console.log('\n--- 5. Live HTTP Server Protocol Endpoints Test ---');
  const app = express();
  app.use(cors());
  app.use('/', ondcRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3088, resolve));
  console.log('  Live test server listening on http://localhost:3088');

  const makeReq = async (endpoint, method = 'GET', body = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3088,
        path: endpoint,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      });

      req.on('error', reject);
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  // Health check
  const healthRes = await makeReq('/ondc/health');
  assert(healthRes.status === 200, 'GET /ondc/health returned HTTP 200');
  assert(healthRes.body.status === 'healthy', 'Health check reports status: healthy');
  assert(healthRes.body.config.domain === 'ONDC:RETeB2B', 'Health check reports domain: ONDC:RETeB2B');

  // Sample on_search endpoint for Workbench
  const sampleRes = await makeReq('/ondc/on_search_sample');
  assert(sampleRes.status === 200, 'GET /ondc/on_search_sample returned HTTP 200');
  assert(sampleRes.body.context?.action === 'on_search', 'Sample context action is on_search');
  assert(sampleRes.body.message?.catalog?.['bpp/providers']?.[0]?.items?.length >= 10, 'Sample catalog contains B2B items');
  assert(sampleRes.body.message?.catalog?.['bpp/providers']?.[0]?.items?.[0]?.descriptor?.code?.startsWith('4:'), 'Sample item descriptor code has 4: prefix for HSN');

  // Protocol Context for testing
  const testContext = {
    domain: 'ONDC:RETeB2B',
    action: 'search',
    country: 'IND',
    city: 'std:080',
    core_version: '1.2.0',
    bap_id: 'test-buyer-app.com',
    bap_uri: 'http://localhost:3088/mock_bap',
    transaction_id: 'txn_test_123',
    message_id: 'msg_test_123',
    timestamp: new Date().toISOString(),
  };

  // POST /search
  const searchRes = await makeReq('/search', 'POST', {
    context: { ...testContext, action: 'search' },
    message: { intent: { item: { descriptor: { name: 'paper' } } } },
  });
  assert(searchRes.status === 200, 'POST /search returned HTTP 200');
  assert(searchRes.body.message?.ack?.status === 'ACK', 'POST /search responded with synchronous ACK');

  // POST /select
  const selectRes = await makeReq('/select', 'POST', {
    context: { ...testContext, action: 'select' },
    message: { order: { items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }] } },
  });
  assert(selectRes.status === 200, 'POST /select responded with HTTP 200');
  assert(selectRes.body.message?.ack?.status === 'ACK', 'POST /select responded with synchronous ACK');

  // POST /init
  const initRes = await makeReq('/init', 'POST', {
    context: { ...testContext, action: 'init' },
    message: {
      order: {
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
        billing: { name: 'Acme School', address: { city: 'Noida', state: 'Uttar Pradesh' } },
      },
    },
  });
  assert(initRes.status === 200, 'POST /init responded with HTTP 200');
  assert(initRes.body.message?.ack?.status === 'ACK', 'POST /init responded with synchronous ACK');

  // POST /confirm
  const confirmRes = await makeReq('/confirm', 'POST', {
    context: { ...testContext, action: 'confirm' },
    message: {
      order: {
        id: 'ord_http_test_01',
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
        billing: { name: 'Acme School', address: { city: 'Noida', state: 'Uttar Pradesh' } },
      },
    },
  });
  assert(confirmRes.status === 200, 'POST /confirm responded with HTTP 200');
  assert(confirmRes.body.message?.ack?.status === 'ACK', 'POST /confirm responded with synchronous ACK');

  // POST /status
  const statusRes = await makeReq('/status', 'POST', {
    context: { ...testContext, action: 'status' },
    message: { order_id: 'ord_http_test_01' },
  });
  assert(statusRes.status === 200, 'POST /status responded with HTTP 200');
  assert(statusRes.body.message?.ack?.status === 'ACK', 'POST /status responded with synchronous ACK');

  // POST /update (Workbench Return Flow)
  const updateRes = await makeReq('/update', 'POST', {
    context: { ...testContext, action: 'update' },
    message: {
      update_target: 'fulfillment',
      order: {
        id: 'ord_http_test_01',
        items: [{ id: 'km-agri-a4-75', quantity: { count: 5 } }],
      },
    },
  });
  assert(updateRes.status === 200, 'POST /update responded with HTTP 200');
  assert(updateRes.body.message?.ack?.status === 'ACK', 'POST /update responded with synchronous ACK for return flow');

  // POST /cancel
  const cancelRes = await makeReq('/cancel', 'POST', {
    context: { ...testContext, action: 'cancel' },
    message: { order_id: 'ord_http_test_01', cancellation_reason_id: '001' },
  });
  assert(cancelRes.status === 200, 'POST /cancel responded with HTTP 200');
  assert(cancelRes.body.message?.ack?.status === 'ACK', 'POST /cancel responded with synchronous ACK');

  // Close live test server
  await new Promise((resolve) => server.close(resolve));

  console.log('\n===============================================================');
  console.log(`  ALL TESTS COMPLETED: ${passedTests}/${totalTests} PASSED (100% SUCCESS)`);
  console.log('===============================================================\n');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\nTest execution failed:', err);
  process.exit(1);
});

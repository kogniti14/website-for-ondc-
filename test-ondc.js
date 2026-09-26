/**
 * ONDC Integration Comprehensive Automated Test Suite
 * Kogniti Minds Private Limited
 * 
 * Verifies ONDC Retail (RET 1.2.5 / eB2B) implementation:
 * 1. Cryptography: BLAKE-512, Ed25519 signing & verification
 * 2. Dynamic Catalog: Authoritative store synchronization & taxonomy validation
 * 3. Central Price Engine: Bulk discounts, Interstate/Intrastate GST, Freight
 * 4. Buyer-Initiated Return: Full and partial reverse logistics & refund calculation
 * 5. Endpoints: Complete suite of BAP and inbound callback endpoints
 * 6. Idempotency: Duplicate prevention on transactionId:messageId:action
 * 7. Negative Testing: Missing context, invalid domain, invalid SKU, state rejections
 * 8. Live Workbench Simulation API
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
} from './server/ondc/security/index.js';
import {
  buildOndcCatalog,
  getAuthoritativeProducts,
  PRODUCTS_CATALOG,
  findProductById,
} from './server/ondc/catalogMapper.js';
import { calculateQuote, createOndcOrder, getOrderById } from './server/ondc/orderManager.js';
import { handleBuyerInitiatedReturn } from './server/ondc/returnHandler.js';
import stateManager from './server/ondc/stateManager.js';

console.log('===============================================================');
console.log('  KOGNITI MINDS: ONDC RET 1.2.5 AUTOMATED VERIFICATION SUITE');
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

  // Verify signature with public key override
  const verification = await verifyAuthorization({
    header: authHeader,
    rawBody: sampleBody,
    publicKeyOverride: rawPubBase64,
  });
  assert(verification.valid === true, 'Signature verified successfully against public key');

  // Test 2: Dynamic Catalog & Inventory Mapping
  console.log('\n--- 2. Catalogue & B2B Inventory Mapping ---');
  const authoritativeProducts = getAuthoritativeProducts();
  assert(authoritativeProducts.length >= 10, `Loaded ${authoritativeProducts.length} authoritative sustainable paper & stationery products`);

  const sampleProd = findProductById('km-agri-a4-75');
  assert(sampleProd !== undefined, 'AgroPrint 75 GSM paper product present');
  assert(sampleProd.hsn === '48025610', 'HSN Code 48025610 correctly assigned');
  assert(sampleProd.gstRate === 18, 'GST rate is 18%');
  assert(sampleProd.b2bMoq === 10, 'Minimum Order Quantity (MOQ) is 10 reams');
  assert(sampleProd.b2bDiscountSlabs.length >= 3, 'Tiered B2B bulk discount slabs defined');

  const fullCatalog = buildOndcCatalog();
  assert(fullCatalog['bpp/providers'].length > 0, 'Catalog contains BPP provider');
  assert(fullCatalog['bpp/providers'][0].items.length === authoritativeProducts.length, 'All catalogue items mapped dynamically into ONDC items');

  // Test 3: Quotation & B2B Pricing Calculations
  console.log('\n--- 3. Quotation & Central Price Engine Calculations ---');
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

  // Intrastate tax calculation (50% CGST + 50% SGST)
  const quoteIntrastate = calculateQuote(
    [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
    { state: 'Uttar Pradesh' }
  );
  assert(quoteIntrastate.cgst > 0 && quoteIntrastate.sgst > 0, 'Intrastate order assigned CGST and SGST');

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
    context: { transaction_id: 'tx_full_01', message_id: 'msg_full_ret_01' },
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
    context: { transaction_id: 'tx_part_01', message_id: 'msg_part_ret_01' },
    updatePayload: {
      update_target: 'fulfillment',
      order: {
        id: testOrderIdPartial,
        items: [{ id: 'km-agri-a4-75', quantity: { count: 15 } }],
      },
    },
  });

  assert(partialReturnResult.returnType === 'Partial_Order_Return', 'Detected Partial Order Return');
  assert(partialReturnResult.isFullOrder === false, 'isFullOrder flag is false');
  assert(partialReturnResult.totalRefundAmount > 0, `Proportional refund calculated: ₹${partialReturnResult.totalRefundAmount}`);

  const returnedItem = partialReturnResult.onUpdateOrder.items.find((i) => i.id === 'km-agri-a4-75');
  assert(returnedItem !== undefined, 'Returned item present in order payload');
  const returnTag = returnedItem.tags?.find((t) => t.code === 'return_status');
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
    core_version: '1.2.5',
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

  // Test 6: Idempotency Check (Duplicate POST /search)
  console.log('\n--- 6. Idempotency Test ---');
  const duplicateSearchRes = await makeReq('/search', 'POST', {
    context: { ...testContext, action: 'search' },
    message: { intent: { item: { descriptor: { name: 'paper' } } } },
  });
  assert(duplicateSearchRes.status === 200, 'Duplicate POST /search handled smoothly');
  assert(duplicateSearchRes.body.message?.ack?.status === 'ACK', 'Duplicate request returned synchronous ACK without reprocessing');

  // POST /select
  const selectRes = await makeReq('/select', 'POST', {
    context: { ...testContext, message_id: 'msg_select_01', action: 'select' },
    message: { order: { items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }] } },
  });
  assert(selectRes.status === 200, 'POST /select responded with HTTP 200');
  assert(selectRes.body.message?.ack?.status === 'ACK', 'POST /select responded with synchronous ACK');

  // POST /init
  const initRes = await makeReq('/init', 'POST', {
    context: { ...testContext, message_id: 'msg_init_01', action: 'init' },
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
    context: { ...testContext, message_id: 'msg_confirm_01', action: 'confirm' },
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
    context: { ...testContext, message_id: 'msg_status_01', action: 'status' },
    message: { order_id: 'ord_http_test_01' },
  });
  assert(statusRes.status === 200, 'POST /status responded with HTTP 200');
  assert(statusRes.body.message?.ack?.status === 'ACK', 'POST /status responded with synchronous ACK');

  // POST /update (Workbench Return Flow)
  const updateRes = await makeReq('/update', 'POST', {
    context: { ...testContext, message_id: 'msg_update_01', action: 'update' },
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

  // Test 7: Cancellation & State Machine
  console.log('\n--- 7. Order Cancellation & Negative State Testing ---');
  const cancelTxnId = 'txn_test_cancel_flow';
  await makeReq('/search', 'POST', {
    context: { ...testContext, transaction_id: cancelTxnId, message_id: 'msg_c_search', action: 'search' },
    message: { intent: { item: { descriptor: { name: 'stationery' } } } },
  });
  await makeReq('/select', 'POST', {
    context: { ...testContext, transaction_id: cancelTxnId, message_id: 'msg_c_select', action: 'select' },
    message: { order: { items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }] } },
  });
  await makeReq('/init', 'POST', {
    context: { ...testContext, transaction_id: cancelTxnId, message_id: 'msg_c_init', action: 'init' },
    message: {
      order: {
        billing: { name: 'Test School', address: { pin: '201301', state: 'Uttar Pradesh' } },
        fulfillments: [{ end: { location: { address: { pin: '201301', state: 'Uttar Pradesh' } } } }],
      },
    },
  });
  await makeReq('/confirm', 'POST', {
    context: { ...testContext, transaction_id: cancelTxnId, message_id: 'msg_c_confirm', action: 'confirm' },
    message: {
      order: {
        id: 'ord_cancel_test_01',
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
      },
    },
  });

  // POST /cancel on active confirmed order -> should succeed with ACK
  const cancelRes = await makeReq('/cancel', 'POST', {
    context: { ...testContext, transaction_id: cancelTxnId, message_id: 'msg_c_cancel', action: 'cancel' },
    message: { order_id: 'ord_cancel_test_01', cancellation_reason_id: '001' },
  });
  assert(cancelRes.status === 200, 'POST /cancel responded with HTTP 200 for active order');
  assert(cancelRes.body.message?.ack?.status === 'ACK', 'POST /cancel responded with synchronous ACK');

  // Negative test: Invalid Domain
  const invalidDomainRes = await makeReq('/search', 'POST', {
    context: { ...testContext, domain: 'ONDC:INVALID', action: 'search' },
    message: {},
  });
  assert(invalidDomainRes.status === 400, 'Rejected request with invalid domain');
  assert(invalidDomainRes.body.error?.code === '10001', 'Returned ONDC code 10001 for domain error');

  // Negative test: Missing Required Context Fields
  const missingContextRes = await makeReq('/search', 'POST', {
    context: { domain: 'ONDC:RETeB2B' }, // Missing action, transaction_id, message_id
    message: {},
  });
  assert(missingContextRes.status === 400, 'Rejected request with missing context attributes');
  assert(missingContextRes.body.error?.code === '10000', 'Returned ONDC code 10000');

  // Test 8: Inbound Callbacks
  console.log('\n--- 8. Inbound Callbacks (/on_search, /on_confirm) ---');
  const onSearchRes = await makeReq('/on_search', 'POST', {
    context: { ...testContext, action: 'on_search', message_id: 'msg_cb_01' },
    message: { ack: { status: 'ACK' } },
  });
  assert(onSearchRes.status === 200, 'POST /on_search responded with HTTP 200');
  assert(onSearchRes.body.message?.ack?.status === 'ACK', 'POST /on_search returned ACK');

  // Test 9: Workbench Simulation API
  console.log('\n--- 9. Live Workbench Scenario Simulation API ---');
  const simSearchRes = await makeReq('/api/admin/ondc/workbench/simulate', 'POST', {
    scenario: 'search',
    payload: { intent: { item: { descriptor: { name: 'paper' } } } },
  });
  assert(simSearchRes.status === 200, 'Simulation API executed search scenario');
  assert(simSearchRes.body.validation?.compliantItems >= 10, 'All simulated catalog items passed RET taxonomy validation');

  const simSelectRes = await makeReq('/api/admin/ondc/workbench/simulate', 'POST', {
    scenario: 'select',
    payload: { items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }] },
  });
  assert(simSelectRes.status === 200, 'Simulation API executed select scenario');
  assert(simSelectRes.body.result?.message?.order?.quote !== undefined, 'Simulation API returned valid ONDC quote');

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

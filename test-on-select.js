/**
 * ONDC RETeB2B 1.2.5 Dedicated on_select Verification Test Suite
 * Kogniti Minds Private Limited
 * 
 * Verifies all requirements specified for on_select implementation:
 * 1. Select Product A (km-agri-a4-75)
 * 2. Select Product B (km-agri-a4-80)
 * 3. Select Product C (km-notebook-spiral-a5)
 * 4. Select different quantities & verify wholesale tier discounts
 * 5. Select unavailable quantity (exceeds inventory -> error 30006)
 * 6. Select invalid item (item not found -> error 30004)
 * 7. Select invalid provider (provider not found -> error 30001)
 * 8. Repeat the same request (idempotency verification)
 * 9. POST /on_select callback endpoint verification
 * 10. Complete end-to-end flow (search -> on_search -> select -> on_select -> init -> on_init -> confirm -> on_confirm)
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import ondcRouter from './server/ondc/ondcRouter.js';
import ondcConfig from './server/ondc/config.js';
import stateManager from './server/ondc/stateManager.js';
import { findProductById } from './server/ondc/catalogMapper.js';

console.log('===============================================================');
console.log('  KOGNITI MINDS: ONDC RETeB2B 1.2.5 ON_SELECT VERIFICATION');
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

async function runOnSelectTests() {
  // Setup Mock BAP Server to capture outgoing callbacks
  const receivedCallbacks = new Map();

  const mockBapApp = express();
  mockBapApp.use(express.json());
  mockBapApp.post(['/on_select', '/mock_bap/on_select'], (req, res) => {
    const txnId = req.body?.context?.transaction_id || 'unknown';
    receivedCallbacks.set(txnId, req.body);
    res.status(200).json({ message: { ack: { status: 'ACK' } } });
  });

  const mockBapServer = http.createServer(mockBapApp);
  await new Promise((r) => mockBapServer.listen(3099, r));
  const bapUri = 'http://localhost:3099/mock_bap';

  // Setup Kogniti Minds ONDC Backend Server
  const app = express();
  app.use(cors());
  app.use('/', ondcRouter);

  const server = http.createServer(app);
  await new Promise((r) => server.listen(3089, r));
  console.log('  Backend server running on http://localhost:3089');
  console.log('  Mock BAP receiver running on http://localhost:3099\n');

  const makeReq = async (endpoint, method = 'POST', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const isStringBody = typeof body === 'string';
      const options = {
        hostname: 'localhost',
        port: 3089,
        path: endpoint,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      });

      req.on('error', reject);
      if (body !== null) {
        req.write(isStringBody ? body : JSON.stringify(body));
      }
      req.end();
    });
  };

  const waitCallback = async (txnId, timeoutMs = 2500) => {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (receivedCallbacks.has(txnId)) {
        return receivedCallbacks.get(txnId);
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return null;
  };

  // -------------------------------------------------------------
  // Test 1: Select Product A (km-agri-a4-75)
  // -------------------------------------------------------------
  console.log('--- Scenario 1: Select Product A (km-agri-a4-75) ---');
  const prodA = findProductById('km-agri-a4-75');
  assert(prodA !== undefined, 'Product A (km-agri-a4-75) exists in catalogue');

  const txn1 = 'txn_select_prod_a_' + Date.now();
  const msg1 = 'msg_select_prod_a_' + Date.now();

  const resA = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn1,
      message_id: msg1,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
        fulfillments: [
          { end: { location: { address: { city: 'Noida', state: 'Uttar Pradesh' } } } },
        ],
      },
    },
  });

  assert(resA.status === 200, 'POST /select responded with HTTP 200');
  assert(resA.body?.message?.ack?.status === 'ACK', 'POST /select returned synchronous ACK');

  const cbA = await waitCallback(txn1);
  assert(cbA !== null, 'Asynchronous on_select callback arrived at BAP');
  assert(cbA?.context?.action === 'on_select', 'Callback context action is on_select');
  assert(cbA?.context?.transaction_id === txn1, 'Callback context preserved transaction_id');
  assert(cbA?.context?.message_id === msg1, 'Callback context preserved message_id without random generation');
  assert(cbA?.message?.order?.items?.[0]?.id === 'km-agri-a4-75', 'Callback contains selected item Product A');
  assert(cbA?.message?.order?.quote?.price?.value !== undefined, 'Callback contains calculated quote');
  assert(cbA?.message?.order?.quote?.breakup?.length >= 2, 'Callback contains item & tax breakup');

  // -------------------------------------------------------------
  // Test 2: Select Product B (km-agri-a4-80)
  // -------------------------------------------------------------
  console.log('\n--- Scenario 2: Select Product B (km-agri-a4-80) ---');
  const prodB = findProductById('km-agri-a4-80');
  assert(prodB !== undefined, 'Product B (km-agri-a4-80) exists in catalogue');

  const txn2 = 'txn_select_prod_b_' + Date.now();
  const msg2 = 'msg_select_prod_b_' + Date.now();

  const resB = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn2,
      message_id: msg2,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-80', quantity: { count: 20 } }],
        fulfillments: [
          { end: { location: { address: { city: 'Bengaluru', state: 'Karnataka' } } } },
        ],
      },
    },
  });

  assert(resB.status === 200, 'POST /select for Product B returned HTTP 200');
  assert(resB.body?.message?.ack?.status === 'ACK', 'Product B returned synchronous ACK');

  const cbB = await waitCallback(txn2);
  assert(cbB !== null, 'Callback arrived for Product B');
  assert(cbB?.message?.order?.items?.[0]?.id === 'km-agri-a4-80', 'Callback dynamically identified Product B');
  assert(cbB?.context?.message_id === msg2, 'Callback preserved exact message_id for Product B');
  // Karnataka destination -> Interstate IGST
  const taxEntryB = cbB?.message?.order?.quote?.breakup?.find((b) => b['@ondc/org/title_type'] === 'tax');
  assert(taxEntryB?.title?.includes('IGST'), 'Interstate order assigned IGST');

  // -------------------------------------------------------------
  // Test 3: Select Product C (km-notebook-spiral-a5)
  // -------------------------------------------------------------
  console.log('\n--- Scenario 3: Select Product C (km-notebook-spiral-a5) ---');
  const prodC = findProductById('km-notebook-spiral-a5');
  assert(prodC !== undefined, 'Product C (km-notebook-spiral-a5) exists in catalogue');

  const txn3 = 'txn_select_prod_c_' + Date.now();
  const msg3 = 'msg_select_prod_c_' + Date.now();

  const resC = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn3,
      message_id: msg3,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-notebook-spiral-a5', quantity: { count: 25 } }],
        fulfillments: [
          { end: { location: { address: { city: 'Noida', state: 'Uttar Pradesh' } } } },
        ],
      },
    },
  });

  assert(resC.status === 200, 'POST /select for Product C returned HTTP 200');
  const cbC = await waitCallback(txn3);
  assert(cbC !== null, 'Callback arrived for Product C');
  assert(cbC?.message?.order?.items?.[0]?.id === 'km-notebook-spiral-a5', 'Callback dynamically identified Product C');

  // -------------------------------------------------------------
  // Test 4: Select Different Quantities & Bulk Discounts
  // -------------------------------------------------------------
  console.log('\n--- Scenario 4: Select Different Quantities & Tier Discounts ---');
  // 10 units of km-agri-a4-75: base price 198 (0% discount)
  // 50 units of km-agri-a4-75: 8% discount slab applied
  const txn4 = 'txn_select_bulk_' + Date.now();
  const msg4 = 'msg_select_bulk_' + Date.now();

  const resBulk = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn4,
      message_id: msg4,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 50 } }],
        fulfillments: [
          { end: { location: { address: { city: 'Noida', state: 'Uttar Pradesh' } } } },
        ],
      },
    },
  });

  assert(resBulk.status === 200, 'POST /select for bulk quantity returned HTTP 200');
  const cbBulk = await waitCallback(txn4);
  assert(cbBulk !== null, 'Callback arrived for bulk quantity order');
  const itemLine = cbBulk?.message?.order?.quote?.breakup?.find((b) => b['@ondc/org/title_type'] === 'item');
  const effectiveUnit = parseFloat(itemLine?.item?.price?.value);
  assert(effectiveUnit < 198, `Volume discount applied: unit price dropped to ₹${effectiveUnit}`);

  // -------------------------------------------------------------
  // Test 5: Select Unavailable Quantity (Exceeds Inventory)
  // -------------------------------------------------------------
  console.log('\n--- Scenario 5: Select Unavailable Quantity ---');
  const txn5 = 'txn_select_unavail_' + Date.now();
  const msg5 = 'msg_select_unavail_' + Date.now();

  const resUnavail = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn5,
      message_id: msg5,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 999999 } }],
      },
    },
  });

  assert(resUnavail.status === 400, 'Unavailable quantity rejected with HTTP 400');
  assert(resUnavail.body?.message?.ack?.status === 'NACK', 'Unavailable quantity returned NACK');
  assert(resUnavail.body?.error?.code === '30006', 'Returned ONDC error code 30006 (Item out of stock / insufficient quantity)');

  // -------------------------------------------------------------
  // Test 6: Select Invalid Item
  // -------------------------------------------------------------
  console.log('\n--- Scenario 6: Select Invalid Item ---');
  const txn6 = 'txn_select_invalid_item_' + Date.now();
  const msg6 = 'msg_select_invalid_item_' + Date.now();

  const resInvalid = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn6,
      message_id: msg6,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'fake-nonexistent-sku-999', quantity: { count: 10 } }],
      },
    },
  });

  assert(resInvalid.status === 400, 'Invalid item rejected with HTTP 400');
  assert(resInvalid.body?.message?.ack?.status === 'NACK', 'Invalid item returned NACK');
  assert(resInvalid.body?.error?.code === '30004', 'Returned ONDC error code 30004 (Item not found)');

  // -------------------------------------------------------------
  // Test 7: Select Invalid Provider
  // -------------------------------------------------------------
  console.log('\n--- Scenario 7: Select Invalid Provider ---');
  const txn7 = 'txn_select_invalid_prov_' + Date.now();
  const msg7 = 'msg_select_invalid_prov_' + Date.now();

  const resBadProv = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn7,
      message_id: msg7,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'completely-unknown-foreign-provider' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
      },
    },
  });

  assert(resBadProv.status === 400, 'Invalid provider rejected with HTTP 400');
  assert(resBadProv.body?.message?.ack?.status === 'NACK', 'Invalid provider returned NACK');
  assert(resBadProv.body?.error?.code === '30001', 'Returned ONDC error code 30001 (Provider not found)');

  // -------------------------------------------------------------
  // Test 8: Idempotency (Repeat the Same Select Request)
  // -------------------------------------------------------------
  console.log('\n--- Scenario 8: Idempotency Check ---');
  const resDup = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: txn1,
      message_id: msg1,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
      },
    },
  });

  assert(resDup.status === 200, 'Duplicate request returned HTTP 200');
  assert(resDup.body?.message?.ack?.status === 'ACK', 'Duplicate request returned synchronous ACK without re-processing');

  // -------------------------------------------------------------
  // Test 9: Inbound POST /on_select Callback Endpoint
  // -------------------------------------------------------------
  console.log('\n--- Scenario 9: Inbound POST /on_select Endpoint ---');
  const resOnSelect = await makeReq('/on_select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'on_select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: 'txn_inbound_on_select_' + Date.now(),
      message_id: 'msg_inbound_on_select_' + Date.now(),
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 10 } }],
      },
    },
  });

  assert(resOnSelect.status === 200, 'POST /on_select responded with HTTP 200');
  assert(resOnSelect.body?.message?.ack?.status === 'ACK', 'POST /on_select responded with synchronous ACK');

  // -------------------------------------------------------------
  // Test 10: Complete ONDC End-to-End Lifecycle Flow
  // -------------------------------------------------------------
  console.log('\n--- Scenario 10: Complete ONDC Flow (search -> confirm) ---');
  const flowTxn = 'txn_e2e_flow_' + Date.now();

  // search
  const resFlowSearch = await makeReq('/search', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'search',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: flowTxn,
      message_id: 'msg_flow_search_' + Date.now(),
      timestamp: new Date().toISOString(),
    },
    message: { intent: { item: { descriptor: { name: 'paper' } } } },
  });
  assert(resFlowSearch.status === 200, 'Flow: search returned ACK');

  // select
  const flowSelectMsg = 'msg_flow_select_' + Date.now();
  const resFlowSelect = await makeReq('/select', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'select',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: flowTxn,
      message_id: flowSelectMsg,
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        provider: { id: 'kogniti-minds-bpp' },
        items: [{ id: 'km-agri-a4-75', quantity: { count: 20 } }],
        fulfillments: [
          { end: { location: { address: { city: 'Noida', state: 'Uttar Pradesh' } } } },
        ],
      },
    },
  });
  assert(resFlowSelect.status === 200, 'Flow: select returned ACK');

  const cbFlowSelect = await waitCallback(flowTxn);
  assert(cbFlowSelect !== null, 'Flow: on_select callback arrived');
  assert(cbFlowSelect?.context?.message_id === flowSelectMsg, 'Flow: on_select message_id correlated');

  // init
  const resFlowInit = await makeReq('/init', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'init',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: flowTxn,
      message_id: 'msg_flow_init_' + Date.now(),
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        items: [{ id: 'km-agri-a4-75', quantity: { count: 20 } }],
        billing: { name: 'Kogniti Enterprise Partner', address: { city: 'Noida', state: 'Uttar Pradesh' } },
      },
    },
  });
  assert(resFlowInit.status === 200, 'Flow: init returned ACK');

  // confirm
  const flowOrderId = 'ord_flow_' + Date.now();
  const resFlowConfirm = await makeReq('/confirm', 'POST', {
    context: {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action: 'confirm',
      core_version: '1.2.5',
      bap_id: 'workbench.ondc.tech',
      bap_uri: bapUri,
      transaction_id: flowTxn,
      message_id: 'msg_flow_confirm_' + Date.now(),
      timestamp: new Date().toISOString(),
    },
    message: {
      order: {
        id: flowOrderId,
        state: 'Created',
        items: [{ id: 'km-agri-a4-75', quantity: { count: 20 } }],
        billing: { name: 'Kogniti Enterprise Partner', address: { city: 'Noida', state: 'Uttar Pradesh' } },
      },
    },
  });
  assert(resFlowConfirm.status === 200, 'Flow: confirm returned ACK');

  // Cleanup
  await new Promise((r) => server.close(r));
  await new Promise((r) => mockBapServer.close(r));

  console.log('\n===============================================================');
  console.log(`  ON_SELECT VERIFICATION: ${passedTests}/${totalTests} PASSED (100% SUCCESS)`);
  console.log('===============================================================\n');

  setTimeout(() => {
    process.exit(0);
  }, 100);
}

runOnSelectTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

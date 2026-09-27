/**
 * ONDC RETeB2B 1.2.5 Seller / Beckn Provider Platform (BPP) API Contracts
 * Single Source of Truth for Kogniti Minds Private Limited Seller Node
 * Production Base: https://kognitiminds.com
 */

export interface SellerApiContract {
  id: string;
  action: string;
  routeSlug: string;
  adminUiRoute: string;
  name: string;
  type: 'callback' | 'inbound';
  method: 'POST';
  productionEndpoint: string;
  backendEndpoint?: string;
  callbackEndpoint: string;
  status: 'ACTIVE';
  category: string;
  badgeColor: string;
  sender: string;
  receiver: string;
  callbackDirection: string;
  description: string;
  businessLogicSummary: string;
  questions: {
    whoSends: string;
    whoReceives: string;
    callbackGenerated: string;
    endpointExposed: string;
    responseSchemaRequired: string;
    transactionStateStored: string[];
  };
  sampleRequest: Record<string, any>;
  sampleSyncResponse: Record<string, any>;
  sampleCallback?: Record<string, any>;
  workbenchFilename: string;
}

export interface OndcSellerDashboardStats {
  role: string;
  domain: string;
  version: string;
  environment: string;
  bppId: string;
  bppUri: string;
  gatewayStatus: string;
  signatureStatus: string;
  databaseStatus: string;
  callbackStatus: string;
  lastTransaction: string;
  failedTransactions: number;
  pendingTransactions: number;
  totalOrders?: number;
  totalRevenue?: number;
}

/* =========================================================================
   1. The 10 Official Seller / BPP Callback Endpoints (POST Only)
   ========================================================================= */
export const SELLER_CALLBACK_CONTRACTS: SellerApiContract[] = [
  {
    id: 'on_search',
    action: 'on_search',
    routeSlug: 'on-search',
    adminUiRoute: '/admin/ondc/on-search',
    name: 'ONDC on_search',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_search',
    callbackEndpoint: 'POST {context.bap_uri}/on_search',
    status: 'ACTIVE',
    category: 'Discovery Callback',
    badgeColor: '#2563EB',
    sender: 'ONDC Gateway / Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Catalog discovery callback broadcasting the authoritative 13-product sustainable paper catalogue with 4: HSN prefix, 18% GST tags, B2B wholesale pricing, MOQ 10 reams, and volume discount slabs.',
    businessLogicSummary: 'Connects to live Kogniti database. Dispatches signed Beckn on_search with verified seller catalog. Inbound requests validate context and return synchronous ACK.',
    questions: {
      whoSends: 'ONDC Gateway / Buyer App (BAP) sends search discovery intent or callback.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_search.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_search containing full 13-product catalogue.',
      endpointExposed: 'POST https://kognitiminds.com/on_search (and /search)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'DISCOVERY_COMPLETED state logged in State Machine',
        'Transaction ID & Message ID registered in Idempotency cache (24h TTL)',
        'Search query and intent attributes recorded',
        'Audit log updated with HTTP status and processing time'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        country: 'IND',
        city: 'std:080',
        action: 'on_search',
        core_version: '1.2.5',
        bap_id: 'buyer-app-preprod.ondc.org',
        bap_uri: 'https://buyer-app-preprod.ondc.org/protocol/v1',
        bpp_id: 'kogniti-minds-bpp',
        bpp_uri: 'https://kognitiminds.com',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_search_01',
        timestamp: '2026-09-27T04:00:00.000Z',
        ttl: 'PT30S'
      },
      message: {
        catalog: {
          'bpp/descriptor': {
            name: 'KOGNITI MINDS PRIVATE LIMITED',
            short_desc: 'Sustainable & Tree-Free Agro-Waste Paper Manufacturer',
            symbol: 'https://kognitiminds.com/logo-icon.png'
          },
          'bpp/providers': [
            {
              id: 'kogniti-minds-bpp',
              descriptor: { name: 'KOGNITI MINDS PRIVATE LIMITED' },
              locations: [{ id: 'L1', gps: '28.6019,77.4475', address: { city: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', area_code: '201306' } }],
              items: [
                {
                  id: 'km-agri-a4-75',
                  descriptor: { name: 'Kogniti AgroPrint 75 GSM A4 Sustainable Copier Paper', code: '4:48025610' },
                  price: { currency: 'INR', value: '198.00' },
                  category_id: 'Stationery'
                }
              ]
            }
          ]
        }
      }
    },
    sampleSyncResponse: {
      message: { ack: { status: 'ACK' } }
    },
    workbenchFilename: '01_on_search.json'
  },
  {
    id: 'on_select',
    action: 'on_select',
    routeSlug: 'on-select',
    adminUiRoute: '/admin/ondc/on-select',
    name: 'ONDC on_select',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_select',
    callbackEndpoint: 'POST {context.bap_uri}/on_select',
    status: 'ACTIVE',
    category: 'Quotation Callback',
    badgeColor: '#059669',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Quotation callback returning computed wholesale pricing, MOQ validation (10 reams), 8% volume discount slabs, and 18% GST breakdown (CGST 9% + SGST 9% vs IGST 18%).',
    businessLogicSummary: 'Validates actual inventory and calculates official tax quote with delivery SLA. Synchronous ACK returned immediately.',
    questions: {
      whoSends: 'Buyer App / BAP sends selected item IDs and quantities.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_select.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_select with complete quote breakup and delivery fulfillment.',
      endpointExposed: 'POST https://kognitiminds.com/on_select (and /select)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'QUOTATION_GENERATED state recorded in State Machine',
        'Item quantities checked against physical warehouse stock',
        'Tax subtotal, bulk discount, and CGST/SGST/IGST breakdown cached (15-min TTL)',
        'Fulfillment F1 marked as Serviceable'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        country: 'IND',
        city: 'std:080',
        action: 'on_select',
        core_version: '1.2.5',
        bap_id: 'buyer-app-preprod.ondc.org',
        bap_uri: 'https://buyer-app-preprod.ondc.org/protocol/v1',
        bpp_id: 'kogniti-minds-bpp',
        bpp_uri: 'https://kognitiminds.com',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_select_01',
        timestamp: '2026-09-27T04:01:00.000Z',
        ttl: 'PT30S'
      },
      message: {
        order: {
          provider: { id: 'kogniti-minds-bpp' },
          items: [{ id: 'km-agri-a4-75', fulfillment_id: 'F1', quantity: { count: 80 } }],
          quote: {
            price: { currency: 'INR', value: '17195.90' },
            breakup: [
              { '@ondc/org/item_id': 'km-agri-a4-75', '@ondc/org/title_type': 'item', title: 'Base Taxable', price: { currency: 'INR', value: '14572.80' } },
              { '@ondc/org/item_id': 'km-agri-a4-75', '@ondc/org/title_type': 'tax', title: 'CGST (9%)', price: { currency: 'INR', value: '1311.55' } },
              { '@ondc/org/item_id': 'km-agri-a4-75', '@ondc/org/title_type': 'tax', title: 'SGST (9%)', price: { currency: 'INR', value: '1311.55' } }
            ]
          }
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '02_on_select.json'
  },
  {
    id: 'on_init',
    action: 'on_init',
    routeSlug: 'on-init',
    adminUiRoute: '/admin/ondc/on-init',
    name: 'ONDC on_init',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_init',
    callbackEndpoint: 'POST {context.bap_uri}/on_init',
    status: 'ACTIVE',
    category: 'Initialization Callback',
    badgeColor: '#7C3AED',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Order initialization callback verifying enterprise buyer billing address, statutory GSTIN, provider dispatch warehouse (L1), and commercial settlement terms (ON-FULFILLMENT).',
    businessLogicSummary: 'Locks provider location L1, verifies billing GST state, and finalizes commercial B2B payment terms.',
    questions: {
      whoSends: 'Buyer App / BAP sends buyer billing address, GSTIN, and delivery fulfillment preferences.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_init.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_init with finalized billing and commercial terms.',
      endpointExposed: 'POST https://kognitiminds.com/on_init (and /init)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'INITIALIZED state recorded in State Machine',
        'Buyer corporate entity name, PAN, and GSTIN registered',
        'Delivery coordinates and recipient contacts saved',
        'Payment terms established: ON-FULFILLMENT (NOT-PAID)'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        country: 'IND',
        city: 'std:080',
        action: 'on_init',
        core_version: '1.2.5',
        bap_id: 'buyer-app-preprod.ondc.org',
        bap_uri: 'https://buyer-app-preprod.ondc.org/protocol/v1',
        bpp_id: 'kogniti-minds-bpp',
        bpp_uri: 'https://kognitiminds.com',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_init_01',
        timestamp: '2026-09-27T04:02:00.000Z',
        ttl: 'PT30S'
      },
      message: {
        order: {
          provider: { id: 'kogniti-minds-bpp' },
          provider_location: { id: 'L1' },
          billing: { name: 'Apex Educational Trust', tax_number: '09AAACA1234A1Z5' },
          payment: { type: 'ON-FULFILLMENT', status: 'NOT-PAID' }
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '03_on_init.json'
  },
  {
    id: 'on_confirm',
    action: 'on_confirm',
    routeSlug: 'on-confirm',
    adminUiRoute: '/admin/ondc/on-confirm',
    name: 'ONDC on_confirm',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_confirm',
    callbackEndpoint: 'POST {context.bap_uri}/on_confirm',
    status: 'ACTIVE',
    category: 'Confirmation Callback',
    badgeColor: '#10B981',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Order confirmation callback: executes atomic physical inventory deduction, creates internal Kogniti order (KM-ONDC-XXXXXX), and assigns commercial tax invoice details.',
    businessLogicSummary: 'Atomic inventory deduction in persistent database. Order state set to Created. Zero fake orders.',
    questions: {
      whoSends: 'Buyer App / BAP sends confirmed purchase order.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_confirm.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_confirm confirming order state Created with assigned order ID.',
      endpointExposed: 'POST https://kognitiminds.com/on_confirm (and /confirm)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'ORDER_CREATED state locked in State Machine',
        'Physical warehouse inventory atomically deducted',
        'Internal Kogniti Order created (e.g. KM-ONDC-881290)',
        'Linked ondc_transaction_id, ondc_message_id, and ondc_order_id',
        'Commercial Tax Invoice record prepared for dispatch'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        country: 'IND',
        city: 'std:080',
        action: 'on_confirm',
        core_version: '1.2.5',
        bap_id: 'buyer-app-preprod.ondc.org',
        bap_uri: 'https://buyer-app-preprod.ondc.org/protocol/v1',
        bpp_id: 'kogniti-minds-bpp',
        bpp_uri: 'https://kognitiminds.com',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_confirm_01',
        timestamp: '2026-09-27T04:03:00.000Z',
        ttl: 'PT30S'
      },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Created',
          provider: { id: 'kogniti-minds-bpp', locations: [{ id: 'L1' }] },
          quote: { price: { currency: 'INR', value: '17195.90' } }
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '04_on_confirm.json'
  },
  {
    id: 'on_status',
    action: 'on_status',
    routeSlug: 'on-status',
    adminUiRoute: '/admin/ondc/on-status',
    name: 'ONDC on_status',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_status',
    callbackEndpoint: 'POST {context.bap_uri}/on_status',
    status: 'ACTIVE',
    category: 'Status Callback',
    badgeColor: '#D97706',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Order status callback returning live fulfillment milestones: Accepted, Order-picked-up, or Order-delivered from Kogniti production database.',
    businessLogicSummary: 'Queries genuine internal order records. Returns active fulfillment status, tracking identifiers, and updated timestamps.',
    questions: {
      whoSends: 'Buyer App / BAP queries order status for order_id.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_status.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_status with current order state and fulfillment timeline.',
      endpointExposed: 'POST https://kognitiminds.com/on_status (and /status)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'STATUS_QUERIED state recorded in State Machine',
        'Order status lookup verified against internal database',
        'Audit log updated with client inquiry timestamp'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'on_status',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_status_01',
        timestamp: '2026-09-27T04:04:00.000Z'
      },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Accepted',
          fulfillments: [{ id: 'F1', state: { descriptor: { code: 'Order-picked-up' } }, tracking: true }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '05_on_status.json'
  },
  {
    id: 'on_track',
    action: 'on_track',
    routeSlug: 'on-track',
    adminUiRoute: '/admin/ondc/on-track',
    name: 'ONDC on_track',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_track',
    callbackEndpoint: 'POST {context.bap_uri}/on_track',
    status: 'ACTIVE',
    category: 'Logistics Callback',
    badgeColor: '#0284C7',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Shipment tracking callback providing live consignment tracking URL: https://kognitiminds.com/track/{order_id} with status active.',
    businessLogicSummary: 'Generates real tracking URL and delivery TAT for dispatched paper consignments.',
    questions: {
      whoSends: 'Buyer App / BAP queries tracking URL for order_id.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_track.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_track with tracking url and status: active.',
      endpointExposed: 'POST https://kognitiminds.com/on_track (and /track)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'TRACKING_DISPATCHED state recorded in State Machine',
        'Public tracking URL generated and logged in order audit'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'on_track',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_track_01'
      },
      message: {
        tracking: {
          url: 'https://kognitiminds.com/track/ord_b2b_wb_881290',
          status: 'active'
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '09_on_track.json'
  },
  {
    id: 'on_cancel',
    action: 'on_cancel',
    routeSlug: 'on-cancel',
    adminUiRoute: '/admin/ondc/on-cancel',
    name: 'ONDC on_cancel',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_cancel',
    callbackEndpoint: 'POST {context.bap_uri}/on_cancel',
    status: 'ACTIVE',
    category: 'Cancellation Callback',
    badgeColor: '#EF4444',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Order cancellation callback confirming cancellation reason code and releasing reserved stock back into active warehouse inventory.',
    businessLogicSummary: 'Atomic inventory restoration. Restores product inventory counts and updates order status to cancelled.',
    questions: {
      whoSends: 'Buyer App / BAP sends cancellation request with cancellation_reason_id (e.g. 001).',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_cancel.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_cancel with order state Cancelled and reason tags.',
      endpointExposed: 'POST https://kognitiminds.com/on_cancel (and /cancel)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'ORDER_CANCELLED state locked in State Machine',
        'All deducted product quantities restored into active warehouse inventory',
        'Cancellation reason ID recorded in audit trail'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'on_cancel',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_cancel_01'
      },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Cancelled',
          tags: { cancellation_reason_id: '001' }
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '08_on_cancel.json'
  },
  {
    id: 'on_update',
    action: 'on_update',
    routeSlug: 'on-update',
    adminUiRoute: '/admin/ondc/on-update',
    name: 'ONDC on_update',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_update',
    callbackEndpoint: 'POST {context.bap_uri}/on_update',
    status: 'ACTIVE',
    category: 'Return Callback',
    badgeColor: '#EA580C',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Active RETeB2B 1.2.5 Workbench Flow: Buyer_Initiated_Return (Full & Partial). Restocks returned items, computes proportional refund, and triggers statutory GST Credit Note.',
    businessLogicSummary: 'Automated reverse logistics. Sets reverse fulfillment to Return_Approved, adjusts quote breakup, and creates credit note ledger entry.',
    questions: {
      whoSends: 'Buyer App / BAP sends update request with update_target: fulfillment and returned items list.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_update.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_update with reverse fulfillment Return_Approved and revised quote.',
      endpointExposed: 'POST https://kognitiminds.com/on_update (and /update)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'RETURN_APPROVED state recorded in State Machine',
        'Returned SKU units restocked into warehouse inventory',
        'Proportional refund amount calculated and credited',
        'Statutory GST Credit Note issued per Section 34 CGST Act'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'on_update',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_update_01'
      },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'In-progress',
          fulfillments: [{ id: 'F1-Return', type: 'Reverse-Delivery', state: { descriptor: { code: 'Return_Approved' } } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '06_on_update_partial_return.json'
  },
  {
    id: 'on_rating',
    action: 'on_rating',
    routeSlug: 'on-rating',
    adminUiRoute: '/admin/ondc/on-rating',
    name: 'ONDC on_rating',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_rating',
    callbackEndpoint: 'POST {context.bap_uri}/on_rating',
    status: 'ACTIVE',
    category: 'Feedback Callback',
    badgeColor: '#CA8A04',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Rating callback acknowledging buyer review rating and feedback category.',
    businessLogicSummary: 'Records review metrics linked to specific order in persistent database.',
    questions: {
      whoSends: 'Buyer App / BAP sends rating score and category.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_rating.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_rating acknowledgment.',
      endpointExposed: 'POST https://kognitiminds.com/on_rating (and /rating)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'RATING_RECORDED state recorded in State Machine',
        'Customer satisfaction score saved against order ID in database'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'on_rating',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_rating_01'
      },
      message: { feedback_form: null }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '01_on_search.json'
  },
  {
    id: 'on_support',
    action: 'on_support',
    routeSlug: 'on-support',
    adminUiRoute: '/admin/ondc/on-support',
    name: 'ONDC on_support',
    type: 'callback',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/on_support',
    callbackEndpoint: 'POST {context.bap_uri}/on_support',
    status: 'ACTIVE',
    category: 'Support Callback',
    badgeColor: '#4F46E5',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Support callback providing official Kogniti Minds corporate customer care, grievance officer, and enterprise escalation channels.',
    businessLogicSummary: 'Canonical contacts: Phone: +91 99991 44474, Email: support@kognitiminds.com, Portal: https://kognitiminds.com/contact.',
    questions: {
      whoSends: 'Buyer App / BAP requests customer care contacts for an order or inquiry.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/on_support.',
      callbackGenerated: 'Outbound signed POST {context.bap_uri}/on_support with phone, email, and support web URI.',
      endpointExposed: 'POST https://kognitiminds.com/on_support (and /support)',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'SUPPORT_DISPATCHED state recorded in State Machine',
        'Support inquiry timestamp and reference logged'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'on_support',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'cb_support_01'
      },
      message: {
        phone: '+91 99991 44474',
        email: 'support@kognitiminds.com',
        uri: 'https://kognitiminds.com/contact'
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '10_on_support.json'
  }
];

/* =========================================================================
   2. The 10 Inbound Action Endpoints (POST Only)
   ========================================================================= */
export const SELLER_INBOUND_CONTRACTS: SellerApiContract[] = [
  {
    id: 'search',
    action: 'search',
    routeSlug: 'search',
    adminUiRoute: '/admin/ondc/search',
    name: 'ONDC search',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/search',
    callbackEndpoint: 'POST {context.bap_uri}/on_search',
    status: 'ACTIVE',
    category: 'Discovery & Catalog',
    badgeColor: '#2563EB',
    sender: 'Buyer App (BAP) or ONDC Gateway',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound catalog discovery request. Processes intent filters and triggers asynchronous signed /on_search callback with full 13-product catalogue.',
    businessLogicSummary: 'Loads active products from database. Validates against ONDC RET taxonomy and dispatches signed Beckn callback.',
    questions: {
      whoSends: 'Buyer App / BAP or ONDC Gateway broadcasts intent.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/search.',
      callbackGenerated: 'POST {context.bap_uri}/on_search',
      endpointExposed: 'POST https://kognitiminds.com/search',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'DISCOVERY_COMPLETED state logged in State Machine',
        'Transaction ID & Message ID registered in Idempotency cache'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'search',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'msg_search_01',
        timestamp: '2026-09-27T04:00:00.000Z'
      },
      message: { intent: { item: { descriptor: { name: 'copier paper' } } } }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '01_on_search.json'
  },
  {
    id: 'select',
    action: 'select',
    routeSlug: 'select',
    adminUiRoute: '/admin/ondc/select',
    name: 'ONDC select',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/select',
    callbackEndpoint: 'POST {context.bap_uri}/on_select',
    status: 'ACTIVE',
    category: 'Quotation & Pricing',
    badgeColor: '#059669',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound item selection request. Validates stock, applies MOQ 10 rules, computes volume discount slabs, and dispatches signed /on_select callback.',
    businessLogicSummary: 'Computes real wholesale pricing and 18% GST (CGST+SGST / IGST).',
    questions: {
      whoSends: 'Buyer App / BAP sends selected item IDs and quantities.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/select.',
      callbackGenerated: 'POST {context.bap_uri}/on_select',
      endpointExposed: 'POST https://kognitiminds.com/select',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: [
        'QUOTATION_GENERATED state recorded in State Machine',
        'Tax subtotal and volume discount computed'
      ]
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'select',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'msg_select_01'
      },
      message: {
        order: {
          items: [{ id: 'km-agri-a4-75', quantity: { count: 80 } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '02_on_select.json'
  },
  {
    id: 'init',
    action: 'init',
    routeSlug: 'init',
    adminUiRoute: '/admin/ondc/init',
    name: 'ONDC init',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/init',
    callbackEndpoint: 'POST {context.bap_uri}/on_init',
    status: 'ACTIVE',
    category: 'Initialization',
    badgeColor: '#7C3AED',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound order initialization request. Verifies buyer billing, coordinates delivery logistics, and dispatches signed /on_init callback.',
    businessLogicSummary: 'Stores billing details and establishes settlement terms.',
    questions: {
      whoSends: 'Buyer App / BAP sends billing and delivery details.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/init.',
      callbackGenerated: 'POST {context.bap_uri}/on_init',
      endpointExposed: 'POST https://kognitiminds.com/init',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['INITIALIZED state recorded in State Machine']
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'init',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'msg_init_01'
      },
      message: {
        order: {
          billing: { name: 'Apex Educational Trust', tax_number: '09AAACA1234A1Z5' },
          items: [{ id: 'km-agri-a4-75', quantity: { count: 80 } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '03_on_init.json'
  },
  {
    id: 'confirm',
    action: 'confirm',
    routeSlug: 'confirm',
    adminUiRoute: '/admin/ondc/confirm',
    name: 'ONDC confirm',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/confirm',
    callbackEndpoint: 'POST {context.bap_uri}/on_confirm',
    status: 'ACTIVE',
    category: 'Order Confirmation',
    badgeColor: '#10B981',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound order confirmation request. Atomically reserves warehouse stock, creates internal order, and dispatches signed /on_confirm callback.',
    businessLogicSummary: 'Creates genuine order KM-ONDC-XXXXXX with atomic inventory deduction.',
    questions: {
      whoSends: 'Buyer App / BAP sends confirmed purchase order.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/confirm.',
      callbackGenerated: 'POST {context.bap_uri}/on_confirm',
      endpointExposed: 'POST https://kognitiminds.com/confirm',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['ORDER_CREATED state locked; warehouse inventory deducted']
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        action: 'confirm',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'msg_confirm_01'
      },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          items: [{ id: 'km-agri-a4-75', quantity: { count: 80 } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '04_on_confirm.json'
  },
  {
    id: 'status',
    action: 'status',
    routeSlug: 'status',
    adminUiRoute: '/admin/ondc/status',
    name: 'ONDC status',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/status',
    callbackEndpoint: 'POST {context.bap_uri}/on_status',
    status: 'ACTIVE',
    category: 'Fulfillment & Status',
    badgeColor: '#D97706',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound order status inquiry. Queries genuine order record and dispatches signed /on_status callback.',
    businessLogicSummary: 'Queries order status from database and returns active milestones.',
    questions: {
      whoSends: 'Buyer App / BAP queries order status.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/status.',
      callbackGenerated: 'POST {context.bap_uri}/on_status',
      endpointExposed: 'POST https://kognitiminds.com/status',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['STATUS_QUERIED state recorded in State Machine']
    },
    sampleRequest: {
      context: { action: 'status', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { order_id: 'ord_b2b_wb_881290' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '05_on_status.json'
  },
  {
    id: 'track',
    action: 'track',
    routeSlug: 'track',
    adminUiRoute: '/admin/ondc/track',
    name: 'ONDC track',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/track',
    callbackEndpoint: 'POST {context.bap_uri}/on_track',
    status: 'ACTIVE',
    category: 'Logistics',
    badgeColor: '#0284C7',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound tracking inquiry. Generates public tracking URL and dispatches signed /on_track callback.',
    businessLogicSummary: 'Generates active tracking URL for the specified order.',
    questions: {
      whoSends: 'Buyer App / BAP queries tracking URL.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/track.',
      callbackGenerated: 'POST {context.bap_uri}/on_track',
      endpointExposed: 'POST https://kognitiminds.com/track',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['TRACKING_DISPATCHED state recorded in State Machine']
    },
    sampleRequest: {
      context: { action: 'track', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { order_id: 'ord_b2b_wb_881290' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '09_on_track.json'
  },
  {
    id: 'cancel',
    action: 'cancel',
    routeSlug: 'cancel',
    adminUiRoute: '/admin/ondc/cancel',
    name: 'ONDC cancel',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/cancel',
    callbackEndpoint: 'POST {context.bap_uri}/on_cancel',
    status: 'ACTIVE',
    category: 'Exceptions',
    badgeColor: '#EF4444',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound cancellation request. Restores reserved quantities to inventory and dispatches signed /on_cancel callback.',
    businessLogicSummary: 'Atomic inventory restoration to database.',
    questions: {
      whoSends: 'Buyer App / BAP sends cancellation request with reason ID.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/cancel.',
      callbackGenerated: 'POST {context.bap_uri}/on_cancel',
      endpointExposed: 'POST https://kognitiminds.com/cancel',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['ORDER_CANCELLED state locked; inventory restored']
    },
    sampleRequest: {
      context: { action: 'cancel', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { order_id: 'ord_b2b_wb_881290', cancellation_reason_id: '001' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '08_on_cancel.json'
  },
  {
    id: 'update',
    action: 'update',
    routeSlug: 'update',
    adminUiRoute: '/admin/ondc/update',
    name: 'ONDC update',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/update',
    callbackEndpoint: 'POST {context.bap_uri}/on_update',
    status: 'ACTIVE',
    category: 'Reverse Flow',
    badgeColor: '#EA580C',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound update request (Buyer-Initiated Return: Partial/Full). Restocks returned items, computes refund, and dispatches signed /on_update callback.',
    businessLogicSummary: 'Executes reverse logistics with GST credit note issuance.',
    questions: {
      whoSends: 'Buyer App / BAP sends return request with returned items.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/update.',
      callbackGenerated: 'POST {context.bap_uri}/on_update',
      endpointExposed: 'POST https://kognitiminds.com/update',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['RETURN_APPROVED state recorded; credit note issued']
    },
    sampleRequest: {
      context: { action: 'update', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: {
        update_target: 'fulfillment',
        order: {
          id: 'ord_b2b_wb_881290',
          items: [{ id: 'km-agri-a4-75', quantity: { count: 20 }, tags: { update_type: 'return', reason_code: '002' } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '06_on_update_partial_return.json'
  },
  {
    id: 'rating',
    action: 'rating',
    routeSlug: 'rating',
    adminUiRoute: '/admin/ondc/rating',
    name: 'ONDC rating',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/rating',
    callbackEndpoint: 'POST {context.bap_uri}/on_rating',
    status: 'ACTIVE',
    category: 'Feedback',
    badgeColor: '#CA8A04',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound rating submission. Saves rating metrics and dispatches signed /on_rating callback.',
    businessLogicSummary: 'Stores vendor review score in database.',
    questions: {
      whoSends: 'Buyer App / BAP sends rating score.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/rating.',
      callbackGenerated: 'POST {context.bap_uri}/on_rating',
      endpointExposed: 'POST https://kognitiminds.com/rating',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['RATING_RECORDED state recorded in State Machine']
    },
    sampleRequest: {
      context: { action: 'rating', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { rating_category: 'Order', id: 'ord_b2b_wb_881290', value: 5 }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '01_on_search.json'
  },
  {
    id: 'support',
    action: 'support',
    routeSlug: 'support',
    adminUiRoute: '/admin/ondc/support',
    name: 'ONDC support',
    type: 'inbound',
    method: 'POST',
    productionEndpoint: 'https://kognitiminds.com/support',
    callbackEndpoint: 'POST {context.bap_uri}/on_support',
    status: 'ACTIVE',
    category: 'Support',
    badgeColor: '#4F46E5',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Buyer (BAP) ➔ Seller (BPP)',
    description: 'Inbound support request. Dispatches signed /on_support callback with official corporate contact channels.',
    businessLogicSummary: 'Returns canonical phone, email, and support web URI.',
    questions: {
      whoSends: 'Buyer App / BAP queries support contacts.',
      whoReceives: 'KOGNITI MINDS PRIVATE LIMITED Seller-side participant / BPP at https://kognitiminds.com/support.',
      callbackGenerated: 'POST {context.bap_uri}/on_support',
      endpointExposed: 'POST https://kognitiminds.com/support',
      responseSchemaRequired: 'Synchronous Beckn ACK ({ "message": { "ack": { "status": "ACK" } } }). GET returns 405 Method Not Allowed NACK.',
      transactionStateStored: ['SUPPORT_DISPATCHED state recorded in State Machine']
    },
    sampleRequest: {
      context: { action: 'support', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { ref_id: 'ord_b2b_wb_881290' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    workbenchFilename: '10_on_support.json'
  }
];

export const ALL_ONDC_CONTRACTS: SellerApiContract[] = [
  ...SELLER_CALLBACK_CONTRACTS,
  ...SELLER_INBOUND_CONTRACTS
];

// Compatibility alias
export const SELLER_API_CONTRACTS = ALL_ONDC_CONTRACTS;

/**
 * Helper to resolve contract by either action ('on_search') or route slug ('on-search')
 */
export function findContractBySlug(rawSlug: string): SellerApiContract | null {
  if (!rawSlug) return null;
  const normalized = rawSlug.trim().toLowerCase();
  const slugWithHyphen = normalized.replace(/_/g, '-');
  const slugWithUnderscore = normalized.replace(/-/g, '_');

  return (
    ALL_ONDC_CONTRACTS.find(
      (c) =>
        c.action === normalized ||
        c.action === slugWithUnderscore ||
        c.routeSlug === normalized ||
        c.routeSlug === slugWithHyphen ||
        c.id === normalized
    ) || null
  );
}

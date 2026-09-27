/**
 * ONDC RETeB2B 1.2.5 Seller / Beckn Provider Platform (BPP) API Contracts
 * Single Source of Truth for Kogniti Minds Private Limited Seller Node
 * Production Base: https://kognitiminds.com
 */

export interface SellerApiContract {
  action: string;
  name: string;
  category: string;
  badgeColor: string;
  routePath: string;
  backendEndpoint: string;
  callbackEndpoint: string;
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
  sampleCallback: Record<string, any>;
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

export const SELLER_API_CONTRACTS: SellerApiContract[] = [
  {
    action: 'search',
    name: 'Search API (Catalog Discovery)',
    category: 'Discovery & Catalog',
    badgeColor: '#2563EB',
    routePath: '/admin/ondc/search',
    backendEndpoint: 'POST https://kognitiminds.com/search',
    callbackEndpoint: 'POST {context.bap_uri}/on_search',
    sender: 'Buyer App (BAP) or ONDC Gateway',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Broadcasts authoritative 13-product sustainable paper catalogue with statutory HSN (4: prefix), 18% GST tags, B2B wholesale pricing, MOQ 10, and volume discount slabs.',
    businessLogicSummary: 'Connects directly to persistent database. Returns Kogniti AgroPrint, Copier, Executive & Note papers with real stock and B2B pricing slabs.',
    questions: {
      whoSends: 'Buyer App / BAP or ONDC Gateway broadcasts intent or category lookup.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/search.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_search signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/search (and /ondc/search)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by asynchronous on_search payload containing bpp/providers with full 13-item RET catalogue.',
      transactionStateStored: [
        'DISCOVERY_COMPLETED state logged in State Machine',
        'Transaction ID & Message ID registered in Idempotency cache (24-hour TTL)',
        'Incoming intent & search query recorded for B2B analytics',
        'Outgoing on_search message_id linked to transaction'
      ],
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        country: 'IND',
        city: 'std:080',
        action: 'search',
        core_version: '1.2.5',
        bap_id: 'buyer-app-preprod.ondc.org',
        bap_uri: 'https://buyer-app-preprod.ondc.org/protocol/v1',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: '0b0e557b-7b56-4c4f-9e7c-86cf330de223',
        timestamp: '2026-09-27T04:00:00.000Z',
        ttl: 'PT30S',
      },
      message: {
        intent: {
          item: {
            descriptor: {
              name: 'paper',
            },
          },
          fulfillment: {
            type: 'Delivery',
          },
        },
      },
    },
    sampleSyncResponse: {
      message: {
        ack: {
          status: 'ACK',
        },
      },
    },
    sampleCallback: {
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
        timestamp: '2026-09-27T04:00:01.000Z',
        ttl: 'PT30S',
      },
      message: {
        catalog: {
          'bpp/descriptor': {
            name: 'KOGNITI MINDS PRIVATE LIMITED',
            short_desc: 'Sustainable & Tree-Free Agro-Waste Paper Manufacturer',
            symbol: 'https://kognitiminds.com/logo-icon.png',
          },
          'bpp/providers': [
            {
              id: 'kogniti-minds-bpp',
              descriptor: {
                name: 'KOGNITI MINDS PRIVATE LIMITED',
                long_desc: 'Institutional manufacturer of tree-free copier paper crafted from agricultural stubble.',
              },
              locations: [{ id: 'L1', gps: '28.6019,77.4475', address: { street: 'Panchsheel Greens-2, Sec-16 B', city: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', area_code: '201306' } }],
              items: [
                {
                  id: 'km-agri-a4-75',
                  descriptor: {
                    name: 'Kogniti AgroPrint 75 GSM A4 Sustainable Copier Paper (500 Sheets)',
                    code: '4:48025610',
                    short_desc: '75 GSM A4 copy paper made from upcycled agro-residues.',
                  },
                  price: { currency: 'INR', value: '198.00' },
                  category_id: 'Stationery',
                  fulfillment_id: 'F1',
                  location_id: 'L1',
                  tags: [
                    { code: 'origin', list: [{ code: 'country', value: 'IND' }] },
                    { code: 'attribute', list: [{ code: 'tax_rate', value: '18' }, { code: 'brand', value: 'KOGNITI' }] }
                  ]
                }
              ]
            }
          ]
        }
      }
    },
    workbenchFilename: '01_on_search.json',
  },
  {
    action: 'select',
    name: 'Select API (Quote & MOQ Validation)',
    category: 'Quotation & Pricing',
    badgeColor: '#059669',
    routePath: '/admin/ondc/select',
    backendEndpoint: 'POST https://kognitiminds.com/select',
    callbackEndpoint: 'POST {context.bap_uri}/on_select',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Validates requested SKU, checks real inventory, applies MOQ rules (min 10 reams), applies 8% bulk volume discount slabs (>=50 reams), and calculates statutory 18% GST.',
    businessLogicSummary: 'Computes intra-state (CGST 9% + SGST 9% for UP 09) vs interstate (IGST 18%). Verifies fulfillment serviceability to delivery area code.',
    questions: {
      whoSends: 'Buyer App / BAP sends requested item IDs, requested quantities, and delivery location coordinates.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/select.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_select signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/select (and /ondc/select)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_select quote breakup with item price, discount, tax breakdown, and delivery SLA.',
      transactionStateStored: [
        'QUOTATION_GENERATED state recorded in State Machine',
        'Validated item IDs and reserved quantity requirements',
        'Computed taxable subtotal, wholesale volume tier discounts, and statutory GST',
        'Fulfillment serviceability status marked as Serviceable'
      ],
    },
    sampleRequest: {
      context: {
        domain: 'ONDC:RETeB2B',
        country: 'IND',
        city: 'std:080',
        action: 'select',
        core_version: '1.2.5',
        bap_id: 'buyer-app-preprod.ondc.org',
        bap_uri: 'https://buyer-app-preprod.ondc.org/protocol/v1',
        transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377',
        message_id: 'select_msg_001',
        timestamp: '2026-09-27T04:01:00.000Z',
        ttl: 'PT30S',
      },
      message: {
        order: {
          provider: { id: 'kogniti-minds-bpp' },
          items: [{ id: 'km-agri-a4-75', quantity: { count: 80 } }],
          fulfillments: [{ end: { location: { address: { area_code: '201306', state: 'Uttar Pradesh' } } } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_select', bpp_id: 'kogniti-minds-bpp' },
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
    workbenchFilename: '02_on_select.json',
  },
  {
    action: 'init',
    name: 'Init API (Order Initialization)',
    category: 'Initialization',
    badgeColor: '#7C3AED',
    routePath: '/admin/ondc/init',
    backendEndpoint: 'POST https://kognitiminds.com/init',
    callbackEndpoint: 'POST {context.bap_uri}/on_init',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Accepts enterprise buyer billing address, statutory GSTIN, commercial delivery terms, dispatch warehouse location (L1), and payment settlement type.',
    businessLogicSummary: 'Locks provider location L1, verifies billing GST state, and finalizes commercial B2B payment terms (ON-FULFILLMENT).',
    questions: {
      whoSends: 'Buyer App / BAP sends buyer billing address, GSTIN, and delivery fulfillment preferences.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/init.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_init signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/init (and /ondc/init)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_init response finalizing billing, payment terms, and delivery parameters.',
      transactionStateStored: [
        'INITIALIZED state recorded in State Machine',
        'Buyer corporate entity name, PAN, and GSTIN registered',
        'Delivery coordinates, gate entry details, and recipient contacts saved',
        'Payment terms established: ON-FULFILLMENT (NOT-PAID)'
      ],
    },
    sampleRequest: {
      context: { action: 'init', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: {
        order: {
          provider: { id: 'kogniti-minds-bpp' },
          billing: { name: 'Apex Educational Trust', tax_number: '09AAACA1234A1Z5', address: { city: 'Greater Noida', state: 'Uttar Pradesh' } },
          items: [{ id: 'km-agri-a4-75', quantity: { count: 80 } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_init', bpp_id: 'kogniti-minds-bpp' },
      message: {
        order: {
          provider: { id: 'kogniti-minds-bpp' },
          provider_location: { id: 'L1' },
          payment: { type: 'ON-FULFILLMENT', status: 'NOT-PAID' }
        }
      }
    },
    workbenchFilename: '03_on_init.json',
  },
  {
    action: 'confirm',
    name: 'Confirm API (Atomic Order Placement)',
    category: 'Order Confirmation',
    badgeColor: '#10B981',
    routePath: '/admin/ondc/confirm',
    backendEndpoint: 'POST https://kognitiminds.com/confirm',
    callbackEndpoint: 'POST {context.bap_uri}/on_confirm',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Executes atomic inventory deduction, creates internal Kogniti order (KM-ONDC-XXXXXX), links ONDC transaction references, and generates official tax invoice details.',
    businessLogicSummary: 'Zero fake orders. Deducts physical warehouse stock atomically in persistentStore. Sets order state to Created.',
    questions: {
      whoSends: 'Buyer App / BAP sends confirmed order placement payload with buyer authorization.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/confirm.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_confirm signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/confirm (and /ondc/confirm)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_confirm callback confirming state Created with complete order quote and assigned order ID.',
      transactionStateStored: [
        'ORDER_CREATED state locked in State Machine',
        'Physical warehouse inventory atomically deducted',
        'Internal Kogniti Order created (e.g. KM-ONDC-881290)',
        'Linked ondc_transaction_id, ondc_message_id, and ondc_order_id',
        'Commercial Tax Invoice record prepared for dispatch'
      ],
    },
    sampleRequest: {
      context: { action: 'confirm', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Created',
          items: [{ id: 'km-agri-a4-75', quantity: { count: 80 } }]
        }
      }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_confirm', bpp_id: 'kogniti-minds-bpp' },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Created',
          provider: { id: 'kogniti-minds-bpp', locations: [{ id: 'L1' }] },
          quote: { price: { currency: 'INR', value: '17195.90' } }
        }
      }
    },
    workbenchFilename: '04_on_confirm.json',
  },
  {
    action: 'status',
    name: 'Status API (Order State Query)',
    category: 'Fulfillment & Status',
    badgeColor: '#D97706',
    routePath: '/admin/ondc/status',
    backendEndpoint: 'POST https://kognitiminds.com/status',
    callbackEndpoint: 'POST {context.bap_uri}/on_status',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Queries live order state from Kogniti Minds production database. Returns fulfillment milestones: Accepted, Order-picked-up, or Order-delivered.',
    businessLogicSummary: 'Queries genuine internal order records. Returns active fulfillment status, tracking identifiers, and updated timestamps.',
    questions: {
      whoSends: 'Buyer App / BAP sends order_id status inquiry.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/status.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_status signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/status (and /ondc/status)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_status callback with current order state and fulfillment timeline.',
      transactionStateStored: [
        'STATUS_QUERIED state recorded in State Machine',
        'Order status lookup verified against internal database',
        'Audit log updated with client inquiry timestamp'
      ],
    },
    sampleRequest: {
      context: { action: 'status', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { order_id: 'ord_b2b_wb_881290' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_status', bpp_id: 'kogniti-minds-bpp' },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Accepted',
          fulfillments: [{ id: 'F1', state: { descriptor: { code: 'Order-picked-up' } }, tracking: true }]
        }
      }
    },
    workbenchFilename: '05_on_status.json',
  },
  {
    action: 'track',
    name: 'Track API (Shipment Tracking)',
    category: 'Logistics',
    badgeColor: '#0284C7',
    routePath: '/admin/ondc/track',
    backendEndpoint: 'POST https://kognitiminds.com/track',
    callbackEndpoint: 'POST {context.bap_uri}/on_track',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Generates live courier tracking link and dispatch TAT for active consignments.',
    businessLogicSummary: 'Provides tracking URL: https://kognitiminds.com/track/{order_id} with real-time transit status.',
    questions: {
      whoSends: 'Buyer App / BAP queries tracking URL for order_id.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/track.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_track signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/track (and /ondc/track)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_track with tracking url and status: active.',
      transactionStateStored: [
        'TRACKING_DISPATCHED state recorded in State Machine',
        'Public tracking URL generated and logged in order audit'
      ],
    },
    sampleRequest: {
      context: { action: 'track', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { order_id: 'ord_b2b_wb_881290' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_track', bpp_id: 'kogniti-minds-bpp' },
      message: {
        tracking: {
          url: 'https://kognitiminds.com/track/ord_b2b_wb_881290',
          status: 'active'
        }
      }
    },
    workbenchFilename: '09_on_track.json',
  },
  {
    action: 'cancel',
    name: 'Cancel API (Order Cancellation)',
    category: 'Exceptions',
    badgeColor: '#EF4444',
    routePath: '/admin/ondc/cancel',
    backendEndpoint: 'POST https://kognitiminds.com/cancel',
    callbackEndpoint: 'POST {context.bap_uri}/on_cancel',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Cancels active order, releases reserved stock back into warehouse inventory, and persists cancellation reason code.',
    businessLogicSummary: 'Atomic inventory restoration. Restores product inventory counts and updates order status to cancelled.',
    questions: {
      whoSends: 'Buyer App / BAP sends cancellation request with cancellation_reason_id (e.g. 001).',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/cancel.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_cancel signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/cancel (and /ondc/cancel)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_cancel callback with order state Cancelled and reason tags.',
      transactionStateStored: [
        'ORDER_CANCELLED state locked in State Machine',
        'All deducted product quantities restored into active warehouse inventory',
        'Cancellation reason ID recorded in audit trail'
      ],
    },
    sampleRequest: {
      context: { action: 'cancel', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { order_id: 'ord_b2b_wb_881290', cancellation_reason_id: '001' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_cancel', bpp_id: 'kogniti-minds-bpp' },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'Cancelled',
          tags: { cancellation_reason_id: '001' }
        }
      }
    },
    workbenchFilename: '08_on_cancel.json',
  },
  {
    action: 'update',
    name: 'Update API (Buyer-Initiated Return Flow)',
    category: 'Reverse Flow',
    badgeColor: '#EA580C',
    routePath: '/admin/ondc/update',
    backendEndpoint: 'POST https://kognitiminds.com/update',
    callbackEndpoint: 'POST {context.bap_uri}/on_update',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Active RETeB2B 1.2.5 Workbench Flow: Buyer_Initiated_Return (Full & Partial). Restocks returned items, computes proportional refund, and triggers statutory GST Credit Note.',
    businessLogicSummary: 'Automated reverse logistics. Sets reverse fulfillment to Return_Approved, adjusts quote breakup, and creates credit note ledger entry.',
    questions: {
      whoSends: 'Buyer App / BAP sends update request with update_target: fulfillment and returned items list.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/update.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_update signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/update (and /ondc/update)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_update callback with reverse fulfillment Return_Approved and revised quote.',
      transactionStateStored: [
        'RETURN_APPROVED state recorded in State Machine',
        'Returned SKU units restocked into warehouse inventory',
        'Proportional refund amount calculated and credited',
        'Statutory GST Credit Note issued per Section 34 CGST Act'
      ],
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
    sampleCallback: {
      context: { action: 'on_update', bpp_id: 'kogniti-minds-bpp' },
      message: {
        order: {
          id: 'ord_b2b_wb_881290',
          state: 'In-progress',
          fulfillments: [{ id: 'F1-Return', type: 'Reverse-Delivery', state: { descriptor: { code: 'Return_Approved' } } }]
        }
      }
    },
    workbenchFilename: '06_on_update_partial_return.json',
  },
  {
    action: 'rating',
    name: 'Rating API (Feedback & Reviews)',
    category: 'Feedback',
    badgeColor: '#CA8A04',
    routePath: '/admin/ondc/rating',
    backendEndpoint: 'POST https://kognitiminds.com/rating',
    callbackEndpoint: 'POST {context.bap_uri}/on_rating',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Captures buyer satisfaction rating (1-5) and fulfillment quality feedback.',
    businessLogicSummary: 'Records review metrics linked to specific order in persistent database.',
    questions: {
      whoSends: 'Buyer App / BAP sends rating score and category.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/rating.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_rating signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/rating (and /ondc/rating)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_rating acknowledgment.',
      transactionStateStored: [
        'RATING_RECORDED state recorded in State Machine',
        'Customer satisfaction score saved against order ID in database'
      ],
    },
    sampleRequest: {
      context: { action: 'rating', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { rating_category: 'Order', id: 'ord_b2b_wb_881290', value: 5 }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_rating', bpp_id: 'kogniti-minds-bpp' },
      message: { feedback_form: null }
    },
    workbenchFilename: '01_on_search.json',
  },
  {
    action: 'support',
    name: 'Support API (Enterprise Escalation)',
    category: 'Support',
    badgeColor: '#4F46E5',
    routePath: '/admin/ondc/support',
    backendEndpoint: 'POST https://kognitiminds.com/support',
    callbackEndpoint: 'POST {context.bap_uri}/on_support',
    sender: 'Buyer App (BAP)',
    receiver: 'KOGNITI MINDS PRIVATE LIMITED (Seller / BPP)',
    callbackDirection: 'Seller (Kogniti Minds BPP) ➔ Buyer (BAP)',
    description: 'Returns official Kogniti Minds corporate customer care, grievance officer, and enterprise escalation channels.',
    businessLogicSummary: 'Canonical contacts: Phone: +91 99991 44474, Email: support@kognitiminds.com, Portal: https://kognitiminds.com/contact.',
    questions: {
      whoSends: 'Buyer App / BAP requests customer care contacts for an order or inquiry.',
      whoReceives: 'KOGNITI MINDS Private Limited Seller-side participant / BPP receives at https://kognitiminds.com/support.',
      callbackGenerated: 'Asynchronous POST {context.bap_uri}/on_support signed with Ed25519 authorization header.',
      endpointExposed: 'POST https://kognitiminds.com/support (and /ondc/support)',
      responseSchemaRequired: 'Synchronous Beckn ACK (HTTP 200) followed by on_support with phone, email, and support web URI.',
      transactionStateStored: [
        'SUPPORT_DISPATCHED state recorded in State Machine',
        'Support inquiry timestamp and reference logged'
      ],
    },
    sampleRequest: {
      context: { action: 'support', transaction_id: '54e3d489-0be3-455b-9d41-3da39d520377' },
      message: { ref_id: 'ord_b2b_wb_881290' }
    },
    sampleSyncResponse: { message: { ack: { status: 'ACK' } } },
    sampleCallback: {
      context: { action: 'on_support', bpp_id: 'kogniti-minds-bpp' },
      message: {
        phone: '+91 99991 44474',
        email: 'support@kognitiminds.com',
        uri: 'https://kognitiminds.com/contact'
      }
    },
    workbenchFilename: '10_on_support.json',
  },
];

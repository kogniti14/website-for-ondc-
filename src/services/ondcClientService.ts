/**
 * ONDC Client Service
 * Frontend API client connecting actual customer actions on KOGNITI MINDS website
 * to ONDC RETeB2B 1.2.5 backend protocol endpoints (/search, /select, /init, /confirm, etc.)
 * Kogniti Minds Private Limited
 */

import { Product, B2COrder, B2BOrder } from '../types';

export interface OndcContext {
  domain: string;
  country: string;
  city: string;
  action: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  bpp_id: string;
  bpp_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  ttl: string;
}

export interface OndcProtocolResponse<T = any> {
  success: boolean;
  ackStatus: 'ACK' | 'NACK';
  transactionId: string;
  messageId: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    type?: string;
  };
}

export interface OndcQuoteBreakupItem {
  title: string;
  price: {
    currency: string;
    value: string;
  };
  item?: {
    id: string;
    quantity: {
      count: number;
    };
    price: {
      currency: string;
      value: string;
    };
  };
}

export interface OndcQuoteResult {
  price: {
    currency: string;
    value: string;
  };
  breakup: OndcQuoteBreakupItem[];
  ttl: string;
}

export interface OndcTrackingResult {
  url: string;
  status: string;
}

export interface OndcSupportResult {
  phone: string;
  email: string;
  uri: string;
}

class OndcClientService {
  private activeTransactionId: string | null = null;
  private currentSessionId: string = `km_session_${Date.now()}`;

  /**
   * Helper: Generate UUID v4
   */
  private generateUuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `km_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get or initialize session transaction ID
   */
  public getOrCreateTransactionId(): string {
    if (!this.activeTransactionId) {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const stored = window.sessionStorage.getItem('km_ondc_txnid');
        if (stored) {
          this.activeTransactionId = stored;
        } else {
          this.activeTransactionId = `txn_${this.generateUuid()}`;
          window.sessionStorage.setItem('km_ondc_txnid', this.activeTransactionId);
        }
      } else {
        this.activeTransactionId = `txn_${this.generateUuid()}`;
      }
    }
    return this.activeTransactionId;
  }

  /**
   * Reset active transaction ID when a transaction is completed or explicitly reset
   */
  public resetTransactionId(): string {
    this.activeTransactionId = `txn_${this.generateUuid()}`;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('km_ondc_txnid', this.activeTransactionId);
    }
    return this.activeTransactionId;
  }

  /**
   * Helper: Construct protocol-compliant context
   */
  private buildContext(action: string, customTxnId?: string): OndcContext {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kognitiminds.com';
    const txnId = customTxnId || this.getOrCreateTransactionId();
    const msgId = `msg_${this.generateUuid()}`;

    return {
      domain: 'ONDC:RETeB2B',
      country: 'IND',
      city: 'std:080',
      action,
      core_version: '1.2.5',
      bap_id: 'kognitiminds.com',
      bap_uri: origin,
      bpp_id: 'kogniti-minds-bpp',
      bpp_uri: 'https://kognitiminds.com',
      transaction_id: txnId,
      message_id: msgId,
      timestamp: new Date().toISOString(),
      ttl: 'PT30S',
    };
  }

  /**
   * Helper: Send HTTP POST request to backend ONDC endpoint
   */
  private async postProtocolRequest<T = any>(
    endpointAction: string,
    payload: { context: OndcContext; message: any }
  ): Promise<OndcProtocolResponse<T>> {
    const context = payload.context;
    try {
      const response = await fetch(`/${endpointAction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          success: false,
          ackStatus: 'NACK',
          transactionId: context.transaction_id,
          messageId: context.message_id,
          error: {
            code: resJson?.error?.code || String(response.status),
            message: resJson?.error?.message || 'Unable to complete this request. Please try again.',
            type: resJson?.error?.type || 'DOMAIN-ERROR',
          },
        };
      }

      const isAck = resJson?.message?.ack?.status === 'ACK';
      return {
        success: isAck,
        ackStatus: isAck ? 'ACK' : 'NACK',
        transactionId: context.transaction_id,
        messageId: context.message_id,
        data: resJson,
      };
    } catch (err: any) {
      return {
        success: false,
        ackStatus: 'NACK',
        transactionId: context.transaction_id,
        messageId: context.message_id,
        error: {
          code: '50000',
          message: err?.message || 'Network error communicating with ONDC gateway.',
          type: 'CORE-ERROR',
        },
      };
    }
  }

  /* ==========================================================================
     1. Search Products -> POST /search
     ========================================================================== */
  public async searchProducts(
    searchQuery: string = '',
    category: string = ''
  ): Promise<OndcProtocolResponse<{ query: string; itemsCount: number }>> {
    const context = this.buildContext('search');
    const payload = {
      context,
      message: {
        intent: {
          item: {
            descriptor: {
              name: searchQuery || 'paper',
            },
          },
          fulfillment: {
            type: 'Delivery',
          },
          payment: {
            '@ondc/org/buyer_app_finder_fee_type': 'percent',
            '@ondc/org/buyer_app_finder_fee_amount': '3',
          },
          ...(category && category !== 'All' ? { category: { id: category } } : {}),
        },
      },
    };

    return await this.postProtocolRequest('search', payload);
  }

  /* ==========================================================================
     2. Add to Cart / Select Items -> POST /select
     ========================================================================== */
  public async selectItems(
    items: Array<{ productId: string; quantity: number }>,
    providerId: string = 'kogniti-minds-bpp'
  ): Promise<OndcProtocolResponse<OndcQuoteResult>> {
    const context = this.buildContext('select');
    const protocolItems = items.map((i) => ({
      id: i.productId,
      quantity: {
        count: i.quantity,
      },
    }));

    const payload = {
      context,
      message: {
        order: {
          provider: {
            id: providerId,
          },
          items: protocolItems,
          fulfillments: [
            {
              end: {
                location: {
                  gps: '12.971598,77.594566',
                  address: {
                    area_code: '560001',
                  },
                },
              },
            },
          ],
        },
      },
    };

    return await this.postProtocolRequest<OndcQuoteResult>('select', payload);
  }

  public async selectProduct(productId: string, quantity: number = 1): Promise<OndcProtocolResponse<OndcQuoteResult>> {
    return this.selectItems([{ productId, quantity }]);
  }

  /* ==========================================================================
     3. Checkout / Initialise Order -> POST /init
     ========================================================================== */
  public async initOrder(params: {
    items: Array<{ productId: string; quantity: number }>;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    companyName?: string;
    gstin?: string;
  }): Promise<OndcProtocolResponse<any>> {
    const context = this.buildContext('init');
    const protocolItems = params.items.map((i) => ({
      id: i.productId,
      quantity: {
        count: i.quantity,
      },
    }));

    const payload = {
      context,
      message: {
        order: {
          provider: {
            id: 'kogniti-minds-bpp',
          },
          items: protocolItems,
          billing: {
            name: params.companyName || params.customerName,
            address: {
              door: params.street,
              name: params.street,
              building: params.street,
              street: params.street,
              city: params.city,
              state: params.state,
              country: 'IND',
              area_code: params.pincode,
            },
            email: params.customerEmail,
            phone: params.customerPhone,
            ...(params.gstin ? { tax_number: params.gstin } : {}),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          fulfillments: [
            {
              id: 'F1',
              type: 'Delivery',
              end: {
                contact: {
                  email: params.customerEmail,
                  phone: params.customerPhone,
                },
                location: {
                  gps: '12.971598,77.594566',
                  address: {
                    door: params.street,
                    name: params.street,
                    building: params.street,
                    street: params.street,
                    city: params.city,
                    state: params.state,
                    country: 'IND',
                    area_code: params.pincode,
                  },
                },
              },
            },
          ],
        },
      },
    };

    return await this.postProtocolRequest('init', payload);
  }

  public async initCheckout(
    deliveryAddress: {
      name: string;
      phone: string;
      addressLine1: string;
      city: string;
      state: string;
      pincode: string;
      email?: string;
    },
    paymentType: string = 'razorpay'
  ): Promise<OndcProtocolResponse<any>> {
    return this.initOrder({
      items: [],
      customerName: deliveryAddress.name,
      customerEmail: deliveryAddress.email || 'customer@kognitiminds.com',
      customerPhone: deliveryAddress.phone,
      street: deliveryAddress.addressLine1,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pincode: deliveryAddress.pincode,
    });
  }

  /* ==========================================================================
     4. Place Order / Confirm -> POST /confirm
     ========================================================================== */
  public async confirmOrder(params: {
    orderId: string;
    items: Array<{ productId: string; quantity: number }>;
    totalAmount: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    paymentId?: string;
    paymentMethod?: string;
  }): Promise<OndcProtocolResponse<any>> {
    const context = this.buildContext('confirm');
    const protocolItems = params.items.map((i) => ({
      id: i.productId,
      quantity: {
        count: i.quantity,
      },
    }));

    const payload = {
      context,
      message: {
        order: {
          id: params.orderId,
          state: 'Created',
          provider: {
            id: 'kogniti-minds-bpp',
          },
          items: protocolItems,
          billing: {
            name: params.customerName,
            address: {
              door: params.street,
              city: params.city,
              state: params.state,
              country: 'IND',
              area_code: params.pincode,
            },
            email: params.customerEmail,
            phone: params.customerPhone,
          },
          payment: {
            uri: 'https://kognitiminds.com/payment',
            tl_method: 'http/get',
            params: {
              currency: 'INR',
              transaction_id: params.paymentId || `pay_${Date.now()}`,
              amount: String(params.totalAmount),
            },
            status: 'PAID',
            type: 'ON-ORDER',
            collected_by: 'BAP',
          },
        },
      },
    };

    const res = await this.postProtocolRequest('confirm', payload);
    if (res.success) {
      // Start a fresh transaction sequence for subsequent distinct customer workflows
      this.resetTransactionId();
    }
    return res;
  }

  /* ==========================================================================
     5. Order Status -> POST /status
     ========================================================================== */
  public async getOrderStatus(
    orderId: string,
    transactionId?: string
  ): Promise<OndcProtocolResponse<any>> {
    const context = this.buildContext('status', transactionId);
    const payload = {
      context,
      message: {
        order_id: orderId,
      },
    };

    return await this.postProtocolRequest('status', payload);
  }

  /* ==========================================================================
     6. Track Order -> POST /track
     ========================================================================== */
  public async trackShipment(
    orderId: string,
    transactionId?: string
  ): Promise<OndcProtocolResponse<OndcTrackingResult>> {
    const context = this.buildContext('track', transactionId);
    const payload = {
      context,
      message: {
        order_id: orderId,
      },
    };

    return await this.postProtocolRequest<OndcTrackingResult>('track', payload);
  }

  /* ==========================================================================
     7. Cancel Order -> POST /cancel
     ========================================================================== */
  public async cancelOrder(
    orderId: string,
    reasonId: string = '001',
    transactionId?: string
  ): Promise<OndcProtocolResponse<any>> {
    const context = this.buildContext('cancel', transactionId);
    const payload = {
      context,
      message: {
        order_id: orderId,
        cancellation_reason_id: reasonId,
      },
    };

    return await this.postProtocolRequest('cancel', payload);
  }

  /* ==========================================================================
     8. Update / Return Order -> POST /update
     ========================================================================== */
  public async updateOrder(
    orderId: string,
    updateTarget: 'fulfillment' | 'item' = 'fulfillment',
    returnItems: Array<{ id: string; quantity: number }> = [],
    transactionId?: string
  ): Promise<OndcProtocolResponse<any>> {
    const context = this.buildContext('update', transactionId);
    const payload = {
      context,
      message: {
        update_target: updateTarget,
        order: {
          id: orderId,
          state: 'In-progress',
          items: returnItems.map((i) => ({
            id: i.id,
            quantity: {
              count: i.quantity,
            },
            tags: {
              update_type: 'return',
              reason_code: '001',
            },
          })),
        },
      },
    };

    return await this.postProtocolRequest('update', payload);
  }

  /* ==========================================================================
     9. Rate Order -> POST /rating
     ========================================================================== */
  public async submitRating(
    orderId: string,
    rating: number,
    feedback: string = '',
    transactionId?: string
  ): Promise<OndcProtocolResponse<any>> {
    const context = this.buildContext('rating', transactionId);
    const payload = {
      context,
      message: {
        rating_category: 'Order',
        id: orderId,
        value: String(rating),
        feedback_form: [
          {
            question: 'How was your delivery and product experience?',
            answer: feedback || 'Satisfied',
          },
        ],
      },
    };

    return await this.postProtocolRequest('rating', payload);
  }

  /* ==========================================================================
     10. Customer Support -> POST /support
     ========================================================================== */
  public async getSupport(
    orderId?: string,
    transactionId?: string
  ): Promise<OndcProtocolResponse<OndcSupportResult>> {
    const context = this.buildContext('support', transactionId);
    const payload = {
      context,
      message: {
        ref_id: orderId || 'km_support',
      },
    };

    return await this.postProtocolRequest<OndcSupportResult>('support', payload);
  }
}

export const ondcClientService = new OndcClientService();
export default ondcClientService;

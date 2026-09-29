/**
 * ONDCFulfilmentService
 * Generates forward and reverse logistics fulfillments, tracking links, and TAT
 * Kogniti Minds Private Limited
 */

export class ONDCFulfilmentService {
  /**
   * Generate forward delivery fulfillment object
   */
  static buildDeliveryFulfillment({
    fulfillmentId = 'F1',
    state = 'Pending',
    carrier = 'Delhivery Express Freight',
    trackingNumber = null,
    trackingUrl = null,
    deliveryTat = 'P2D',
  }) {
    const trackingObj = trackingUrl
      ? {
          url: trackingUrl,
          status: 'active',
        }
      : undefined;

    return {
      id: fulfillmentId,
      type: 'Delivery',
      state: {
        descriptor: {
          code: state,
        },
      },
      tracking: Boolean(trackingUrl),
      '@ondc/org/provider_name': carrier,
      '@ondc/org/tat': deliveryTat,
      ...(trackingObj ? { tracking_details: trackingObj } : {}),
    };
  }

  /**
   * Generate live tracking payload for /track endpoint
   */
  static buildTrackingPayload(orderId) {
    return {
      tracking: {
        url: `https://kognitiminds.com/track/${encodeURIComponent(orderId)}`,
        status: 'active',
      },
    };
  }
}

export default ONDCFulfilmentService;

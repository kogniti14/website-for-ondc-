/**
 * ONDCStatusService
 * Queries order status and constructs /on_status responses
 * Kogniti Minds Private Limited
 */

import { getOrderById } from '../orderManager.js';

export class ONDCStatusService {
  /**
   * Retrieve order status details
   */
  static getStatus(orderId) {
    const order = getOrderById(orderId);
    if (!order) {
      return { found: false, error: `Order '${orderId}' not found` };
    }

    return {
      found: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      fulfillmentStatus: order.fulfillmentStatus || 'Pending',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      grandTotal: order.grandTotal,
      order,
    };
  }
}

export default ONDCStatusService;

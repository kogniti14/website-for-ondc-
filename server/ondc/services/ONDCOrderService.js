/**
 * ONDCOrderService
 * Handles order lifecycle, pricing quotes, status progression, and persistence
 * Kogniti Minds Private Limited
 */

import {
  calculateQuote,
  createOndcOrder,
  getOrderById,
  getAllOndcOrders,
  updateOrderStatus,
} from '../orderManager.js';

export class ONDCOrderService {
  /**
   * Calculate B2B quote with GST breakdown and volume discounts
   */
  static calculateQuote(params) {
    return calculateQuote(params);
  }

  /**
   * Create and persist ONDC order
   */
  static createOrder(params) {
    return createOndcOrder(params);
  }

  /**
   * Retrieve order by ID
   */
  static getOrder(orderId) {
    return getOrderById(orderId);
  }

  /**
   * Retrieve all orders
   */
  static getAllOrders() {
    return getAllOndcOrders();
  }

  /**
   * Update order status
   */
  static updateStatus(orderId, newStatus, fulfillmentStatus) {
    return updateOrderStatus(orderId, newStatus, fulfillmentStatus);
  }
}

export default ONDCOrderService;

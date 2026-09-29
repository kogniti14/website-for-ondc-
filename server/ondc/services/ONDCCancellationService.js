/**
 * ONDCCancellationService
 * Validates cancellation eligibility, processes cancellations, and handles inventory restock
 * Kogniti Minds Private Limited
 */

import { cancelOrder, getOrderById } from '../orderManager.js';
import ondcLogger from '../logger.js';

export class ONDCCancellationService {
  /**
   * Check if order is eligible for cancellation
   */
  static isEligibleForCancellation(orderId) {
    const order = getOrderById(orderId);
    if (!order) {
      return { eligible: false, code: '30000', message: `Order '${orderId}' not found` };
    }

    if (order.orderStatus === 'Cancelled') {
      return { eligible: false, code: '30000', message: 'Order is already cancelled' };
    }

    if (order.orderStatus === 'Completed' || order.orderStatus === 'delivered') {
      return {
        eligible: false,
        code: '40003',
        message: "Cannot cancel order: Order has already been delivered. Please use the 'update' API to initiate a return.",
      };
    }

    return { eligible: true, order };
  }

  /**
   * Process order cancellation
   */
  static cancel(orderId, reasonId = '001') {
    const result = cancelOrder(orderId, reasonId);
    ondcLogger.info('cancel', `Processed cancellation for order ${orderId} with reason ${reasonId}`);
    return result;
  }
}

export default ONDCCancellationService;

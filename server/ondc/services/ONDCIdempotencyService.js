/**
 * ONDCIdempotencyService
 * Enforces transaction idempotency, replay protection, and duplicate rejection
 * Kogniti Minds Private Limited
 */

import stateManager from '../stateManager.js';

export class ONDCIdempotencyService {
  /**
   * Check if request is a duplicate based on transaction_id, message_id, and action
   */
  static check(transactionId, messageId, action) {
    return stateManager.checkIdempotency(transactionId, messageId, action);
  }

  /**
   * Record request idempotency state
   */
  static record(transactionId, messageId, action, result = { status: 'ACK' }) {
    return stateManager.recordIdempotency(transactionId, messageId, action, result);
  }
}

export default ONDCIdempotencyService;

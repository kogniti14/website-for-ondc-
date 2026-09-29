/**
 * ONDCTransactionService
 * Manages ONDC protocol transaction state transitions and lifecycle
 * Kogniti Minds Private Limited
 */

import stateManager from '../stateManager.js';

export class ONDCTransactionService {
  /**
   * Validate state transition before responding
   */
  static validateTransition(transactionId, action, messagePayload = {}) {
    return stateManager.validateTransition(transactionId, action, messagePayload);
  }

  /**
   * Record state transition
   */
  static recordTransition(data) {
    return stateManager.recordTransition(data);
  }

  /**
   * Retrieve transaction by ID
   */
  static getTransaction(transactionId) {
    return stateManager.getTransaction(transactionId);
  }

  /**
   * Retrieve all active transactions
   */
  static getAllTransactions() {
    return stateManager.getAllTransactions();
  }
}

export default ONDCTransactionService;

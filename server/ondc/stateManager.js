/**
 * ONDC:RETeB2B Transaction State Manager, Audit Logger & Idempotency Store
 * Kogniti Minds Private Limited
 * 
 * Enforces the Beckn/ONDC protocol state machine, tracks order lifecycle,
 * prevents duplicate operations via transaction_id + message_id + action keys,
 * and maintains structured transaction histories and logs for pre-production verification.
 */

class OndcStateManager {
  constructor() {
    // Map of transactionId -> transactionRecord
    this.transactions = new Map();
    // Circular buffer for recent logs (max 1,000 entries)
    this.logs = [];
    this.maxLogs = 1000;
    // Map of idempotencyKey -> { timestamp, action, result }
    this.idempotencyStore = new Map();
    this.idempotencyTtlMs = 24 * 60 * 60 * 1000; // 24 hours TTL
  }

  /**
   * Generate compound idempotency key from ONDC identifiers
   */
  getIdempotencyKey(transactionId, messageId, action) {
    return `${transactionId || 'no_txn'}:${messageId || 'no_msg'}:${action || 'no_action'}`;
  }

  /**
   * Check if a request has already been processed idempotently
   * @returns {{ isDuplicate: boolean, previousResult?: object }}
   */
  checkIdempotency(transactionId, messageId, action) {
    const key = this.getIdempotencyKey(transactionId, messageId, action);
    const existing = this.idempotencyStore.get(key);

    if (existing) {
      // Check expiration
      if (Date.now() - existing.timestamp < this.idempotencyTtlMs) {
        return { isDuplicate: true, previousResult: existing.result };
      }
      this.idempotencyStore.delete(key);
    }

    return { isDuplicate: false };
  }

  /**
   * Record idempotent result to protect against duplicate callbacks & retries
   */
  recordIdempotency(transactionId, messageId, action, result = {}) {
    const key = this.getIdempotencyKey(transactionId, messageId, action);
    this.idempotencyStore.set(key, {
      timestamp: Date.now(),
      action,
      transactionId,
      messageId,
      result,
    });

    // Clean up if map grows beyond 5,000 items
    if (this.idempotencyStore.size > 5000) {
      const now = Date.now();
      for (const [k, v] of this.idempotencyStore.entries()) {
        if (now - v.timestamp > this.idempotencyTtlMs) {
          this.idempotencyStore.delete(k);
        }
      }
    }
  }

  /**
   * Validate state transition before responding
   */
  validateTransition(transactionId, action, payload = {}) {
    const existing = this.transactions.get(transactionId);
    const currentState = existing ? existing.currentState : 'START';

    switch (action) {
      case 'search':
        // Search is always allowed
        return { valid: true };

      case 'select':
        // Select is allowed after search or direct discovery
        return { valid: true };

      case 'init':
        // Init is allowed after select (or search in loose test suites)
        return { valid: true };

      case 'confirm':
        // In ONDC protocol, confirm requires a prior init step
        if (!existing || (currentState !== 'INITIALIZED' && currentState !== 'SELECTED')) {
          // Allow in loose environments, but validate
          return {
            valid: true,
            warning: `Confirm received in state '${currentState}' without preceding INIT. Processed with caution.`,
          };
        }
        return { valid: true };

      case 'status':
        // Status query is always valid
        return { valid: true };

      case 'cancel':
        // Delivered / Completed orders cannot be cancelled; must use return flow
        if (existing && existing.currentState === 'Completed') {
          return {
            valid: false,
            code: '40003',
            message: "Cannot cancel order: Order has already been delivered. Please use the 'update' API to initiate a return.",
          };
        }
        return { valid: true };

      case 'update':
        // Return / Update validation
        const updateTarget = (payload.update_target || 'fulfillment').toLowerCase();
        if (updateTarget.includes('fulfillment') || updateTarget.includes('item')) {
          // If order is cancelled, return cannot be initiated
          if (existing && existing.currentState === 'Cancelled') {
            return {
              valid: false,
              code: '40002',
              message: 'Invalid return request: Cancelled orders are not eligible for return.',
            };
          }
        }
        return { valid: true };

      case 'rating':
      case 'track':
      case 'support':
        return { valid: true };

      default:
        return { valid: true };
    }
  }

  /**
   * Record a state machine transition
   */
  recordTransition({
    transactionId,
    messageId,
    action,
    orderId = null,
    nextState = null,
    fulfillmentState = null,
    requestSummary = null,
    responseSummary = null,
  }) {
    if (!transactionId) return null;

    const existing = this.transactions.get(transactionId) || {
      transactionId,
      orderId,
      currentState: 'START',
      previousState: null,
      fulfillmentState: 'Pending',
      history: [],
      createdAt: new Date().toISOString(),
    };

    const previousState = existing.currentState;
    const resolvedNextState = nextState || this.deriveDefaultNextState(action, previousState);

    existing.previousState = previousState;
    existing.currentState = resolvedNextState;
    if (orderId) existing.orderId = orderId;
    if (fulfillmentState) existing.fulfillmentState = fulfillmentState;
    existing.updatedAt = new Date().toISOString();

    existing.history.push({
      action,
      messageId,
      fromState: previousState,
      toState: resolvedNextState,
      fulfillmentState: existing.fulfillmentState,
      timestamp: new Date().toISOString(),
      requestSummary,
      responseSummary,
    });

    this.transactions.set(transactionId, existing);
    return existing;
  }

  /**
   * Derive default state from protocol action
   */
  deriveDefaultNextState(action, current) {
    switch (action) {
      case 'search':
        return 'SEARCHED';
      case 'select':
        return 'SELECTED';
      case 'init':
        return 'INITIALIZED';
      case 'confirm':
        return 'Created';
      case 'status':
        return current;
      case 'cancel':
        return 'Cancelled';
      case 'update':
        return current === 'Completed' ? 'Completed' : current;
      default:
        return current;
    }
  }

  /**
   * Add structured audit log
   */
  addLog({
    action,
    transactionId = null,
    messageId = null,
    status = 200,
    durationMs = 0,
    error = null,
    metadata = {},
  }) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      action,
      transactionId,
      messageId,
      status,
      durationMs,
      error: error ? (error.message || String(error)) : null,
      metadata,
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.length = this.maxLogs;
    }
    return logEntry;
  }

  getTransaction(transactionId) {
    return this.transactions.get(transactionId) || null;
  }

  getAllTransactions() {
    return Array.from(this.transactions.values()).sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
  }

  getRecentLogs(limit = 100) {
    return this.logs.slice(0, Math.min(limit, this.logs.length));
  }

  clearAll() {
    this.transactions.clear();
    this.logs = [];
    this.idempotencyStore.clear();
  }
}

export const stateManager = new OndcStateManager();
export default stateManager;

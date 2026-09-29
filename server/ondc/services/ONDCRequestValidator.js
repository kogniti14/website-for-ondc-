/**
 * ONDCRequestValidator
 * Validates request structure, context attributes, and protocol constraints per RETeB2B 1.2.5
 * Kogniti Minds Private Limited
 */

import ondcConfig from '../config.js';

export class ONDCRequestValidator {
  /**
   * Validate common ONDC Context per Beckn RFC & RETeB2B 1.2.5 Specification
   * @param {object} context 
   * @returns {{ valid: boolean, error?: { code: string, message: string } }}
   */
  static validateContext(context) {
    if (!context || typeof context !== 'object') {
      return {
        valid: false,
        error: { code: '10000', message: 'Missing or invalid request context' },
      };
    }

    const { domain, action, transaction_id, message_id } = context;

    if (!domain || !action || !transaction_id || !message_id) {
      return {
        valid: false,
        error: {
          code: '10000',
          message: 'Missing required context attributes (domain, action, transaction_id, message_id)',
        },
      };
    }

    if (domain !== ondcConfig.domain) {
      return {
        valid: false,
        error: {
          code: '10001',
          message: `Invalid domain '${domain}'. Expected '${ondcConfig.domain}'.`,
        },
      };
    }

    if (context.core_version && context.core_version !== '1.2.5') {
      return {
        valid: false,
        error: {
          code: '10002',
          message: `Unsupported core_version '${context.core_version}'. Expected '1.2.5'.`,
        },
      };
    }

    return { valid: true };
  }

  /**
   * Validate action-specific message payload
   */
  static validateActionPayload(action, message) {
    if (!message || typeof message !== 'object') {
      return {
        valid: false,
        error: { code: '10000', message: `Missing message payload for action '${action}'` },
      };
    }

    switch (action) {
      case 'select':
        if (!message.order || !Array.isArray(message.order.items) || message.order.items.length === 0) {
          return {
            valid: false,
            error: { code: '30000', message: 'Select message requires order.items array with at least one item' },
          };
        }
        break;

      case 'init':
        if (!message.order || !message.order.billing || !message.order.fulfillments) {
          return {
            valid: false,
            error: { code: '30000', message: 'Init message requires order with billing and fulfillments details' },
          };
        }
        break;

      case 'confirm':
        if (!message.order || !message.order.id || !message.order.payment) {
          return {
            valid: false,
            error: { code: '30000', message: 'Confirm message requires order with id and payment status' },
          };
        }
        break;

      case 'cancel':
        if (!message.order_id || !message.cancellation_reason_id) {
          return {
            valid: false,
            error: { code: '30000', message: 'Cancel message requires order_id and cancellation_reason_id' },
          };
        }
        break;

      case 'update':
        if (!message.update_target || !message.order) {
          return {
            valid: false,
            error: { code: '30000', message: 'Update message requires update_target and order object' },
          };
        }
        break;

      default:
        break;
    }

    return { valid: true };
  }
}

export default ONDCRequestValidator;

/**
 * ONDCContextValidator
 * Validates and constructs protocol-compliant context objects
 * Kogniti Minds Private Limited
 */

import crypto from 'crypto';
import ondcConfig from '../config.js';

export class ONDCContextValidator {
  /**
   * Validate context timestamp freshness and TTL
   */
  static validateTimestamp(timestamp, maxAgeMinutes = 10) {
    if (!timestamp) return { valid: false, message: 'Missing timestamp in context' };
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return { valid: false, message: 'Invalid ISO timestamp format' };

    const diffMs = Math.abs(Date.now() - date.getTime());
    if (diffMs > maxAgeMinutes * 60 * 1000) {
      return { valid: false, message: `Timestamp outside acceptable window (${maxAgeMinutes} minutes)` };
    }
    return { valid: true };
  }

  /**
   * Build standard ONDC context for outgoing callbacks
   */
  static buildCallbackContext(incomingContext = {}, action) {
    return {
      domain: incomingContext.domain || ondcConfig.domain,
      country: incomingContext.country || ondcConfig.country || 'IND',
      city: incomingContext.city || ondcConfig.city || 'std:080',
      action,
      core_version: incomingContext.core_version || ondcConfig.coreVersion || '1.2.5',
      bap_id: incomingContext.bap_id || 'workbench.ondc.tech',
      bap_uri: incomingContext.bap_uri || ondcConfig.buyerBaseUrl || 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer',
      bpp_id: ondcConfig.subscriberId || 'kognitiminds.com',
      bpp_uri: ondcConfig.subscriberUri || 'https://kognitiminds.com',
      transaction_id: incomingContext.transaction_id || `txn_${Date.now()}`,
      message_id: crypto.randomUUID ? crypto.randomUUID() : `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      ttl: 'PT30S',
    };
  }
}

export default ONDCContextValidator;

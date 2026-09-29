/**
 * ONDCSignatureService
 * Handles cryptographic signing and signature verification for ONDC/Beckn protocol
 * Kogniti Minds Private Limited
 */

import ondcConfig from '../config.js';
import { createAuthorizationHeader, verifyAuthorization } from '../security/index.js';

export class ONDCSignatureService {
  /**
   * Verify inbound request authorization
   * @param {{ header: string, rawBody: string, action: string }} param0 
   * @returns {Promise<{ valid: boolean, error?: string, subscriberId?: string, keyId?: string }>}
   */
  static async verifyRequest({ header, rawBody, action }) {
    return await verifyAuthorization({
      header,
      rawBody,
      action,
    });
  }

  /**
   * Create outgoing authorization header for callback dispatch
   * @param {{ body: string, action: string }} param0 
   * @returns {string}
   */
  static createHeader({ body, action }) {
    if (!ondcConfig.hasKeys()) {
      return '';
    }

    return createAuthorizationHeader({
      body,
      action,
      subscriberId: ondcConfig.subscriberId,
      keyId: ondcConfig.keyId,
      privateKey: ondcConfig.privateKey,
    });
  }

  /**
   * Check if signing keys are configured in environment
   */
  static hasKeys() {
    return ondcConfig.hasKeys();
  }
}

export default ONDCSignatureService;

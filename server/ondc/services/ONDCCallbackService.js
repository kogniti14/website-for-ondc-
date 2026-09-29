/**
 * ONDCCallbackService
 * Manages outgoing asynchronous protocol callbacks to BAP nodes with Ed25519 signatures
 * Kogniti Minds Private Limited
 */

import ondcConfig from '../config.js';
import ondcLogger from '../logger.js';
import ONDCSignatureService from './ONDCSignatureService.js';

export class ONDCCallbackService {
  /**
   * Dispatch asynchronous callback to BAP
   * @param {string} bapUri 
   * @param {string} action 
   * @param {object} payload 
   * @returns {Promise<{ success: boolean, status?: number, error?: string }>}
   */
  static async dispatchCallback(bapUri, action, payload) {
    const targetUri = bapUri || ondcConfig.buyerBaseUrl || 'https://workbench.ondc.tech/api-service/ONDC:RETeB2B/1.2.5/buyer';
    if (!targetUri) {
      ondcLogger.warn(action, 'No bap_uri provided in request context; skipping HTTP dispatch');
      return { success: false, error: 'Missing BAP URI' };
    }

    const cleanUri = targetUri.replace(/\/+$/, '');
    const url = cleanUri.endsWith(action) ? cleanUri : `${cleanUri}/${action}`;
    const stringifiedBody = JSON.stringify(payload);

    let authHeader = '';
    try {
      authHeader = ONDCSignatureService.createHeader({
        body: stringifiedBody,
        action,
      });
    } catch (err) {
      ondcLogger.error(action, 'Failed to sign outgoing authorization header', err);
    }

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Kogniti-Minds-BPP/1.2.5',
    };
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    ondcLogger.info(action, `Dispatching asynchronous callback to: ${url}`, {
      transactionId: payload.context?.transaction_id,
      messageId: payload.context?.message_id,
    });

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: stringifiedBody,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      ondcLogger.info(action, `Callback dispatched successfully. Status: ${response.status}`, {
        bapUri,
        status: response.status,
      });

      return { success: response.ok, status: response.status };
    } catch (err) {
      ondcLogger.warn(action, `Callback dispatch notice for ${url}: ${err.message}`, {
        bapUri,
        error: err.message,
      });
      return { success: false, error: err.message };
    }
  }
}

export default ONDCCallbackService;

/**
 * ONDC Security - Ed25519 Signing Module
 * Kogniti Minds Private Limited
 * 
 * Signs Beckn signing strings using Ed25519 private keys.
 */

import crypto from 'crypto';
import ondcConfig from '../config.js';
import { parsePrivateKey } from './keyManagement.js';

/**
 * Format standard Beckn/ONDC signing string
 * @param {object} params
 * @param {string|number} params.created
 * @param {string|number} params.expires
 * @param {string} params.digest
 * @param {string} [params.action]
 * @param {boolean} [params.reqTarget=false]
 * @returns {string}
 */
export function createSigningString({ created, expires, digest, action, reqTarget }) {
  if (reqTarget && action) {
    return `(request-target): post /${action}\n(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest}`;
  }
  return `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest}`;
}

/**
 * Sign data string using Ed25519 private key
 * @param {string} signingString - Pre-formatted signing string
 * @param {string|crypto.KeyObject} [privateKeyInput] - Optional override
 * @returns {string} Base64 encoded digital signature
 */
export function signString(signingString, privateKeyInput) {
  const keyObj = parsePrivateKey(privateKeyInput || ondcConfig.privateKey);
  if (!keyObj) {
    throw new Error('ONDC_PRIVATE_KEY is not configured or invalid.');
  }

  // Node.js crypto.sign with null algorithm produces standard Ed25519 signature
  const signatureBuffer = crypto.sign(null, Buffer.from(signingString, 'utf8'), keyObj);
  return signatureBuffer.toString('base64');
}

export default {
  createSigningString,
  signString,
};

/**
 * ONDC Security - Authorization Header Builder & Parser
 * Kogniti Minds Private Limited
 * 
 * Compliant with ONDC & Beckn Protocol Specifications:
 * Builds Authorization headers of format:
 * Signature keyId="subscriber_id|key_id|ed25519",algorithm="ed25519",created="...",expires="...",headers="(created) (expires) digest",signature="..."
 */

import ondcConfig from '../config.js';
import { createDigest } from './digest.js';
import { createSigningString, signString } from './signing.js';

/**
 * Generate standard Beckn/ONDC Authorization header for outgoing request or callback
 * @param {object} params
 * @param {string|object} params.body - Request payload
 * @param {string} [params.action] - e.g. "on_search"
 * @param {string} [params.subscriberId] - e.g. "kognitiminds.com"
 * @param {string} [params.keyId] - e.g. "kogniti-key-01"
 * @param {string} [params.privateKey] - Optional private key override
 * @param {number} [params.ttlSeconds=300] - Default 5 minutes
 * @param {boolean} [params.includeReqTarget=false]
 * @returns {string} Fully formed Authorization header string
 */
export function createAuthorizationHeader({
  body,
  action = '',
  subscriberId = ondcConfig.subscriberId,
  keyId = ondcConfig.keyId,
  privateKey = ondcConfig.privateKey,
  ttlSeconds = 300,
  includeReqTarget = false,
}) {
  const digest = createDigest(body);
  const now = Math.floor(Date.now() / 1000);
  const created = now.toString();
  const expires = (now + ttlSeconds).toString();

  const signingString = createSigningString({
    created,
    expires,
    digest,
    action,
    reqTarget: includeReqTarget,
  });

  const signature = signString(signingString, privateKey);
  const headersField = includeReqTarget
    ? '(request-target) (created) (expires) digest'
    : '(created) (expires) digest';

  return `Signature keyId="${subscriberId}|${keyId}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="${headersField}",signature="${signature}"`;
}

/**
 * Parse an incoming Beckn/ONDC Authorization header
 * @param {string} authHeader 
 * @returns {object|null} Parsed header object
 */
export function parseAuthorizationHeader(authHeader) {
  if (!authHeader || typeof authHeader !== 'string') return null;

  const header = authHeader.trim();
  if (!header.startsWith('Signature ')) return null;

  const parts = header.substring('Signature '.length);
  const result = {};

  const regex = /([a-zA-Z_-]+)="([^"]*)"/g;
  let match;
  while ((match = regex.exec(parts)) !== null) {
    result[match[1]] = match[2];
  }

  if (result.keyId) {
    const keyParts = result.keyId.split('|');
    result.subscriberId = keyParts[0] || '';
    result.uniqueKeyId = keyParts[1] || '';
    result.algorithm = keyParts[2] || result.algorithm || 'ed25519';
  }

  return result;
}

export default {
  createAuthorizationHeader,
  parseAuthorizationHeader,
};

/**
 * ONDC Security - Signature Verification Module
 * Kogniti Minds Private Limited
 * 
 * Verifies incoming requests from ONDC Gateway and Buyer Apps:
 * - Parses Beckn Authorization header
 * - Validates digest against raw body (BLAKE-512)
 * - Verifies Ed25519 digital signature against public key
 * - Enforces timestamp validity and replay prevention
 */

import crypto from 'crypto';
import ondcConfig from '../config.js';
import { createDigest } from './digest.js';
import { parseAuthorizationHeader } from './authorization.js';
import { parsePublicKey, publicKeyCache } from './keyManagement.js';
import { validateTimestamps } from './replayProtection.js';

/**
 * Fetch a subscriber's public key from the ONDC Registry
 * @param {string} subscriberId - e.g. "buyer-app.ondc.org"
 * @param {string} uniqueKeyId - e.g. "key-01"
 * @returns {Promise<string|null>} Base64 public key
 */
export async function lookupSubscriberPublicKey(subscriberId, uniqueKeyId) {
  const cacheKey = `${subscriberId}:${uniqueKeyId}`;
  if (publicKeyCache.has(cacheKey)) {
    return publicKeyCache.get(cacheKey);
  }

  // Pre-seed local / known subscriber public key for testing
  if (subscriberId === ondcConfig.subscriberId && ondcConfig.publicKey) {
    publicKeyCache.set(cacheKey, ondcConfig.publicKey);
    return ondcConfig.publicKey;
  }

  try {
    const registryUrl = `${ondcConfig.registryUrl}/lookup`;
    const response = await fetch(registryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscriber_id: subscriberId,
        ukId: uniqueKeyId,
        domain: ondcConfig.domain,
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = await response.json();
      const entry = Array.isArray(data) ? data[0] : data;
      if (entry && entry.signing_public_key) {
        publicKeyCache.set(cacheKey, entry.signing_public_key);
        return entry.signing_public_key;
      }
    }
  } catch (err) {
    // Registry unreachable or lookup failed
  }

  return null;
}

/**
 * Verify an incoming Beckn/ONDC request authorization signature
 * @param {object} params
 * @param {string} params.header - Incoming Authorization header string
 * @param {string} params.rawBody - Exact unparsed request body string
 * @param {string} [params.action] - e.g. "search"
 * @param {string} [params.publicKeyOverride] - Test/mock public key
 * @returns {Promise<{ valid: boolean, code?: string, error?: string, subscriberId?: string }>}
 */
export async function verifyAuthorization({ header, rawBody, action = '', publicKeyOverride = null }) {
  if (!header) {
    // If auth enforcement is explicitly disabled via env OR in test mode without configured keys
    if (process.env.ONDC_ENFORCE_AUTH === 'false' || (ondcConfig.env !== 'prod' && !ondcConfig.hasKeys())) {
      return { valid: true, warning: 'Unsigned request allowed in local/preprod test mode' };
    }
    return { valid: false, code: '10001', error: 'Missing Authorization header' };
  }

  const parsed = parseAuthorizationHeader(header);
  if (!parsed || !parsed.signature || !parsed.keyId) {
    return { valid: false, code: '10002', error: 'Malformed Authorization header format' };
  }

  // Check timestamps if provided in header
  if (parsed.created) {
    const timeCheck = validateTimestamps({ created: parsed.created, expires: parsed.expires });
    if (!timeCheck.valid) {
      return { valid: false, code: '10003', error: timeCheck.error };
    }
  }

  // Compute and check BLAKE-512 digest
  const digest = createDigest(rawBody || '');

  // Reconstruct signing string according to headers specification
  const includeReqTarget = (parsed.headers || '').includes('(request-target)');
  let signingString = '';

  if (includeReqTarget && action) {
    signingString = `(request-target): post /${action}\n(created): ${parsed.created}\n(expires): ${parsed.expires}\ndigest: BLAKE-512=${digest}`;
  } else if (parsed.created && parsed.expires) {
    signingString = `(created): ${parsed.created}\n(expires): ${parsed.expires}\ndigest: BLAKE-512=${digest}`;
  } else {
    // Fallback simple digest format
    signingString = `digest: BLAKE-512=${digest}`;
  }

  // Resolve public key
  let pubKeyRaw = publicKeyOverride;
  if (!pubKeyRaw) {
    pubKeyRaw = await lookupSubscriberPublicKey(parsed.subscriberId, parsed.uniqueKeyId);
  }

  // If testing or subscriber key lookup failed, attempt using local public key for roundtrip validation
  if (!pubKeyRaw && parsed.subscriberId === ondcConfig.subscriberId) {
    pubKeyRaw = ondcConfig.publicKey;
  }

  if (!pubKeyRaw) {
    // If running in development / workbench preprod mode without live registry, allow graceful logging
    if (ondcConfig.env !== 'prod' && !ondcConfig.hasKeys()) {
      return {
        valid: true,
        warning: 'Unverified: Public key not found in registry (tolerated in preprod dev mode).',
        subscriberId: parsed.subscriberId,
      };
    }
    return {
      valid: false,
      code: '10004',
      error: `Could not resolve public key for subscriber: ${parsed.subscriberId}`,
    };
  }

  const pubKeyObj = parsePublicKey(pubKeyRaw);
  if (!pubKeyObj) {
    return { valid: false, code: '10005', error: 'Invalid public key format' };
  }

  try {
    const isVerified = crypto.verify(
      null,
      Buffer.from(signingString, 'utf8'),
      pubKeyObj,
      Buffer.from(parsed.signature, 'base64')
    );

    return {
      valid: isVerified,
      code: isVerified ? undefined : '10006',
      error: isVerified ? undefined : 'Signature verification failed. Digest or signature mismatch.',
      subscriberId: parsed.subscriberId,
    };
  } catch (err) {
    return {
      valid: false,
      code: '10007',
      error: `Cryptographic verification error: ${err.message}`,
    };
  }
}

export default {
  verifyAuthorization,
  lookupSubscriberPublicKey,
};

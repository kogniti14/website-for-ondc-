/**
 * ONDC Cryptographic Utilities
 * Compliant with ONDC & Beckn Protocol Specifications:
 * - BLAKE-512 (Blake2b 512-bit) body digest
 * - Ed25519 digital signature signing & verification
 * - Authorization header construction & validation
 */

import crypto from 'crypto';
import ondcConfig from './config.js';

const PKCS8_ED25519_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');
const SPKI_ED25519_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

// In-memory cache for subscriber public keys to minimize registry lookups
const publicKeyCache = new Map();

/**
 * Convert base64 / raw private key into Node.js KeyObject
 */
export function parsePrivateKey(rawKey) {
  if (!rawKey) return null;
  if (typeof rawKey !== 'string') {
    return rawKey;
  }
  const clean = rawKey.trim();
  if (clean.includes('BEGIN PRIVATE KEY')) {
    return crypto.createPrivateKey(clean);
  }
  const buf = Buffer.from(clean, 'base64');
  // If 64 bytes (libsodium secret key = 32 seed + 32 pub), take the first 32 bytes
  const seed = buf.length === 64 ? buf.subarray(0, 32) : buf;
  if (seed.length === 32) {
    return crypto.createPrivateKey({
      key: Buffer.concat([PKCS8_ED25519_PREFIX, seed]),
      format: 'der',
      type: 'pkcs8',
    });
  }
  // Try direct DER import if length matches full PKCS#8
  return crypto.createPrivateKey({
    key: buf,
    format: 'der',
    type: 'pkcs8',
  });
}

/**
 * Convert base64 / raw public key into Node.js KeyObject
 */
export function parsePublicKey(rawKey) {
  if (!rawKey) return null;
  if (typeof rawKey !== 'string') {
    return rawKey;
  }
  const clean = rawKey.trim();
  if (clean.includes('BEGIN PUBLIC KEY')) {
    return crypto.createPublicKey(clean);
  }
  const buf = Buffer.from(clean, 'base64');
  if (buf.length === 32) {
    return crypto.createPublicKey({
      key: Buffer.concat([SPKI_ED25519_PREFIX, buf]),
      format: 'der',
      type: 'spki',
    });
  }
  return crypto.createPublicKey({
    key: buf,
    format: 'der',
    type: 'spki',
  });
}

/**
 * Compute BLAKE-512 (Blake2b 512-bit) digest of request body
 */
export function createDigest(body) {
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  const hash = crypto.createHash('blake2b512').update(content, 'utf8').digest('base64');
  return hash;
}

/**
 * Format standard Beckn/ONDC signing string
 */
export function createSigningString({ created, expires, digest, action, reqTarget }) {
  if (reqTarget) {
    return `(request-target): post /${action}\n(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest}`;
  }
  return `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest}`;
}

/**
 * Sign data using Ed25519 private key
 */
export function signString(signingString, privateKeyInput) {
  const keyObj = parsePrivateKey(privateKeyInput || ondcConfig.privateKey);
  if (!keyObj) {
    throw new Error('ONDC_PRIVATE_KEY is not configured or invalid.');
  }
  const signature = crypto.sign(null, Buffer.from(signingString, 'utf8'), keyObj);
  return signature.toString('base64');
}

/**
 * Generate ONDC Authorization Header
 */
export function createAuthorizationHeader({
  body,
  subscriberId = ondcConfig.subscriberId,
  keyId = ondcConfig.keyId,
  privateKey = ondcConfig.privateKey,
  ttlSeconds = 300,
  action = '',
  includeRequestTarget = false,
}) {
  const created = Math.floor(Date.now() / 1000);
  const expires = created + ttlSeconds;
  const digest = createDigest(body);

  const signingString = createSigningString({
    created,
    expires,
    digest,
    action,
    reqTarget: includeRequestTarget,
  });

  const signature = signString(signingString, privateKey);
  const headers = includeRequestTarget
    ? '(request-target) (created) (expires) digest'
    : '(created) (expires) digest';

  return `Signature keyId="${subscriberId}|${keyId}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="${headers}",signature="${signature}"`;
}

/**
 * Parse ONDC Authorization Header into key/value pairs
 */
export function parseAuthorizationHeader(header) {
  if (!header || !header.startsWith('Signature ')) {
    return null;
  }
  const paramString = header.slice(10);
  const regex = /([a-zA-Z0-9]+)="([^"]*)"/g;
  const params = {};
  let match;
  while ((match = regex.exec(paramString)) !== null) {
    params[match[1]] = match[2];
  }

  if (params.keyId) {
    const parts = params.keyId.split('|');
    params.subscriberId = parts[0];
    params.uniqueKeyId = parts[1];
    params.keyType = parts[2] || 'ed25519';
  }

  return params;
}

/**
 * Verify incoming ONDC request signature
 */
export async function verifyAuthorization({
  header,
  rawBody,
  action = '',
  skipInPreprodIfUnconfigured = true,
}) {
  // If in preprod and keys not yet set, allow testing to proceed with log note
  if (!header) {
    if (ondcConfig.env === 'preprod' && skipInPreprodIfUnconfigured && !ondcConfig.hasKeys()) {
      return { valid: true, warning: 'Skipped signature check: keys not configured in preprod' };
    }
    return { valid: false, error: 'Missing Authorization header' };
  }

  const parsed = parseAuthorizationHeader(header);
  if (!parsed || !parsed.signature || !parsed.created || !parsed.expires) {
    return { valid: false, error: 'Malformed Authorization header' };
  }

  // Check timestamp freshness (allow 10 min window to absorb clock drift)
  const now = Math.floor(Date.now() / 1000);
  const created = parseInt(parsed.created, 10);
  const expires = parseInt(parsed.expires, 10);
  if (now < created - 300 || now > expires + 300) {
    return { valid: false, error: 'Signature expired or timestamp outside acceptable skew' };
  }

  // Calculate body digest
  const digest = createDigest(rawBody);

  // Reconstruct signing string according to headers specified
  const headersList = (parsed.headers || '').split(' ');
  const lines = [];
  for (const h of headersList) {
    if (h === '(request-target)') {
      lines.push(`(request-target): post /${action}`);
    } else if (h === '(created)') {
      lines.push(`(created): ${parsed.created}`);
    } else if (h === '(expires)') {
      lines.push(`(expires): ${parsed.expires}`);
    } else if (h === 'digest') {
      lines.push(`digest: BLAKE-512=${digest}`);
    }
  }

  const signingString = lines.join('\n');

  // Lookup public key (cache -> registry lookup / known workbench test keys)
  let pubKeyRaw = publicKeyCache.get(parsed.subscriberId);
  if (!pubKeyRaw && parsed.subscriberId === ondcConfig.subscriberId) {
    pubKeyRaw = ondcConfig.publicKey;
  }

  if (!pubKeyRaw) {
    try {
      pubKeyRaw = await lookupSubscriberPublicKey(parsed.subscriberId, parsed.uniqueKeyId);
      if (pubKeyRaw) {
        publicKeyCache.set(parsed.subscriberId, pubKeyRaw);
      }
    } catch {
      // In sandbox/preprod, if registry lookup is offline or participant not yet indexed
      if (ondcConfig.env === 'preprod') {
        return {
          valid: true,
          warning: `Registry lookup unavailable for ${parsed.subscriberId}; accepted in preprod`,
        };
      }
      return { valid: false, error: `Could not retrieve public key for subscriber ${parsed.subscriberId}` };
    }
  }

  if (!pubKeyRaw) {
    if (ondcConfig.env === 'preprod') {
      return { valid: true, warning: 'Public key lookup fallback accepted in preprod' };
    }
    return { valid: false, error: 'Public key not found' };
  }

  try {
    const pubKeyObj = parsePublicKey(pubKeyRaw);
    const isValid = crypto.verify(
      null,
      Buffer.from(signingString, 'utf8'),
      pubKeyObj,
      Buffer.from(parsed.signature, 'base64')
    );
    return { valid: isValid, error: isValid ? null : 'Invalid cryptographic signature' };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Lookup public key from ONDC Registry
 */
export async function lookupSubscriberPublicKey(subscriberId, keyId) {
  const url = `${ondcConfig.registryUrl}/lookup`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscriber_id: subscriberId,
      domain: ondcConfig.domain,
      type: 'BAP',
    }),
  });

  if (!response.ok) {
    throw new Error(`Registry lookup returned status ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && data.length > 0) {
    const entry = keyId ? data.find((e) => e.ukId === keyId || e.key_id === keyId) || data[0] : data[0];
    return entry.signing_public_key;
  }
  return null;
}

export default {
  createDigest,
  createSigningString,
  signString,
  createAuthorizationHeader,
  parseAuthorizationHeader,
  verifyAuthorization,
  lookupSubscriberPublicKey,
};

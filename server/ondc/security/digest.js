/**
 * ONDC Security - Body Digest Generator & Validator
 * Kogniti Minds Private Limited
 * 
 * Standard: BLAKE-512 (Blake2b with 512-bit output)
 * Used in ONDC / Beckn Protocol for request-body integrity verification.
 */

import crypto from 'crypto';

/**
 * Compute BLAKE-512 (Blake2b 512-bit) digest of request body
 * @param {string|object} body - String or JSON object to hash
 * @returns {string} Base64 encoded digest string
 */
export function createDigest(body) {
  if (body === undefined || body === null) {
    body = '';
  }
  const content = typeof body === 'string' ? body : JSON.stringify(body);
  return crypto.createHash('blake2b512').update(content, 'utf8').digest('base64');
}

/**
 * Verify whether an incoming BLAKE-512 digest header matches the raw request body
 * @param {string} rawBody - Raw UTF-8 request body string
 * @param {string} incomingDigestHeader - Header value e.g. "BLAKE-512=..." or raw base64
 * @returns {boolean} True if matching, false otherwise
 */
export function verifyDigest(rawBody, incomingDigestHeader) {
  if (!incomingDigestHeader) return false;
  
  let targetDigest = incomingDigestHeader.trim();
  if (targetDigest.startsWith('BLAKE-512=')) {
    targetDigest = targetDigest.slice('BLAKE-512='.length);
  }

  const computed = createDigest(rawBody);
  
  try {
    const compBuf = Buffer.from(computed, 'base64');
    const targBuf = Buffer.from(targetDigest, 'base64');
    if (compBuf.length !== targBuf.length) return false;
    return crypto.timingSafeEqual(compBuf, targBuf);
  } catch {
    return false;
  }
}

export default {
  createDigest,
  verifyDigest,
};

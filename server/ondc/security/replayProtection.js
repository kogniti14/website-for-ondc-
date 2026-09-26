/**
 * ONDC Security - Replay Protection & Timestamp Validator
 * Kogniti Minds Private Limited
 * 
 * Verifies that incoming Beckn requests are fresh:
 * - Checks (created) timestamp is within allowed clock-skew (default 300s / 5 minutes)
 * - Checks (expires) timestamp has not passed
 * - Tracks processed messageIds in sliding window to prevent replay attacks
 */

const DEFAULT_CLOCK_SKEW_SECONDS = 300; // 5 minutes
const processedMessageIds = new Map();
const MESSAGE_ID_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// Periodic cleanup of expired messageIds
setInterval(() => {
  const now = Date.now();
  for (const [msgId, expiry] of processedMessageIds.entries()) {
    if (now > expiry) {
      processedMessageIds.delete(msgId);
    }
  }
}, 60 * 1000).unref();

/**
 * Validate timestamps from Beckn Authorization header
 * @param {object} params
 * @param {number|string} params.created - Created UNIX timestamp in seconds
 * @param {number|string} params.expires - Expires UNIX timestamp in seconds
 * @param {number} [params.maxSkewSeconds=300] - Allowed clock skew
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTimestamps({ created, expires, maxSkewSeconds = DEFAULT_CLOCK_SKEW_SECONDS }) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const createdSec = parseInt(created, 10);
  const expiresSec = parseInt(expires, 10);

  if (isNaN(createdSec)) {
    return { valid: false, error: 'Missing or malformed created timestamp in signature header.' };
  }

  // Check if created is too far in future
  if (createdSec > nowSeconds + maxSkewSeconds) {
    return {
      valid: false,
      error: `Signature timestamp is in the future (created: ${createdSec}, current: ${nowSeconds}). Clock skew exceeded.`,
    };
  }

  // Check if created is too old
  if (createdSec < nowSeconds - maxSkewSeconds) {
    return {
      valid: false,
      error: `Signature has expired or was created too long ago (created: ${createdSec}, current: ${nowSeconds}).`,
    };
  }

  // If expires provided, verify expiry
  if (!isNaN(expiresSec) && expiresSec < nowSeconds - 60) {
    return {
      valid: false,
      error: `Signature expired at timestamp ${expiresSec} (current: ${nowSeconds}).`,
    };
  }

  return { valid: true };
}

/**
 * Track messageId to protect against duplicate replay submissions
 * @param {string} messageId - ONDC message_id
 * @returns {boolean} True if first time seen, false if replay
 */
export function registerMessageId(messageId) {
  if (!messageId) return true;
  const now = Date.now();

  if (processedMessageIds.has(messageId)) {
    return false; // Replay detected!
  }

  processedMessageIds.set(messageId, now + MESSAGE_ID_TTL_MS);
  return true;
}

export default {
  validateTimestamps,
  registerMessageId,
};

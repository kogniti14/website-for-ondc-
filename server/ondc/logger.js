/**
 * ONDC Structured Logger
 * Provides rich observability and debugging logs without leaking secrets, private keys, or passwords.
 */

const SENSITIVE_KEYS = [
  'private_key',
  'privatekey',
  'secret',
  'password',
  'encryption_private_key',
  'authorization',
  'signature',
];

export function sanitize(obj, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 6) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, depth + 1));
  }

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    const lower = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lower.includes(s))) {
      clean[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      clean[key] = sanitize(value, depth + 1);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export const ondcLogger = {
  info(action, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      module: 'ONDC:RETeB2B',
      action,
      message,
      context: sanitize(metadata),
    };
    console.log(`[ONDC ${logEntry.action}] ${logEntry.message}`, JSON.stringify(logEntry.context));
  },

  warn(action, message, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      module: 'ONDC:RETeB2B',
      action,
      message,
      context: sanitize(metadata),
    };
    console.warn(`[ONDC WARN ${logEntry.action}] ${logEntry.message}`, JSON.stringify(logEntry.context));
  },

  error(action, message, error = null, metadata = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      module: 'ONDC:RETeB2B',
      action,
      message,
      errorMessage: error?.message || String(error),
      context: sanitize(metadata),
    };
    console.error(`[ONDC ERROR ${logEntry.action}] ${logEntry.message}`, JSON.stringify(logEntry));
  },
};

export default ondcLogger;

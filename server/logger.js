/**
 * Kogniti Minds - Centralized Production Structured Logger
 * Provides rich observability and debugging logs without leaking secrets,
 * passwords, OTP codes, auth tokens, or private keys.
 */

const SENSITIVE_KEYS = [
  'private_key',
  'privatekey',
  'secret',
  'keysecret',
  'password',
  'otp',
  'code',
  'authorization',
  'signature',
  'encryption_private_key',
  'token',
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

export const logger = {
  info(module, action, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      module,
      action,
      message,
      context: sanitize(metadata),
    };
    console.log(`[${entry.timestamp}] [INFO] [${module}:${action}] ${message}`, JSON.stringify(entry.context));
  },

  warn(module, action, message, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      module,
      action,
      message,
      context: sanitize(metadata),
    };
    console.warn(`[${entry.timestamp}] [WARN] [${module}:${action}] ${message}`, JSON.stringify(entry.context));
  },

  error(module, action, message, error = null, metadata = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      module,
      action,
      message,
      error: error ? (error.message || String(error)) : undefined,
      stack: error?.stack ? error.stack.split('\n').slice(0, 3).join(' ') : undefined,
      context: sanitize(metadata),
    };
    console.error(`[${entry.timestamp}] [ERROR] [${module}:${action}] ${message}`, JSON.stringify(entry));
  },
};

export default logger;

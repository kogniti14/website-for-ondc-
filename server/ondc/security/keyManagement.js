/**
 * ONDC Security - Key Management & Format Utilities
 * Kogniti Minds Private Limited
 * 
 * Handles Ed25519 (Signing) and X25519 (Encryption) keys:
 * - Base64 raw (32-byte seed/public key)
 * - Libsodium 64-byte keypair (32 seed + 32 public)
 * - PKCS#8 DER / PEM private keys
 * - SPKI DER / PEM public keys
 */

import crypto from 'crypto';

const PKCS8_ED25519_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');
const SPKI_ED25519_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

// In-memory cache for subscriber public keys to avoid redundant registry fetches
export const publicKeyCache = new Map();

/**
 * Convert base64 / raw private key into Node.js KeyObject
 * @param {string|crypto.KeyObject} rawKey 
 * @returns {crypto.KeyObject|null}
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
 * @param {string|crypto.KeyObject} rawKey 
 * @returns {crypto.KeyObject|null}
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
 * Generate a new Ed25519 keypair formatted for ONDC registration
 * @returns {{ publicKey: string, privateKey: string }} Base64 32-byte strings
 */
export function generateOndcKeypair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const pubRaw = publicKey.export({ type: 'spki', format: 'der' }).subarray(-32).toString('base64');
  const privRaw = privateKey.export({ type: 'pkcs8', format: 'der' }).subarray(-32).toString('base64');
  return {
    publicKey: pubRaw,
    privateKey: privRaw,
  };
}

export default {
  parsePrivateKey,
  parsePublicKey,
  generateOndcKeypair,
  publicKeyCache,
};

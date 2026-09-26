/**
 * ONDC Security Reference Module (Client/TypeScript)
 * Kogniti Minds Private Limited
 * 
 * Note: Actual Ed25519 signing and private keys are strictly executed
 * server-side in Node.js (server/ondc/security/) to protect secret credentials.
 */

export * from './types';

/**
 * Client-safe helper to parse Beckn Authorization headers for inspection
 */
export function parseAuthorizationHeaderClient(authHeader: string) {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const header = authHeader.trim();
  if (!header.startsWith('Signature ')) return null;

  const parts = header.substring('Signature '.length);
  const result: Record<string, string> = {};

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

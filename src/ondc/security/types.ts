/**
 * ONDC Cryptography & Security Suite (TypeScript)
 * Kogniti Minds Private Limited
 */

export interface OndcSigningParams {
  body: string | object;
  action?: string;
  subscriberId?: string;
  keyId?: string;
  privateKey?: string;
  ttlSeconds?: number;
  includeReqTarget?: boolean;
}

export interface OndcVerificationParams {
  header: string;
  rawBody: string;
  action?: string;
  publicKeyOverride?: string;
}

export interface OndcVerificationResult {
  valid: boolean;
  code?: string;
  error?: string;
  warning?: string;
  subscriberId?: string;
}

export interface OndcParsedAuthHeader {
  subscriberId: string;
  uniqueKeyId: string;
  algorithm: string;
  created?: string;
  expires?: string;
  headers?: string;
  signature?: string;
  [key: string]: any;
}

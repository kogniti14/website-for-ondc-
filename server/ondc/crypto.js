/**
 * ONDC Cryptographic Utilities (Legacy / Root Proxy)
 * Kogniti Minds Private Limited
 * 
 * Delegates directly to the modularized security suite in ./security/
 */

export * from './security/index.js';
import securitySuite from './security/index.js';
export default securitySuite;

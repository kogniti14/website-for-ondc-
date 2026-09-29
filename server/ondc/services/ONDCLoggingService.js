/**
 * ONDCLoggingService
 * Audit logging engine per RETeB2B 1.2.5 Specification (Section 9)
 * Kogniti Minds Private Limited
 */

import stateManager from '../stateManager.js';
import ondcLogger from '../logger.js';

export class ONDCLoggingService {
  /**
   * Record structured audit log entry
   */
  static logRequest(entry) {
    stateManager.addLog({
      timestamp: new Date().toISOString(),
      action: entry.action,
      transactionId: entry.transactionId || null,
      messageId: entry.messageId || null,
      httpMethod: entry.httpMethod || 'POST',
      status: entry.status || 200,
      durationMs: entry.durationMs || 0,
      signatureValid: entry.signatureValid !== undefined ? entry.signatureValid : true,
      schemaValid: entry.schemaValid !== undefined ? entry.schemaValid : true,
      errorCode: entry.errorCode || null,
      error: entry.error || null,
    });
  }

  /**
   * Retrieve audit logs
   */
  static getLogs(limit = 100) {
    return stateManager.getLogs(limit);
  }

  /**
   * Log informational message
   */
  static info(action, message, meta = {}) {
    ondcLogger.info(action, message, meta);
  }

  /**
   * Log warning message
   */
  static warn(action, message, meta = {}) {
    ondcLogger.warn(action, message, meta);
  }

  /**
   * Log error message
   */
  static error(action, message, error = null) {
    ondcLogger.error(action, message, error);
  }
}

export default ONDCLoggingService;

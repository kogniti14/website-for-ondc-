/**
 * ONDCErrorService
 * Produces standard Beckn / ONDC ACK and NACK responses
 * Kogniti Minds Private Limited
 */

export class ONDCErrorService {
  /**
   * Return standard Beckn ACK payload
   */
  static getAck() {
    return {
      message: {
        ack: {
          status: 'ACK',
        },
      },
    };
  }

  /**
   * Return standard Beckn NACK payload
   * @param {string} code - ONDC error code (e.g. '10000', '10001', '20001', '30000')
   * @param {string} message - Human-readable error description
   * @param {string} path - Optional property path
   * @param {'DOMAIN-ERROR' | 'CORE-ERROR' | 'POLICY-ERROR'} type
   */
  static getNack(code = '30000', message = 'Request rejected by ONDC provider', path = '', type = 'DOMAIN-ERROR') {
    return {
      message: {
        ack: {
          status: 'NACK',
        },
      },
      error: {
        type,
        code: String(code),
        path,
        message,
      },
    };
  }

  /**
   * Send HTTP ACK on Express response
   */
  static sendAck(res) {
    return res.status(200).json(this.getAck());
  }

  /**
   * Send HTTP NACK on Express response
   */
  static sendNack(res, code = '30000', message = 'Request rejected by ONDC provider', path = '', status = 400) {
    return res.status(status).json(this.getNack(code, message, path));
  }
}

export default ONDCErrorService;

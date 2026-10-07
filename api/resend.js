/**
 * Kogniti Minds - Production Server-Side Resend Email Dispatcher
 * Securely uses process.env.RESEND_API_KEY. Never accepts secrets from client headers.
 */
export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://kognitiminds.com',
    'https://www.kognitiminds.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'https://www.kognitiminds.com';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Safe internal diagnostic check: never prints or returns the secret
  if (req.method === 'GET') {
    const isConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
    return res.status(200).json({
      status: 'healthy',
      resendConfigured: isConfigured,
      timestamp: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const resendCheck = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  console.log(`[OTP_DIAGNOSTIC] RESEND_RUNTIME_CHECK=${resendCheck}`);
  console.log(`[OTP_DIAGNOSTIC] NODE_ENV=${process.env.NODE_ENV || 'undefined'}`);
  console.log(`[OTP_DIAGNOSTIC] cwd=${process.cwd()}`);
  console.log(`[OTP_DIAGNOSTIC] entry=server.js -> api/resend.js`);

  const apiKey = (
    process.env.RESEND_API_KEY ||
    process.env.VITE_RESEND_API_KEY ||
    process.env.REDIRECT_RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    ''
  ).trim();

  if (!apiKey) {
    console.warn('[Resend Service] Resend configuration: missing (process.env.RESEND_API_KEY is not set)');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: RESEND_API_KEY is not configured on the production server.',
      runtime: 'node',
      entry: 'server.js -> api/resend.js',
      cwd: process.cwd(),
      resend_runtime_check: resendCheck,
    });
  }

  let payload = {};
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    payload = req.body || {};
  }

  // Support recipient parameters: to, email, or array
  const rawTo = payload.to || payload.email;
  const rawList = Array.isArray(rawTo) ? rawTo : [rawTo].filter(Boolean);
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const toList = rawList
    .map(e => String(e).trim().replace(/[\r\n]/g, ''))
    .filter(e => emailRegex.test(e));

  if (toList.length === 0) {
    return res.status(400).json({ success: false, message: 'Valid recipient email address is required.' });
  }

  // Ensure 'from' address uses the verified domain (kognitiminds.com)
  const envFrom = (process.env.EMAIL_FROM || process.env.VITE_EMAIL_FROM || '').trim().replace(/^["']|["']$/g, '');
  const verifiedFrom = (envFrom && !envFrom.includes('resend.dev') && !envFrom.includes('example.com'))
    ? envFrom
    : 'Kogniti Minds Security <security@kognitiminds.com>';

  const rawSubject = (payload.subject || 'Kogniti Minds Verification Code').trim().replace(/[\r\n]/g, '');

  const emailPayload = {
    from: verifiedFrom,
    to: toList,
    subject: rawSubject,
    html: payload.html || (payload.otp ? `<p>Your verification code is: <strong>${payload.otp}</strong></p>` : '<p>Kogniti Minds notification</p>'),
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errMsg = data.message || data.error || `Resend HTTP ${response.status}`;
      console.error('[Resend Service] Resend dispatch returned error:', errMsg);
      return res.status(response.status).json({ success: false, message: errMsg });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      id: data.id,
    });
  } catch (err) {
    console.error('[Resend Service] Network dispatch exception:', err.message);
    return res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
}

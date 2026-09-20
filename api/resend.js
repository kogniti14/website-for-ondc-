export default async function handler(req, res) {
  // Handle CORS preflight if called from another domain
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const apiKey = (process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '').trim();

  if (!apiKey) {
    return res.status(500).json({
      message: 'Server configuration error: RESEND_API_KEY is not configured in server environment variables.',
    });
  }

  let payload = {};
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    payload = req.body || {};
  }

  // Ensure 'from' address uses the verified domain (kognitiminds.com)
  const envFrom = (process.env.VITE_EMAIL_FROM || process.env.EMAIL_FROM || '').trim().replace(/^["']|["']$/g, '');
  const verifiedFrom = (envFrom && !envFrom.includes('resend.dev') && !envFrom.includes('example.com'))
    ? envFrom
    : 'Kogniti Minds Security <security@kognitiminds.com>';

  if (!payload.from || payload.from.includes('resend.dev') || payload.from.includes('example.com')) {
    payload.from = verifiedFrom;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(response.status).json(data);
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
}

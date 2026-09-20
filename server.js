/**
 * KOGNITI MINDS - Main Application & ONDC Protocol Production Server
 * Serves the React SPA frontend, transactional email APIs, and ONDC eB2B seller-side protocol endpoints.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ondcRouter from './server/ondc/ondcRouter.js';
import ondcConfig from './server/ondc/config.js';
import resendHandler from './api/resend.js';
import { dataRouter } from './server/routes/dataRouter.js';
import { paymentRouter } from './server/routes/paymentRouter.js';
import { persistentStore } from './server/storage/persistentStore.js';
import logger from './server/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env file if available (zero-dependency Node.js env loader)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        const rawVal = trimmed.slice(idx + 1).trim();
        const cleanVal = rawVal.replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = cleanVal;
        }
      }
    }
  } catch (e) {
    console.warn('Notice: Could not auto-read .env file:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || ondcConfig.port || 3000;

// Enable CORS for all incoming requests (essential for ONDC Gateway and BAP calls)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Razorpay-Signature'],
  })
);

// Standard Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Global Body Parsers (with rawBody capture for cryptographic signature verification)
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 1. Production Health Check Endpoint
app.get('/api/health', (req, res) => {
  const hasResend = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
  const hasRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const collections = ['products', 'b2c_orders', 'b2b_orders', 'b2c_users', 'b2b_businesses'];
  const storeHealth = {};
  for (const c of collections) {
    try {
      const items = persistentStore.getAll(c);
      storeHealth[c] = Array.isArray(items) ? items.length : 'ok';
    } catch {
      storeHealth[c] = 'error';
    }
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'production',
    services: {
      server: 'running',
      storage: {
        status: 'active',
        counts: storeHealth,
      },
      email: {
        configured: hasResend,
        provider: 'Resend Transactional API',
      },
      payment: {
        configured: hasRazorpay,
        provider: 'Razorpay Official Gateway',
        mode: (process.env.RAZORPAY_KEY_ID || '').startsWith('rzp_test_') ? 'test' : 'live',
      },
      ondc: {
        status: 'active',
        domain: ondcConfig.domain,
        env: ondcConfig.env,
        subscriberId: ondcConfig.subscriberId,
      },
    },
  });
});

// 2. Mount Data Persistence Router
app.use('/api/data', dataRouter);

// 3. Mount Server-Side Payment Router (Razorpay)
app.use('/api/payment', paymentRouter);

// 4. Mount ONDC Protocol endpoints at root level
// Matches ONDC Workbench callback URL: https://kognitiminds.com/<action>
app.use('/', ondcRouter);

// Also mount /ondc alias
app.use('/ondc', ondcRouter);

// 5. Existing API Endpoints (e.g. Email OTP delivery via Resend)
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    await resendHandler(req, res);
  } catch (err) {
    logger.error('Server', 'auth_send_otp_error', 'API Resend Handler failed', err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
});

app.all('/api/resend', async (req, res) => {
  try {
    await resendHandler(req, res);
  } catch (err) {
    logger.error('Server', 'api_resend_error', 'API Resend Handler failed', err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
});

app.all('/api/resend/emails', async (req, res) => {
  try {
    await resendHandler(req, res);
  } catch (err) {
    logger.error('Server', 'api_resend_emails_error', 'API Resend Handler failed', err);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
  }
});

// Safe diagnostic endpoint for verifying email configuration without revealing secrets
app.get('/api/email-health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    resendConfigured: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()),
    timestamp: new Date().toISOString(),
  });
});

// 3. Serve Static Frontend Assets (Vite Production Build from /dist)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA Route Fallback: Any unknown route serves index.html for React Router
  app.get('*', (req, res, next) => {
    // Skip API, ONDC, and PHP paths
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/ondc') ||
      req.path.endsWith('.php') ||
      ['/search', '/select', '/init', '/confirm', '/status', '/cancel', '/update', '/rating', '/track', '/support'].includes(req.path)
    ) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist not built yet, output a helpful status page
  app.get('/', (req, res) => {
    res.json({
      name: 'Kogniti Minds Platform & ONDC B2B Gateway API',
      status: 'active',
      note: 'Run `npm run build` to compile the frontend SPA to dist/',
      ondc: ondcConfig.getSanitized(),
    });
  });
}

// Start Server
app.listen(PORT, () => {
  console.log('===========================================================');
  console.log(`  KOGNITI MINDS SERVER STARTED ON PORT ${PORT}`);
  console.log(`  Mode: ${process.env.NODE_ENV || 'production'}`);
  console.log(`  Resend configuration: ${process.env.RESEND_API_KEY ? 'configured' : 'missing'}`);
  console.log(`  ONDC Domain: ${ondcConfig.domain} (${ondcConfig.env})`);
  console.log(`  ONDC Callback Base: ${ondcConfig.subscriberUri}/<action>`);
  console.log(`  Health Check: http://localhost:${PORT}/ondc/health`);
  console.log('===========================================================');
});

export default app;

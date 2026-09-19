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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || ondcConfig.port || 3000;

// Enable CORS for all incoming requests (essential for ONDC Gateway and BAP calls)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 1. Mount ONDC Protocol endpoints at root level
// Matches ONDC Workbench callback URL: https://kognitiminds.com/<action>
app.use('/', ondcRouter);

// Also mount /ondc alias
app.use('/ondc', ondcRouter);

// 2. Existing API Endpoints (e.g. Email OTP delivery via Resend)
app.all('/api/resend', async (req, res) => {
  try {
    await resendHandler(req, res);
  } catch (err) {
    console.error('[API Resend Error]', err);
    res.status(500).json({ message: err.message || 'Internal Server Error' });
  }
});

// 3. Serve Static Frontend Assets (Vite Production Build from /dist)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback: any GET request not handled above returns index.html
  app.get('*', (req, res) => {
    // If request has file extension (e.g. .png, .js) that was not found, return 404
    if (path.extname(req.path)) {
      return res.status(404).end();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // If dist not yet built (e.g. initial dev bootstrap)
  app.get('/', (req, res) => {
    res.json({
      service: 'Kogniti Minds Production Server & ONDC Engine',
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
  console.log(`  ONDC Domain: ${ondcConfig.domain} (${ondcConfig.env})`);
  console.log(`  ONDC Callback Base: ${ondcConfig.subscriberUri}/<action>`);
  console.log(`  Health Check: http://localhost:${PORT}/ondc/health`);
  console.log('===========================================================');
});

export default app;

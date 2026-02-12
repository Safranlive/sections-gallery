// Sections Gallery Backend Server - Complete Implementation
// Express.js server with Shopify OAuth, Billing, and API

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Environment validation
const requiredEnv = ['SHOPIFY_API_KEY', 'SHOPIFY_API_SECRET', 'DATABASE_URL', 'APP_URL'];
requiredEnv.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET;
const SCOPES = 'read_themes,write_themes,read_products,write_script_tags';
const APP_URL = process.env.APP_URL;

// =====================================================================================
// UTILITY FUNCTIONS
// =================================================================================

// Generate nonce for OAuth
function generateNonce() {
  return crypto.randomBytes(16).toString('hex');
}

// Verify Shopify HMAC
function verifyShopifyHmac(query, hmac) {
  const message = Object.keys(query)
    .filter(key => key !== 'hmac' && key !== 'signature')
    .map(key => `${key}=${query[key]}`)
    .sort()
    .join('&');
  
  const generatedHash = crypto
    .createHmac('sha256', SHOPIFY_API_SECRET)
    .update(message)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(generatedHash),
    Buffer.from(hmac)
  );
}

// Encrypt access token
function encryptToken(token) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(SHOPIFY_API_SECRET, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Decrypt access token
function decryptToken(encryptedToken) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(SHOPIFY_API_SECRET, 'salt', 32);
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Shopify API request helper
async function shopifyRequest(shop, endpoint, method = 'GET', body = null) {
  const shopRecord = await prisma.shop.findUnique({ where: { shopifyDomain: shop } });
  if (!shopRecord) throw new Error('Shop not found');
  
  const accessToken = decryptToken(shopRecord.accessToken);
  
  const response = await fetch(`https://${shop}/admin/api/2024-01/${endpoint}.json`, {
    method,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shopify API error: ${error}`);
  }
  
  return await response.json();
}

// =====================================================================================
// OAUTH ROUTES
// ==================================================================================

// Initiate OAuth
app.get('/auth', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).send('Missing shop parameter');
  }
  
  const nonce = generateNonce();
  req.session.nonce = nonce;
  const redirectUri = `${APP_URL}/auth/callback`;
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${redirectUri}&state=${nonce}`;
  
  res.redirect(authUrl);
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  const { code, hmac, shop, state } = req.query;
  
  // Verify state to prevent CSRF
  if (state !== req.session.nonce) {
    return res.status(403).send('Request origin cannot be verified');
  }
  
  // Verify HMAC
  if (!verifyShopifyHmac(req.query, hmac)) {
    return res.status(400).send('HMAC validation failed');
  }
  
  // Exchange temporary code for permanent access token
  try {
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code,
      }),
    });
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Encrypt and store token
    const encryptedToken = encryptToken(accessToken);
    
    // Store in database
    await prisma.shop.upsert({
      where: { shopifyDomain: shop },
      update: {
        accessToken: encryptedToken,
        isActive: true,
        lastLoginAt: new Date(),
      },
      create: {
        shopifyDomain: shop,
        accessToken: encryptedToken,
        isActive: true,
        installedAt: new Date(),
      },
    });
    
    // Store shop in session
    req.session.shop = shop;
    
    // Redirect to app
    res.redirect(`/?shop=${shop}');
  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).send('Installation failed');
  }
});

// =====================================================================================
// API ROUTES
// =================================================================================

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Sections Gallery API is running' });
});

// Import routes
const authRoutes = require('./routes/auth');
const sectionsRoutes = require('./routes/sections');
const shopifyRoutes = require('./routes/shopify');
const subscriptionRoutes = require('./routes/subscriptions');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const webhookRoutes = require('./routes/webhooks');

app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhooks', webhookRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`✅ Sections Gallery Backend running on port ${PORT}`);
  
  // Test database connection
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❏ Database connection failed:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;

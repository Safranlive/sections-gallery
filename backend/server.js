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

// ==================================================================================
// UTILITY FUNCTIONS
// ===============================================================================

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
  const url = `https://${shop}/admin/api/2024-01/${endpoint}.json`;
  
  const options = {
    method,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }
  
  return await response.json();
}

// ======================================================================================
// SHOPIFY OAUTH FLOW
// ======================================================================================

// OAuth initiation
app.get('/auth/shopify', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Shop parameter required' });
  }
  
  const nonce = generateNonce();
  const redirectUri = `${APP_URL}/auth/callback`;
  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${SHOPIFY_API_KEY}&scope=${SCOPES}&redirect_uri=${redirectUri}&state=${nonce}`;
  
  // Store nonce in session
  req.session.nonce = nonce;
  console.log(`Initiating OAuth for shop: ${shop}`);
  
  res.redirect(authUrl);
});

// OAuth callback
app.get('/auth/callback', async (req, res) => {
  try {
    const { code, hmac, shop, state } = req.query;
    
    // Verify state/nonce
    if (state !== req.session.nonce) {
      return res.status(403).json({ error: 'Invalid state parameter' });
    }
    
    // Verify HMAC
    if (!verifyShopifyHmac(req.query, hmac)) {
      return res.status(403).json({ error: 'Invalid HMAC' });
    }
    
    // Exchange code for access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenRequest = await fetch(tokenUrl, {
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
    
    const tokenData = await tokenRequest.json();
    const accessToken = tokenData.access_token;
    
    // Encrypt access token before storing
    const encryptedToken = encryptToken(accessToken);
    
    // Store or update shop in database
    const existingShop = await prisma.shop.findUnique({
      where: { shopifyDomain: shop },
    });
    
    if (existingShop) {
      await prisma.shop.update({
        where: { shopifyDomain: shop },
        data: {
          accessToken: encryptedToken,
          isActive: true,
        },
      });
    } else {
      await prisma.shop.create({
        data: {
          shopifyDomain: shop,
          accessToken: encryptedToken,
          isActive: true,
        },
      });
    }
    
    console.log(`OAuth complete for shop: ${shop}`);
    res.redirect(`${APP_URL}/dashboard?shop=${shop}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// ======================================================================================
// API ROUTES
// =====================================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Mount router
const authRoutes = require('./routes/auth');
const sectionRoutes = require('./routes/sections');
const shopifyRoutes = require('./routes/shopify');
const subscriptionRoutes = require('./routes/subscriptions');
const webhookRoutes = require('./routes/webhooks');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/shopify', shopifyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sections Gallery backend running on port ${PORT}`);
});

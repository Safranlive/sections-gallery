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

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

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
  const url = `https://${shop}/admin/api/2024-01/${endpoint}`;
  
  const options = {
    method,
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  return response.json();
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Step 1: OAuth Installation - Redirect to Shopify
app.get('/api/auth', (req, res) => {
  const { shop } = req.query;
  
  if (!shop) {
    return res.status(400).json({ error: 'Missing shop parameter' });
  }
  
  // Validate shop domain
  if (!shop.match(/^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/)) {
    return res.status(400).json({ error: 'Invalid shop domain' });
  }
  
  const nonce = generateNonce();
  const redirectUri = `${APP_URL}/api/auth/callback`;
  
  const installUrl = `https://${shop}/admin/oauth/authorize?` +
    `client_id=${SHOPIFY_API_KEY}&` +
    `scope=${SCOPES}&` +
    `redirect_uri=${redirectUri}&` +
    `state=${nonce}`;
  
  // Store nonce in session/cookie for verification
  res.cookie('shopify_oauth_nonce', nonce, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600000 // 10 minutes
  });
  
  res.redirect(installUrl);
});

// Step 2: OAuth Callback - Exchange code for access token
app.get('/api/auth/callback', async (req, res) => {
  const { code, hmac, shop, state } = req.query;
  
  // Verify HMAC
  if (!verifyShopifyHmac(req.query, hmac)) {
    return res.status(403).json({ error: 'HMAC validation failed' });
  }
  
  // Verify nonce
  const nonce = req.cookies.shopify_oauth_nonce;
  if (state !== nonce) {
    return res.status(403).json({ error: 'State validation failed' });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: SHOPIFY_API_KEY,
        client_secret: SHOPIFY_API_SECRET,
        code
      })
    });
    
    const { access_token, scope } = await tokenResponse.json();
    
    if (!access_token) {
      throw new Error('Failed to obtain access token');
    }
    
    // Get shop details
    const shopResponse = await fetch(`https://${shop}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token }
    });
    
    const { shop: shopData } = await shopResponse.json();
    
    // Store shop in database
    const shopRecord = await prisma.shop.upsert({
      where: { shopifyDomain: shop },
      update: {
        shopName: shopData.name,
        email: shopData.email,
        accessToken: encryptToken(access_token),
        scope,
        isActive: true,
        uninstalledAt: null
      },
      create: {
        shopifyDomain: shop,
        shopName: shopData.name,
        email: shopData.email,
        accessToken: encryptToken(access_token),
        scope,
        freeCredits: 0
      }
    });
    
    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Set session cookie
    res.cookie('shopify_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    res.cookie('shop', shop, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    // Redirect to app
    res.redirect(`${process.env.FRONTEND_URL}?shop=${shop}`);
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed', details: error.message });
  }
});

// Verify session middleware
async function verifySession(req, res, next) {
  const shop = req.cookies.shop || req.query.shop || req.headers['x-shop'];
  
  if (!shop) {
    return res.status(401).json({ error: 'No shop provided' });
  }
  
  const shopRecord = await prisma.shop.findUnique({ 
    where: { shopifyDomain: shop } 
  });
  
  if (!shopRecord || !shopRecord.isActive) {
    return res.status(401).json({ error: 'Shop not found or inactive' });
  }
  
  req.shop = shopRecord;
  next();
}

// ============================================================================
// SECTIONS API
// ============================================================================

// Get all available sections
app.get('/api/sections', verifySession, async (req, res) => {
  try {
    const { category, tier, search } = req.query;
    
    const where = { isActive: true };
    
    if (category) where.category = category;
    if (tier) where.tier = tier;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const sections = await prisma.section.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { downloadCount: 'desc' }
      ]
    });
    
    // Check which sections this shop has purchased
    const purchases = await prisma.purchase.findMany({
      where: { 
        shopId: req.shop.id,
        status: 'active'
      },
      select: { sectionId: true }
    });
    
    const purchasedIds = new Set(purchases.map(p => p.sectionId));
    
    const sectionsWithStatus = sections.map(section => ({
      ...section,
      isPurchased: purchasedIds.has(section.id),
      price: section.price.toString()
    }));
    
    res.json({ sections: sectionsWithStatus, freeCredits: req.shop.freeCredits });
    
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get single section details
app.get('/api/sections/:id', verifySession, async (req, res) => {
  try {
    const section = await prisma.section.findUnique({
      where: { id: req.params.id }
    });
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    const purchase = await prisma.purchase.findUnique({
      where: {
        shopId_sectionId: {
          shopId: req.shop.id,
          sectionId: section.id
        }
      }
    });
    
    res.json({
      ...section,
      price: section.price.toString(),
      isPurchased: !!purchase,
      purchaseDetails: purchase
    });
    
  } catch (error) {
    console.error('Get section error:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// ============================================================================
// PURCHASE & BILLING API
// ============================================================================

// Initiate section purchase
app.post('/api/purchase/:sectionId', verifySession, async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    // Get section
    const section = await prisma.section.findUnique({
      where: { id: sectionId }
    });
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    // Check if already purchased
    const existingPurchase = await prisma.purchase.findUnique({
      where: {
        shopId_sectionId: {
          shopId: req.shop.id,
          sectionId
        }
      }
    });
    
    if (existingPurchase) {
      return res.status(400).json({ error: 'Section already purchased' });
    }
    
    // Check if shop has free credits
    if (req.shop.freeCredits > 0) {
      // Grant free section
      const purchase = await prisma.purchase.create({
        data: {
          shopId: req.shop.id,
          sectionId,
          amount: 0,
          currency: 'USD',
          isFree: true,
          status: 'active'
        }
      });
      
      // Decrement free credits
      await prisma.shop.update({
        where: { id: req.shop.id },
        data: { freeCredits: { decrement: 1 } }
      });
      
      return res.json({ 
        success: true, 
        purchase,
        usedFreeCredit: true 
      });
    }
    
    // Create Shopify billing charge
    const charge = {
      application_charge: {
        name: `${section.name} - Sections Gallery`,
        price: section.price.toString(),
        return_url: `${APP_URL}/api/purchase/confirm?shop=${req.shop.shopifyDomain}&section_id=${sectionId}`,
        test: process.env.NODE_ENV !== 'production'
      }
    };
    
    const result = await shopifyRequest(
      req.shop.shopifyDomain,
      'application_charges.json',
      'POST',
      charge
    );
    
    if (result.application_charge) {
      // Store pending purchase
      await prisma.purchase.create({
        data: {
          shopId: req.shop.id,
          sectionId,
          chargeId: result.application_charge.id.toString(),
          amount: section.price,
          currency: 'USD',
          status: 'pending'
        }
      });
      
      res.json({ 
        confirmationUrl: result.application_charge.confirmation_url 
      });
    } else {
      throw new Error('Failed to create charge');
    }
    
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Purchase failed', details: error.message });
  }
});

// Confirm purchase after Shopify billing
app.get('/api/purchase/confirm', async (req, res) => {
  try {
    const { shop, charge_id, section_id } = req.query;
    
    // Verify charge
    const result = await shopifyRequest(
      shop,
      `application_charges/${charge_id}.json`
    );
    
    if (result.application_charge.status === 'accepted') {
      // Activate charge (collect payment)
      await shopifyRequest(
        shop,
        `application_charges/${charge_id}/activate.json`,
        'POST'
      );
      
      // Update purchase status
      await prisma.purchase.updateMany({
        where: {
          chargeId: charge_id.toString(),
          status: 'pending'
        },
        data: {
          status: 'active'
        }
      });
      
      // Increment download count
      await prisma.section.update({
        where: { id: section_id },
        data: { downloadCount: { increment: 1 } }
      });
      
      res.redirect(`${process.env.FRONTEND_URL}/sections/${section_id}?purchased=true`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/sections/${section_id}?purchase=declined`);
    }
    
  } catch (error) {
    console.error('Purchase confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm purchase' });
  }
});

// Get user's purchased sections
app.get('/api/my-sections', verifySession, async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      where: {
        shopId: req.shop.id,
        status: 'active'
      },
      include: {
        section: true
      },
      orderBy: {
        purchasedAt: 'desc'
      }
    });
    
    res.json({ purchases });
    
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Download section code
app.get('/api/sections/:id/download', verifySession, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify purchase
    const purchase = await prisma.purchase.findUnique({
      where: {
        shopId_sectionId: {
          shopId: req.shop.id,
          sectionId: id
        }
      },
      include: { section: true }
    });
    
    if (!purchase || purchase.status !== 'active') {
      return res.status(403).json({ error: 'Section not purchased' });
    }
    
    // Track analytics
    await prisma.analyticsEvent.create({
      data: {
        shopId: req.shop.id,
        sectionId: id,
        eventType: 'download',
        metadata: { timestamp: new Date() }
      }
    });
    
    res.json({
      section: purchase.section,
      liquidCode: purchase.section.liquidCode
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

// Install section to theme
app.post('/api/sections/:id/install', verifySession, async (req, res) => {
  try {
    const { id } = req.params;
    const { themeId } = req.body;
    
    if (!themeId) {
      return res.status(400).json({ error: 'Theme ID required' });
    }
    
    // Verify purchase
    const purchase = await prisma.purchase.findUnique({
      where: {
        shopId_sectionId: {
          shopId: req.shop.id,
          sectionId: id
        }
      },
      include: { section: true }
    });
    
    if (!purchase || purchase.status !== 'active') {
      return res.status(403).json({ error: 'Section not purchased' });
    }
    
    const section = purchase.section;
    
    // Get theme details
    const themeResponse = await shopifyRequest(
      req.shop.shopifyDomain,
      `themes/${themeId}.json`
    );
    
    // Upload section file to theme
    const filename = `sections/${section.slug}.liquid`;
    const assetResponse = await shopifyRequest(
      req.shop.shopifyDomain,
      `themes/${themeId}/assets.json`,
      'PUT',
      {
        asset: {
          key: filename,
          value: section.liquidCode
        }
      }
    );
    
    if (assetResponse.asset) {
      // Record installation
      await prisma.themeInstall.create({
        data: {
          shopId: req.shop.id,
          sectionId: id,
          themeId: themeId.toString(),
          themeName: themeResponse.theme.name
        }
      });
      
      // Track analytics
      await prisma.analyticsEvent.create({
        data: {
          shopId: req.shop.id,
          sectionId: id,
          eventType: 'install',
          metadata: { themeId, themeName: themeResponse.theme.name }
        }
      });
      
      res.json({ 
        success: true,
        message: 'Section installed successfully',
        filename
      });
    } else {
      throw new Error('Failed to upload section to theme');
    }
    
  } catch (error) {
    console.error('Install error:', error);
    res.status(500).json({ error: 'Installation failed', details: error.message });
  }
});

// Get shop's themes
app.get('/api/themes', verifySession, async (req, res) => {
  try {
    const result = await shopifyRequest(req.shop.shopifyDomain, 'themes.json');
    res.json({ themes: result.themes });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// ============================================================================
// ADMIN API
// ============================================================================

// Admin authentication middleware
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No admin token provided' });
  }
  
  const token = authHeader.substring(7);
  
  // Simple token verification (implement JWT in production)
  if (token === process.env.ADMIN_SECRET_KEY) {
    next();
  } else {
    res.status(403).json({ error: 'Invalid admin token' });
  }
}

// Grant free sections to shop
app.post('/api/admin/shops/:shopId/grant-credits', verifyAdmin, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { credits, reason } = req.body;
    
    if (!credits || credits < 1) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }
    
    const shop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        freeCredits: { increment: credits }
      }
    });
    
    res.json({ 
      success: true,
      shop,
      message: `Granted ${credits} free sections`
    });
    
  } catch (error) {
    console.error('Grant credits error:', error);
    res.status(500).json({ error: 'Failed to grant credits' });
  }
});

// Get all shops
app.get('/api/admin/shops', verifyAdmin, async (req, res) => {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        _count: {
          select: { purchases: true }
        }
      },
      orderBy: { installedAt: 'desc' }
    });
    
    res.json({ shops });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ error: 'Failed to fetch shops' });
  }
});

// Get all purchases
app.get('/api/admin/purchases', verifyAdmin, async (req, res) => {
  try {
    const purchases = await prisma.purchase.findMany({
      include: {
        shop: true,
        section: true
      },
      orderBy: { purchasedAt: 'desc' }
    });
    
    res.json({ purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Create new section
app.post('/api/admin/sections', verifyAdmin, async (req, res) => {
  try {
    const sectionData = req.body;
    
    const section = await prisma.section.create({
      data: {
        slug: sectionData.slug,
        name: sectionData.name,
        description: sectionData.description,
        category: sectionData.category,
        price: sectionData.price,
        tier: sectionData.tier,
        liquidCode: sectionData.liquidCode,
        thumbnail: sectionData.thumbnail,
        features: sectionData.features || [],
        tags: sectionData.tags || [],
        version: sectionData.version || '1.0.0'
      }
    });
    
    res.json({ section });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Update section
app.put('/api/admin/sections/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const section = await prisma.section.update({
      where: { id },
      data: updates
    });
    
    res.json({ section });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// Get analytics
app.get('/api/admin/analytics', verifyAdmin, async (req, res) => {
  try {
    const [
      totalShops,
      activeShops,
      totalPurchases,
      totalRevenue,
      recentEvents
    ] = await Promise.all([
      prisma.shop.count(),
      prisma.shop.count({ where: { isActive: true } }),
      prisma.purchase.count({ where: { status: 'active' } }),
      prisma.purchase.aggregate({
        where: { status: 'active', isFree: false },
        _sum: { amount: true }
      }),
      prisma.analyticsEvent.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          shop: { select: { shopifyDomain: true } },
          section: { select: { name: true } }
        }
      })
    ]);
    
    res.json({
      totalShops,
      activeShops,
      totalPurchases,
      totalRevenue: totalRevenue._sum.amount?.toString() || '0',
      recentEvents
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ============================================================================
// WEBHOOKS
// ============================================================================

// Handle app uninstall
app.post('/api/webhooks/app/uninstalled', async (req, res) => {
  try {
    const shop = req.get('X-Shopify-Shop-Domain');
    
    await prisma.shop.update({
      where: { shopifyDomain: shop },
      data: {
        isActive: false,
        uninstalledAt: new Date()
      }
    });
    
    res.status(200).send();
  } catch (error) {
    console.error('Uninstall webhook error:', error);
    res.status(500).send();
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Sections Gallery Backend running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 App URL: ${APP_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

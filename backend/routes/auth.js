const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Shopify OAuth callback handler
 * Handles the OAuth flow after user authorizes the app
 */
router.get('/callback', async (req, res) => {
  try {
    const { shop, code, state } = req.query;

    if (!shop || !code) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify state to prevent CSRF
    if (req.session.state !== state) {
      return res.status(403).json({ error: 'Invalid state parameter' });
    }

    // Exchange code for access token
    const accessTokenResponse = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const { session } = accessTokenResponse;

    // Store or update store in database
    await prisma.store.upsert({
      where: { shopifyDomain: session.shop },
      update: {
        accessToken: session.accessToken,
        isActive: true,
        lastLoginAt: new Date(),
      },
      create: {
        shopifyDomain: session.shop,
        accessToken: session.accessToken,
        email: session.email || '',
        isActive: true,
        lastLoginAt: new Date(),
      },
    });

    // Set session
    req.session.shop = session.shop;
    req.session.accessToken = session.accessToken;

    // Redirect to app home
    res.redirect(`/?shop=${session.shop}`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

/**
 * Get current authenticated user/store info
 */
router.get('/me', async (req, res) => {
  try {
    const { shop } = req.session;

    if (!shop) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const store = await prisma.store.findUnique({
      where: { shopifyDomain: shop },
      select: {
        id: true,
        shopifyDomain: true,
        email: true,
        planType: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

/**
 * Logout endpoint
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyShopifySession } = require('../middleware/auth');
const shopify = require('../config/shopify');

const prisma = new PrismaClient();

// Get store details
router.get('/store', verifyShopifySession, async (req, res) => {
  try {
    res.json({
      store: {
        id: req.store.id,
        shop: req.store.shopifyDomain,
        name: req.store.storeName,
        email: req.store.email,
        country: req.store.country,
        currency: req.store.currency,
        plan: req.store.plan,
        installedAt: req.store.installedAt,
      },
    });
  } catch (error) {
    console.error('Get store error:', error);
    res.status(500).json({ error: 'Failed to fetch store details' });
  }
});

// Get themes
router.get('/themes', verifyShopifySession, async (req, res) => {
  try {
    const session = {
      shop: req.store.shopifyDomain,
      accessToken: req.store.accessToken,
    };

    const client = new shopify.clients.Rest({ session });
    const response = await client.get({
      path: 'themes',
    });

    res.json({ themes: response.body.themes });
  } catch (error) {
    console.error('Get themes error:', error);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

// Get theme files
router.get('/themes/:themeId/assets', verifyShopifySession, async (req, res) => {
  try {
    const { themeId } = req.params;
    const { key } = req.query;

    const session = {
      shop: req.store.shopifyDomain,
      accessToken: req.store.accessToken,
    };

    const client = new shopify.clients.Rest({ session });
    const response = await client.get({
      path: `themes/${themeId}/assets`,
      query: key ? { 'asset[key]': key } : {},
    });

    res.json({ asset: response.body.asset });
  } catch (error) {
    console.error('Get theme assets error:', error);
    res.status(500).json({ error: 'Failed to fetch theme assets' });
  }
});

// Install section to theme
router.post('/themes/:themeId/install-section', verifyShopifySession, async (req, res) => {
  try {
    const { themeId } = req.params;
    const { sectionSlug } = req.body;

    // Get section from database
    const section = await prisma.section.findUnique({
      where: { slug: sectionSlug },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Verify section is installed for this store
    const installed = await prisma.installedSection.findFirst({
      where: {
        storeId: req.store.id,
        sectionId: section.id,
      },
    });

    if (!installed) {
      return res.status(403).json({ error: 'Section not installed' });
    }

    // Upload section to Shopify theme
    const session = {
      shop: req.store.shopifyDomain,
      accessToken: req.store.accessToken,
    };

    const client = new shopify.clients.Rest({ session });
    await client.put({
      path: `themes/${themeId}/assets`,
      data: {
        asset: {
          key: `sections/${section.slug}.lisuid`,
          value: section.code,
        },
      },
    });

    // Update last used timestamp
    await prisma.installedSection.update({
      where: { id: installed.id },
      data: { 
        lastUsedAt: new Date(), 
        usageCount: { increment: 1 } 
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Install section to theme error:', error);
    res.status(500).json({ error: 'Failed to install section to theme' });
  }
});

module.exports = router;

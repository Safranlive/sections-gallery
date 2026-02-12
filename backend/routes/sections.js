const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyShopifySession, requireTier } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all available sections
router.get('/', verifyShopifySession, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        storeId: req.store.id,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      return res.status(403).json({ error: 'No active subscription' });
    }

    // Get sections available for user's tier
    const sections = await prisma.section.findMany({
      where: {
        isActive: true,
        OR: [
          { availableInFree: subscription.tier === 'FREE' },
          { availableInPro: ['PRO', 'PREMIUM'].includes(subscription.tier) },
          { availableInPremium: subscription.tier === 'PREMIUM' },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        previewImageUrl: true,
        demoUrl: true,
        version: true,
        downloadCount: true,
        availableInFree: true,
        availableInPro: true,
        availableInPremium: true,
      },
    });

    // Check which sections are already installed
    const installedSections = await prisma.installedSection.findMany({
      where: { storeId: req.store.id },
      select: { sectionId: true },
    });

    const installedIds = new Set(installedSections.map(s => s.sectionId));

    const sectionsWithStatus = sections.map(section => ({
      ...section,
      isInstalled: installedIds.has(section.id),
    }));

    res.json({
      sections: sectionsWithStatus,
      subscription: {
        tier: subscription.tier,
        sectionsLimit: subscription.sectionsLimit,
        sectionsInstalled: installedSections.length,
      },
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Get single section details
router.get('/:slug', verifyShopifySession, async (req, res) => {
  try {
    const { slug } = req.params;

    const section = await prisma.section.findUnique({
      where: { slug },
    });

    if (!section || !section.isActive) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Check if installed
    const installed = await prisma.installedSection.findFirst({
      where: {
        storeId: req.store.id,
        sectionId: section.id,
      },
    });

    res.json({
      ...section,
      isInstalled: !!installed,
      installedAt: installed?.installedAt,
    });
  } catch (error) {
    console.error('Get section error:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Install a section
router.post('/:slug/install', verifyShopifySession, async (req, res) => {
  try {
    const { slug } = req.params;

    const section = await prisma.section.findUnique({
      where: { slug },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    // Check if already installed
    const existing = await prisma.installedSection.findFirst({
      where: {
        storeId: req.store.id,
        sectionId: section.id,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Section already installed' });
    }

    // Install section
    const installed = await prisma.installedSection.create({
      data: {
        storeId: req.store.id,
        sectionId: section.id,
        installedAt: new Date(),
      },
    });

    // Update download count
    await prisma.section.update({
      where: { id: section.id },
      data: { downloadCount: { increment: 1 } },
    });

    res.json({ success: true, installed });
  } catch (error) {
    console.error('Install section error:', error);
    res.status(500).json({ error: 'Failed to install section' });
  }
});

// Uninstall a section
router.delete('/:slug/uninstall', verifyShopifySession, async (req, res) => {
  try {
    const { slug } = req.params;

    const section = await prisma.section.findUnique({
      where: { slug },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await prisma.installedSection.deleteMany({
      where: {
        storeId: req.store.id,
        sectionId: section.id,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Uninstall section error:', error);
    res.status(500).json({ error: 'Failed to uninstall section' });
  }
});

module.exports = router;
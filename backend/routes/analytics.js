const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { verifyShopifySession } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get analytics overview
router.get('/overview', verifyShopifySession, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {
      storeId: req.store.id,
    };

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) whereClause.timestamp.gte = new Date(startDate);
      if (endDate) whereClause.timestamp.lte = new Date(endDate);
    }

    // Get event counts
    const events = await prisma.analytics.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: true,
    });

    // Get installed sections count
    const installedCount = await prisma.installedSection.count({
      where: { storeId: req.store.id },
    });

    // Get most used sections
    const topSections = await prisma.installedSection.findMany({
      where: { storeId: req.store.id },
      orderBy: { usageCount: 'desc' },
      take: 5,
      include: {
        section: {
          select: {
            name: true,
            slug: true,
            category: true,
          },
        },
      },
    });

    res.json({
      events: events.reduce((acc, event) => {
        acc[event.eventType] = event._count;
        return acc;
      }, {}),
      installedSections: installedCount,
      topSections: topSections.map(s => ({
        section: s.section,
        usageCount: s.usageCount,
        lastUsed: s.lastUsedAt,
      })),
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get event timeline
router.get('/timeline', verifyShopifySession, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const events = await prisma.analytics.findMany({
      where: {
        storeId: req.store.id,
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'asc' },
      select: {
        eventType: true,
        timestamp: true,
        sectionName: true,
      },
    });

    // Group by date
    const timeline = events.reduce((acc, event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][event.eventType]) {
        acc[date][event.eventType] = 0;
      }
      acc[date][event.eventType]++;
      return acc;
    }, {});

    res.json({ timeline });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch timeline' });
  }
});

// Track custom event
router.post('/track', verifyShopifySession, async (req, res) => {
  try {
    const { eventType, sectionName, metadata } = req.body;

    await prisma.analytics.create({
      data: {
        storeId: req.store.id,
        eventType,
        sectionName,
        metadata: metadata || {},
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

module.exports = router;

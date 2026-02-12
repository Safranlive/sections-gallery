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

module.exports = router;
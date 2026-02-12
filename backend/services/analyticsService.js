const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnalyticsService {
  /**
   * Track section installation
   */
  async trackInstallation(storeId, sectionId) {
    try {
      await prisma.analytics.create({
        data: {
          storeId,
          sectionId,
          eventType: 'installation',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Update section installation count
      await prisma.section.update({
        where: { id: sectionId },
        data: {
          installCount: {
            increment: 1,
          },
        },
      });
    } catch (error) {
      console.error('Error tracking installation:', error);
    }
  }

  /**
   * Track section uninstallation
   */
  async trackUninstallation(storeId, sectionId) {
    try {
      await prisma.analytics.create({
        data: {
          storeId,
          sectionId,
          eventType: 'uninstallation',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
      });

      // Update section installation count
      await prisma.section.update({
        where: { id: sectionId },
        data: {
          installCount: {
            decrement: 1,
          },
        },
      });
    } catch (error) {
      console.error('Error tracking uninstallation:', error);
    }
  }

  /**
   * Track section activation (when enabled on a page)
   */
  async trackActivation(storeId, sectionId, pageUrl) {
    try {
      await prisma.analytics.create({
        data: {
          storeId,
          sectionId,
          eventType: 'activation',
          metadata: {
            pageUrl,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Error tracking activation:', error);
    }
  }

  /**
   * Track page view for a section
   */
  async trackPageView(storeId, sectionId, pageUrl) {
    try {
      await prisma.analytics.create({
        data: {
          storeId,
          sectionId,
          eventType: 'page_view',
          metadata: {
            pageUrl,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  /**
   * Get analytics summary for a store
   */
  async getStoreSummary(storeId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Total installations
      const totalInstallations = await prisma.analytics.count({
        where: {
          storeId,
          eventType: 'installation',
          createdAt: {
            gte: startDate,
          },
        },
      });

      // Active sections
      const activeSections = await prisma.license.count({
        where: {
          storeId,
          status: 'active',
        },
      });

      // Most used sections
      const topSections = await prisma.analytics.groupBy({
        by: ['sectionId'],
        where: {
          storeId,
          eventType: 'page_view',
          createdAt: {
            gte: startDate,
          },
        },
        _count: true,
        orderBy: {
          _count: {
            sectionId: 'desc',
          },
        },
        take: 5,
      });

      return {
        totalInstallations,
        activeSections,
        topSections,
        period: days,
      };
    } catch (error) {
      console.error('Error getting store summary:', error);
      throw error;
    }
  }

  /**
   * Get analytics for a specific section
   */
  async getSectionAnalytics(sectionId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const installations = await prisma.analytics.count({
        where: {
          sectionId,
          eventType: 'installation',
          createdAt: {
            gte: startDate,
          },
        },
      });

      const pageViews = await prisma.analytics.count({
        where: {
          sectionId,
          eventType: 'page_view',
          createdAt: {
            gte: startDate,
          },
        },
      });

      const activeInstalls = await prisma.installedSection.count({
        where: {
          sectionId,
        },
      });

      return {
        installations,
        pageViews,
        activeInstalls,
        period: days,
      };
    } catch (error) {
      console.error('Error getting section analytics:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();
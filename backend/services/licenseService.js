const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

class LicenseService {
  /**
   * Generate a unique license key for a section installation
   */
  generateLicenseKey(storeId, sectionId) {
    const timestamp = Date.now();
    const data = `${storeId}-${sectionId}-${timestamp}`;
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    
    // Format as: SF-XXXX-XXXX-XXXX-XXXX
    const key = `SF-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}-${hash.substring(12, 16)}`.toUpperCase();
    return key;
  }

  /**
   * Create a new license for a section installation
   */
  async createLicense(storeId, sectionId, subscriptionTier) {
    try {
      const licenseKey = this.generateLicenseKey(storeId, sectionId);
      
      const license = await prisma.license.create({
        data: {
          key: licenseKey,
          storeId,
          sectionId,
          tier: subscriptionTier,
          status: 'active',
          activatedAt: new Date(),
          expiresAt: null, // Licenses don't expire with active subscription
        },
      });

      return license;
    } catch (error) {
      console.error('Error creating license:', error);
      throw new Error('Failed to create license');
    }
  }

  /**
   * Validate a license key
   */
  async validateLicense(licenseKey, storeId) {
    try {
      const license = await prisma.license.findUnique({
        where: { key: licenseKey },
        include: {
          store: {
            include: {
              subscription: true,
            },
          },
          section: true,
        },
      });

      if (!license) {
        return {
          valid: false,
          reason: 'License not found',
        };
      }

      // Check if license belongs to the requesting store
      if (license.storeId !== storeId) {
        return {
          valid: false,
          reason: 'License does not belong to this store',
        };
      }

      // Check if license is active
      if (license.status !== 'active') {
        return {
          valid: false,
          reason: `License is ${license.status}`,
        };
      }

      // Check if subscription is active
      const subscription = license.store.subscription;
      if (!subscription || subscription.status !== 'active') {
        return {
          valid: false,
          reason: 'Subscription is not active',
        };
      }

      // Check if section tier matches subscription tier
      const sectionTier = license.section.tier;
      const subscriptionTier = subscription.tier;
      
      if (!this.canAccessSection(subscriptionTier, sectionTier)) {
        return {
          valid: false,
          reason: 'Subscription tier does not have access to this section',
        };
      }

      // Check expiration (if set)
      if (license.expiresAt && new Date() > license.expiresAt) {
        return {
          valid: false,
          reason: 'License has expired',
        };
      }

      return {
        valid: true,
        license,
      };
    } catch (error) {
      console.error('Error validating license:', error);
      return {
        valid: false,
        reason: 'Validation error',
      };
    }
  }

  /**
   * Check if a subscription tier can access a section tier
   */
  canAccessSection(subscriptionTier, sectionTier) {
    const tierHierarchy = {
      FREE: 1,
      PRO: 2,
      PREMIUM: 3,
    };

    const userLevel = tierHierarchy[subscriptionTier] || 0;
    const sectionLevel = tierHierarchy[sectionTier] || 999;

    return userLevel >= sectionLevel;
  }

  /**
   * Revoke a license
   */
  async revokeLicense(licenseKey) {
    try {
      const license = await prisma.license.update({
        where: { key: licenseKey },
        data: {
          status: 'revoked',
          revokedAt: new Date(),
        },
      });

      return license;
    } catch (error) {
      console.error('Error revoking license:', error);
      throw new Error('Failed to revoke license');
    }
  }

  /**
   * Get all licenses for a store
   */
  async getStoreLicenses(storeId) {
    try {
      const licenses = await prisma.license.findMany({
        where: { storeId },
        include: {
          section: {
            select: {
              name: true,
              slug: true,
              tier: true,
            },
          },
        },
        orderBy: { activatedAt: 'desc' },
      });

      return licenses;
    } catch (error) {
      console.error('Error getting store licenses:', error);
      throw error;
    }
  }

  /**
   * Deactivate all licenses for a store (when subscription canceled)
   */
  async deactivateStoreLicenses(storeId) {
    try {
      await prisma.license.updateMany({
        where: {
          storeId,
          status: 'active',
        },
        data: {
          status: 'suspended',
          suspendedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error deactivating store licenses:', error);
      throw error;
    }
  }

  /**
   * Reactivate all licenses for a store (when subscription renewed)
   */
  async reactivateStoreLicenses(storeId) {
    try {
      await prisma.license.updateMany({
        where: {
          storeId,
          status: 'suspended',
        },
        data: {
          status: 'active',
          suspendedAt: null,
        },
      });
    } catch (error) {
      console.error('Error reactivating store licenses:', error);
      throw error;
    }
  }
}

module.exports = new LicenseService();
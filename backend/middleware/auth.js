const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Verify Shopify session
const verifyShopifySession = async (req, res, next) => {
  try {
    const { shop } = req.query;
    
    if (!shop) {
      return res.status(400).json({ error: 'Shop parameter required' });
    }

    const store = await prisma.store.findUnique({
      where: { shopifyDomain: shop },
      include: { subscriptions: true }
    });

    if (!store || !store.isActive) {
      return res.status(403).json({ error: 'Store not found or inactive' });
    }

    req.store = store;
    next();
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ error: 'Session verification failed' });
  }
};

// Check subscription tier access
const requireTier = (minTier) => {
  const tierHierarchy = { FREE: 0, PRO: 1, PREMIUM: 2 };
  
  return async (req, res, next) => {
    try {
      if (!req.store) {
        return res.status(401).json({ error: 'Store session required' });
      }

      const activeSubscription = req.store.subscriptions.find(
        sub => sub.status === 'ACTIVE'
      );

      if (!activeSubscription) {
        return res.status(403).json({ error: 'No active subscription' });
      }

      const userTier = tierHierarchy[activeSubscription.tier];
      const requiredTier = tierHierarchy[minTier];

      if (userTier < requiredTier) {
        return res.status(403).json({ 
          error: 'Subscription tier insufficient',
          required: minTier,
          current: activeSubscription.tier
        });
      }

      req.subscription = activeSubscription;
      next();
    } catch (error) {
      console.error('Tier verification error:', error);
      return res.status(500).json({ error: 'Tier verification failed' });
    }
  };
};

// Validate license key
const validateLicense = async (req, res, next) => {
  try {
    const licenseKey = req.headers['x-license-key'] || req.query.licenseKey;
    
    if (!licenseKey) {
      return res.status(401).json({ error: 'License key required' });
    }

    const license = await prisma.license.findUnique({
      where: { licenseKey },
      include: { store: true }
    });

    if (!license || !license.isValid) {
      return res.status(403).json({ error: 'Invalid license key' });
    }

    if (license.validUntil && new Date() > license.validUntil) {
      return res.status(403).json({ error: 'License expired' });
    }

    req.license = license;
    next();
  } catch (error) {
    console.error('License validation error:', error);
    return res.status(500).json({ error: 'License validation failed' });
  }
};

module.exports = {
  verifyToken,
  verifyShopifySession,
  requireTier,
  validateLicense,
};
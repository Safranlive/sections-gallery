const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'liquidCode') {
      const allowedExts = ['.liquid', '.txt'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only .liquid files are allowed for code'));
      }
    } else if (file.fieldname === 'previewImage') {
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
      }
    } else {
      cb(new Error('Unexpected field'));
    }
  }
});

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const session = res.locals.shopify.session;
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    const store = await prisma.store.findUnique({
      where: { shopifyDomain: session.shop }
    });

    if (!store) {
      return res.status(403).json({ 
        success: false, 
        error: 'Store not found' 
      });
    }

    req.adminStore = store;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication error' 
    });
  }
};

// GET /api/admin/sections - List all sections
router.get('/sections', adminAuth, async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, sections });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch sections' });
  }
});

// POST /api/admin/sections - Create new section
router.post('/sections', adminAuth, upload.fields([
  { name: 'liquidCode', maxCount: 1 },
  { name: 'previewImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, category, tier } = req.body;
    
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const section = await prisma.section.create({
      data: {
        name,
        slug,
        description,
        category,
        tier: tier || 'FREE',
        isActive: true,
      }
    });

    res.json({ success: true, section });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ success: false, error: 'Failed to create section' });
  }
});

module.exports = router;
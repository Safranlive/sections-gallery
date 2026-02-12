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
      // Accept .liquid files or any text file for liquid code
      const allowedExts = ['.liquid', '.txt'];
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExts.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error('Only .liquid files are allowed for code'));
      }
    } else if (file.fieldname === 'previewImage') {
      // Accept common image formats
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

// Admin authentication middleware (simple version - enhance with proper auth)
const adminAuth = async (req, res, next) => {
  try {
    // For now, check if user has admin role in their session
    // TODO: Implement proper admin authentication
    const session = res.locals.shopify.session;
    
    if (!session) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }

    // Check if store has admin privileges
    const store = await prisma.store.findUnique({
      where: { shopifyDomain: session.shop }
    });

    if (!store) {
      return res.status(403).json({ 
        success: false, 
        error: 'Store not found' 
      });
    }

    // Add admin check - for now, all authenticated stores have admin access
    // TODO: Add proper role-based access control
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
      orderBy: { createdAt: 'desc' },
    });

    res.json({ sections });
  } catch (error) {
    console.error('List sections error:', error);
    res.status(500).json({ error: 'Failed to list sections' });
  }
});

// POST /api/admin/sections - Create new section
router.post('/sections', adminAuth, upload.fields([
  { name: 'liquidCode', maxCount: 1 },
  { name: 'previewImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      tags,
      demoUrl,
      availableInFree,
      availableInPro,
      availableInPremium
    } = req.body;

    // Read liquid code from uploaded file
    let liquidCode = '';
    if (req.files.liquidCode && req.files.liquidCode[0]) {
      liquidCode = await fs.readFile(req.files.liquidCode[0].path, 'utf-8');
    }

    // Handle preview image
    let previewImageUrl = null;
    if (req.files.previewImage && req.files.previewImage[0]) {
      // TODO: Upload to cloud storage (S3, Cloudinary, etc.)
      // For now, store locally
      previewImageUrl = `/uploads/${req.files.previewImage[0].filename}`;
    }

    const section = await prisma.section.create({
      data: {
        name,
        slug,
        description,
        category,
        code: liquidCode,
        previewImageUrl,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        demoUrl,
        availableInFree: availableInFree === 'true',
        availableInPro: availableInPro === 'true',
        availableInPremium: availableInPremium === 'true',
        isActive: true,
      },
    });

    res.status(201).json({ section });
  } catch (error) {
    console.error('Create section error:', error);
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// PUT /api/admin/sections/:id - Update section
router.put('/sections/:id', adminAuth, upload.fields([
  { name: 'liquidCode', maxCount: 1 },
  { name: 'previewImage', maxCount: 1 }
`), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    // Update text fields
    const textFields = ['name', 'slug', 'description', 'category', 'demoUrl'];
    textFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // Update boolean fields
    const boolFields = ['availableInFree', 'availableInPro', 'availableInPremium', 'isActive'];
    boolFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field] === 'true';
      }
    });

    // Update tags
    if (req.body.tags) {
      updateData.tags = req.body.tags.split(',').map(t => t.trim());
    }

    // Update liquid code if provided
    if (req.files.liquidCode && req.files.liquidCode[0]) {
      updateData.code = await fs.readFile(req.files.liquidCode[0].path, 'utf-8');
    }

    // Update preview image if provided
    if (req.files.previewImage && req.files.previewImage[0]) {
      updateData.previewImageUrl = `/uploads/${req.files.previewImage[0].filename}`;
    }

    const section = await prisma.section.update({
      where: { id },
      data: updateData,
    });

    res.json({ section });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
});

// DELETE /api/admin/sections/:id - Delete section
router.delete('/sections/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.section.delete({
      where: { id },
    });

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

module.exports = router;

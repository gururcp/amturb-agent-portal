// ============================================================
// SERVICES ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const Service = require('../models/service');
const Merchant = require('../models/merchant');
const authMiddleware = require('../middleware/auth');
const owneronly = require('../middleware/owneronly');
// GET /api/services - Get all active services
router.get('/', authMiddleware, async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ createdAt: 1 })
      .lean();
    res.json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Get Services Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch services',
      message: error.message
    });
  }
});
// POST /api/services - Create new service (owner only)
router.post('/', authMiddleware, owneronly, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        error: 'Service name is required'
      });
    }
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    const service = await Service.create({
      name,
      slug,
      description: description || '',
      isActive: true
    });
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      service
    });
  } catch (error) {
    console.error('Create Service Error:', error.message);
    res.status(500).json({
      error: 'Failed to create service',
      message: error.message
    });
  }
});
// PATCH /api/services/:id - Update service (owner only)
router.patch('/:id', authMiddleware, owneronly,async (req, res) => {
  try {
    const { name, description } = req.body;
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    await service.save();
    res.json({
      success: true,
      message: 'Service updated successfully',
      service
    });
  } catch (error) {
    console.error('Update Service Error:', error.message);
    res.status(500).json({
      error: 'Failed to update service',
      message: error.message
    });
  }
});
// PATCH /api/services/:id/toggle - Activate/deactivate service (owner only)
router.patch('/:id/toggle', authMiddleware, owneronly, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    service.isActive = !service.isActive;
    await service.save();
    res.json({
      success: true,
      message: `Service ${service.isActive ? 'activated' : 'deactivated'}`,
      service
    });
  } catch (error) {
    console.error('Toggle Service Error:', error.message);
    res.status(500).json({
      error: 'Failed to toggle service',
      message: error.message
    });
  }
});
// GET /api/services/:slug/merchants - Get merchants interested in service (owner only)
router.get('/:slug/merchants', authMiddleware, owneronly, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), 50);
    const merchants = await Merchant.find({
      interestedServices: service._id
    })
      .populate('agentId', 'name employeeId')
      .populate('interestedServices', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
    const total = await Merchant.countDocuments({
      interestedServices: service._id
    });
    res.json({
      success: true,
      service: {
        name: service.name,
        slug: service.slug
      },
      merchants,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get Service Merchants Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch merchants',
      message: error.message
    });
  }
});
module.exports = router;
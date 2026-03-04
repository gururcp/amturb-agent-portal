const express = require('express');
const router = express.Router();
const Merchant = require('../models/Merchant');
const authMiddleware = require('../middleware/auth');
const ownerOnly = require('../middleware/ownerOnly');
// GET /api/merchants
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, limit = 50, skip = 0 } = req.query;
    let query = {};
    // Agents can only see their own merchants
    if (req.user.role === 'agent') {
      query.agentId = req.user.userId;
    }
    // Filter by status
    if (status) {
      query.status = status;
    }
    // Search
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    const merchants = await Merchant.find(query)
      .populate('agentId', 'name employeeId')
      .populate('interestedServices', 'name slug')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    const total = await Merchant.countDocuments(query);
    res.json({
      merchants,
      total,
      hasMore: total > (parseInt(skip) + merchants.length)
    });
  } catch (error) {
    console.error('Get merchants error:', error);
    res.status(500).json({ error: 'Failed to fetch merchants' });
  }
});
// GET /api/merchants/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id)
      .populate('agentId', 'name employeeId')
      .populate('interestedServices', 'name slug')
      .populate('visitLog.addedBy', 'name employeeId');
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    // Agents can only see their own merchants
    if (req.user.role === 'agent' && merchant.agentId._id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(merchant);
  } catch (error) {
    console.error('Get merchant error:', error);
    res.status(500).json({ error: 'Failed to fetch merchant' });
  }
});
// POST /api/merchants
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      businessName,
      ownerName,
      phone,
      address,
      city,
      gps_lat,
      gps_lng,
      interestedServices,
      nextVisitDate,
      notes
    } = req.body;
    // Check for duplicate phone
    const exists = await Merchant.findOne({ phone });
    if (exists) {
      return res.status(400).json({ error: 'Merchant with this phone number already exists' });
    }
    const merchant = await Merchant.create({
      businessName,
      ownerName,
      phone,
      address,
      city,
      gps_lat,
      gps_lng,
      interestedServices,
      nextVisitDate,
      agentId: req.user.userId
    });
    // Add initial note if provided
    if (notes) {
      merchant.visitLog.push({
        note: notes,
        addedBy: req.user.userId,
        addedAt: new Date()
      });
      await merchant.save();
    }
    const populated = await merchant.populate('interestedServices', 'name slug');
    res.status(201).json(populated);
  } catch (error) {
    console.error('Create merchant error:', error);
    res.status(500).json({ error: 'Failed to create merchant' });
  }
});
// PATCH /api/merchants/:id
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    // Agents can only update their own merchants
    if (req.user.role === 'agent' && merchant.agentId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Update allowed fields
    const allowedUpdates = [
      'businessName', 'ownerName', 'phone', 'address', 'city',
      'interestedServices', 'status', 'nextVisitDate'
    ];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        merchant[field] = req.body[field];
      }
    });
    merchant.updatedAt = new Date();
    await merchant.save();
    const updated = await Merchant.findById(merchant._id)
      .populate('interestedServices', 'name slug');
    res.json(updated);
  } catch (error) {
    console.error('Update merchant error:', error);
    res.status(500).json({ error: 'Failed to update merchant' });
  }
});
// POST /api/merchants/:id/visit-log
router.post('/:id/visit-log', authMiddleware, async (req, res) => {
  try {
    const { note } = req.body;
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    merchant.visitLog.push({
      note,
      addedBy: req.user.userId,
      addedAt: new Date()
    });
    await merchant.save();
    res.json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Add visit log error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});
// POST /api/merchants/:id/owner-note (Owner only)
router.post('/:id/owner-note', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { note } = req.body;
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    merchant.ownerNotes.push({
      note,
      addedAt: new Date()
    });
    await merchant.save();
    res.json({ message: 'Owner note added successfully' });
  } catch (error) {
    console.error('Add owner note error:', error);
    res.status(500).json({ error: 'Failed to add owner note' });
  }
});
// PATCH /api/merchants/:id/status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    merchant.status = status;
    merchant.updatedAt = new Date();
    await merchant.save();
    res.json({ message: 'Status updated', status: merchant.status });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});
// DELETE /api/merchants/:id (Owner only - soft delete)
router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({ error: 'Merchant not found' });
    }
    merchant.deletedAt = new Date();
    await merchant.save();
    res.json({ message: 'Merchant deleted successfully' });
  } catch (error) {
    console.error('Delete merchant error:', error);
    res.status(500).json({ error: 'Failed to delete merchant' });
  }
});
module.exports = router;
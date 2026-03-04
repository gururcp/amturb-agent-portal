// ============================================================
// AGENTS ROUTES - Team Management (Owner Only)
// ============================================================
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Merchant = require('../models/merchant');
const authMiddleware = require('../middleware/auth');
const owneronly = require('../middleware/owneronly');
// All routes are owner-only
router.use(authMiddleware, owneronly);
// GET /api/agents - List all agents
router.get('/', async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' })
      .select('-pin')
      .sort({ createdAt: -1 })
      .lean();
    // Get merchant count for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const merchantCount = await Merchant.countDocuments({
          agentId: agent._id
        });
        return {
          ...agent,
          merchantCount
        };
      })
    );
    res.json({
      success: true,
      agents: agentsWithStats
    });
  } catch (error) {
    console.error('Get Agents Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch agents',
      message: error.message
    });
  }
});
// POST /api/agents - Create new agent
router.post('/', async (req, res) => {
  try {
    const { name, employeeId, pin } = req.body;
    if (!name || !employeeId || !pin) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, employee ID, and PIN are required'
      });
    }
    if (pin.length < 4 || pin.length > 6) {
      return res.status(400).json({
        error: 'Invalid PIN',
        message: 'PIN must be 4-6 digits'
      });
    }
    const agent = await User.create({
      name,
      employeeId: employeeId.toUpperCase(),
      pin,
      role: 'agent',
      mustChangePIN: true,
      isActive: true
    });
    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      agent: agent.toSafeObject()
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Duplicate employee ID',
        message: 'This employee ID already exists'
      });
    }
    console.error('Create Agent Error:', error.message);
    res.status(500).json({
      error: 'Failed to create agent',
      message: error.message
    });
  }
});
// PATCH /api/agents/:id/activate - Activate agent
router.patch('/:id/activate', async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ error: 'Agent not found' });
    }
    agent.isActive = true;
    await agent.save();
    res.json({
      success: true,
      message: 'Agent activated successfully'
    });
  } catch (error) {
    console.error('Activate Agent Error:', error.message);
    res.status(500).json({
      error: 'Failed to activate agent',
      message: error.message
    });
  }
});
// PATCH /api/agents/:id/deactivate - Deactivate agent
router.patch('/:id/deactivate', async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ error: 'Agent not found' });
    }
    agent.isActive = false;
    await agent.save();
    res.json({
      success: true,
      message: 'Agent deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate Agent Error:', error.message);
    res.status(500).json({
      error: 'Failed to deactivate agent',
      message: error.message
    });
  }
});
// GET /api/agents/:id/stats - Get agent statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ error: 'Agent not found' });
    }
    const total = await Merchant.countDocuments({ agentId: agent._id });
    const onboarded = await Merchant.countDocuments({
      agentId: agent._id,
      status: 'Onboarded'
    });
    const Service = require('../models/service');
    const soundBoxService = await Service.findOne({ slug: 'sound_box' });
    const soundbox = soundBoxService
      ? await Merchant.countDocuments({
          agentId: agent._id,
          interestedServices: soundBoxService._id
        })
      : 0;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = await Merchant.countDocuments({
      agentId: agent._id,
      createdAt: { $gte: weekAgo }
    });
    res.json({
      success: true,
      agent: {
        _id: agent._id,
        name: agent.name,
        employeeId: agent.employeeId
      },
      stats: {
        total,
        onboarded,
        soundbox,
        thisWeek
      }
    });
  } catch (error) {
    console.error('Get Agent Stats Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch agent stats',
      message: error.message
    });
  }
});
module.exports = router;
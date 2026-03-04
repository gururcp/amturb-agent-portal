// ============================================================
// DASHBOARD ROUTES - Statistics
// ============================================================
const express = require('express');
const router = express.Router();
const Merchant = require('../models/merchant');
const User = require('../models/user');
const Service = require('../models/service');
const authMiddleware = require('../middleware/auth');
const owneronly = require('../middleware/owneronly');
// GET /api/dashboard/agent - Agent dashboard stats
router.get('/agent', authMiddleware, async (req, res) => {
  try {
    const agentId = req.user.userId;
    // Total merchants
    const myTotal = await Merchant.countDocuments({ agentId });
    // Onboarded
    const myOnboarded = await Merchant.countDocuments({
      agentId,
      status: 'Onboarded'
    });
    // Sound Box leads
    const soundBoxService = await Service.findOne({ slug: 'sound_box' });
    const mySoundbox = soundBoxService
      ? await Merchant.countDocuments({
          agentId,
          interestedServices: soundBoxService._id
        })
      : 0;
    // Today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisits = await Merchant.countDocuments({
      agentId,
      'visitLog.addedAt': { $gte: today }
    });
    // Overdue follow-ups
    const now = new Date();
    const overdueMerchants = await Merchant.find({
      agentId,
      nextVisitDate: { $lt: now, $ne: null },
      status: { $ne: 'Onboarded' }
    })
      .populate('interestedServices', 'name slug')
      .sort({ nextVisitDate: 1 })
      .limit(10)
      .lean();
    // Today's follow-ups
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const todayFollowups = await Merchant.find({
      agentId,
      nextVisitDate: { $gte: today, $lte: endOfDay }
    })
      .populate('interestedServices', 'name slug')
      .sort({ nextVisitDate: 1 })
      .lean();
    res.json({
      success: true,
      stats: {
        myTotal,
        myOnboarded,
        mySoundbox,
        todayVisits
      },
      overdueFollowups: overdueMerchants,
      todayFollowups
    });
  } catch (error) {
    console.error('Agent Dashboard Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});
// GET /api/dashboard/owner - Owner dashboard stats
router.get('/owner', authMiddleware, owneronly, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    // Today's registrations
    const todayRegistrations = await Merchant.countDocuments({
      createdAt: { $gte: today }
    });
    // Today's follow-ups
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const todayFollowups = await Merchant.countDocuments({
      nextVisitDate: { $gte: today, $lte: endOfDay }
    });
    // Total merchants
    const totalMerchants = await Merchant.countDocuments();
    // Total onboarded
    const totalOnboarded = await Merchant.countDocuments({
      status: 'Onboarded'
    });
    // Sound Box stats
    const soundBoxService = await Service.findOne({ slug: 'sound_box' });
    const soundboxTotal = soundBoxService
      ? await Merchant.countDocuments({
          interestedServices: soundBoxService._id
        })
      : 0;
    const soundboxOnboarded = soundBoxService
      ? await Merchant.countDocuments({
          interestedServices: soundBoxService._id,
          status: 'Onboarded'
        })
      : 0;
    // Yesterday's Sound Box leads with agent names
    const soundboxYesterday = soundBoxService
      ? await Merchant.find({
          interestedServices: soundBoxService._id,
          createdAt: { $gte: yesterday, $lt: today }
        })
          .populate('agentId', 'name employeeId')
          .lean()
      : [];
    // Overdue follow-ups count
    const now = new Date();
    const overdueFollowups = await Merchant.countDocuments({
      nextVisitDate: { $lt: now, $ne: null },
      status: { $ne: 'Onboarded' }
    });
    // This week's follow-ups count
    const endOfWeek = new Date(weekAgo);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    const thisWeekFollowups = await Merchant.countDocuments({
      nextVisitDate: { $gte: today, $lte: endOfWeek }
    });
    // Per-agent stats
    const agents = await User.find({ role: 'agent' }).select('_id name employeeId').lean();
    const perAgentStats = await Promise.all(
      agents.map(async (agent) => {
        const total = await Merchant.countDocuments({ agentId: agent._id });
        const onboarded = await Merchant.countDocuments({
          agentId: agent._id,
          status: 'Onboarded'
        });
        const soundbox = soundBoxService
          ? await Merchant.countDocuments({
              agentId: agent._id,
              interestedServices: soundBoxService._id
            })
          : 0;
        const thisWeek = await Merchant.countDocuments({
          agentId: agent._id,
          createdAt: { $gte: weekAgo }
        });
        return {
          agentId: agent._id,
          name: agent.name,
          employeeId: agent.employeeId,
          total,
          onboarded,
          soundbox,
          thisWeek
        };
      })
    );
    res.json({
      success: true,
      todayRegistrations,
      todayFollowups,
      totalMerchants,
      totalOnboarded,
      soundboxTotal,
      soundboxOnboarded,
      soundboxYesterday,
      overdueFollowups,
      thisWeekFollowups,
      perAgentStats
    });
  } catch (error) {
    console.error('Owner Dashboard Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch dashboard data',
      message: error.message
    });
  }
});
module.exports = router;
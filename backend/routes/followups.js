// ============================================================
// FOLLOW-UPS ROUTES
// ============================================================
const express = require('express');
const router = express.Router();
const Merchant = require('../models/merchant');
const authMiddleware = require('../middleware/auth');
// GET /api/followups - Get follow-ups (grouped by overdue/today/this week)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { agentId } = req.query;
    // Base filter
    let filter = {};
    // Agents can only see their own follow-ups
    if (req.user.role === 'agent') {
      filter.agentId = req.user.userId;
    } else if (agentId) {
      // Owner can filter by specific agent
      filter.agentId = agentId;
    }
    // Exclude onboarded merchants
    filter.status = { $ne: 'Onboarded' };
    filter.nextVisitDate = { $ne: null };
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    // Overdue follow-ups
    const overdue = await Merchant.find({
      ...filter,
      nextVisitDate: { $lt: now }
    })
      .populate('agentId', 'name employeeId')
      .populate('interestedServices', 'name slug')
      .sort({ nextVisitDate: 1 })
      .lean();
    // Today's follow-ups
    const todayFollowups = await Merchant.find({
      ...filter,
      nextVisitDate: { $gte: today, $lte: endOfDay }
    })
      .populate('agentId', 'name employeeId')
      .populate('interestedServices', 'name slug')
      .sort({ nextVisitDate: 1 })
      .lean();
    // This week's follow-ups (excluding today)
    const thisWeek = await Merchant.find({
      ...filter,
      nextVisitDate: { $gt: endOfDay, $lte: endOfWeek }
    })
      .populate('agentId', 'name employeeId')
      .populate('interestedServices', 'name slug')
      .sort({ nextVisitDate: 1 })
      .lean();
    // Calculate days overdue for overdue merchants
    const overdueWithDays = overdue.map(merchant => {
      const daysOverdue = Math.floor(
        (now - new Date(merchant.nextVisitDate)) / (1000 * 60 * 60 * 24)
      );
      return {
        ...merchant,
        daysOverdue
      };
    });
    res.json({
      success: true,
      overdue: overdueWithDays,
      today: todayFollowups,
      thisWeek
    });
  } catch (error) {
    console.error('Get Follow-ups Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch follow-ups',
      message: error.message
    });
  }
});
module.exports = router;
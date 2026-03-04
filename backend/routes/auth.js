// ============================================================
// AUTH ROUTES - Login, PIN Management
// ============================================================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ← CHANGED TO LOWERCASE
const authMiddleware = require('../middleware/auth');
const ownerOnly = require('../middleware/owneronly');
// ============================================================
// POST /api/auth/login
// ============================================================
router.post('/login', async (req, res) => {
  try {
    const { employeeId, pin } = req.body;
    if (!employeeId || !pin) {
      return res.status(400).json({ 
        error: 'Missing credentials',
        message: 'Employee ID and PIN are required'
      });
    }
    const user = await User.findOne({ 
      employeeId: employeeId.toUpperCase() 
    });
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Employee ID or PIN is incorrect'
      });
    }
    if (!user.isActive) {
      return res.status(403).json({ 
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Contact administrator.'
      });
    }
    const isPinValid = await user.comparePin(pin);
    if (!isPinValid) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Employee ID or PIN is incorrect'
      });
    }
    user.lastActiveAt = new Date();
    await user.save();
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        employeeId: user.employeeId,
        role: user.role,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        mustChangePIN: user.mustChangePIN
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});
// ============================================================
// GET /api/auth/me
// ============================================================
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-pin');
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found'
      });
    }
    res.json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Get User Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch user info'
    });
  }
});
// ============================================================
// PATCH /api/auth/change-pin
// ============================================================
router.patch('/change-pin', authMiddleware, async (req, res) => {
  try {
    const { currentPin, newPin, confirmPin } = req.body;
    if (!currentPin || !newPin || !confirmPin) {
      return res.status(400).json({ 
        error: 'Missing fields',
        message: 'Current PIN, new PIN, and confirm PIN are required'
      });
    }
    if (newPin !== confirmPin) {
      return res.status(400).json({ 
        error: 'PIN mismatch',
        message: 'New PIN and confirm PIN do not match'
      });
    }
    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({ 
        error: 'Invalid PIN',
        message: 'PIN must be 4-6 digits'
      });
    }
    if (!/^\d+$/.test(newPin)) {
      return res.status(400).json({ 
        error: 'Invalid PIN',
        message: 'PIN must contain only numbers'
      });
    }
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isPinValid = await user.comparePin(currentPin);
    if (!isPinValid) {
      return res.status(401).json({ 
        error: 'Invalid PIN',
        message: 'Current PIN is incorrect'
      });
    }
    user.pin = newPin;
    user.mustChangePIN = false;
    await user.save();
    res.json({
      success: true,
      message: 'PIN changed successfully'
    });
  } catch (error) {
    console.error('Change PIN Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to change PIN'
    });
  }
});
// ============================================================
// PATCH /api/auth/reset-pin/:id
// ============================================================
router.patch('/reset-pin/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const { newPin } = req.body;
    const userId = req.params.id;
    if (!newPin) {
      return res.status(400).json({ 
        error: 'Missing new PIN'
      });
    }
    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({ 
        error: 'Invalid PIN',
        message: 'PIN must be 4-6 digits'
      });
    }
    if (!/^\d+$/.test(newPin)) {
      return res.status(400).json({ 
        error: 'Invalid PIN',
        message: 'PIN must contain only numbers'
      });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'owner') {
      return res.status(403).json({ 
        error: 'Cannot reset owner PIN',
        message: 'Owner must change their own PIN'
      });
    }
    user.pin = newPin;
    user.mustChangePIN = true;
    await user.save();
    res.json({
      success: true,
      message: `PIN reset for ${user.name}. They must change it on next login.`
    });
  } catch (error) {
    console.error('Reset PIN Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to reset PIN'
    });
  }
});
module.exports = router;
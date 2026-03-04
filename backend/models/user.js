// ============================================================
// USER MODEL - Agents & Owner
// ============================================================
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  pin: {
    type: String,
    required: [true, 'PIN is required'],
    minlength: 4,
    maxlength: 60 // bcrypt hash length
  },
  role: {
    type: String,
    enum: ['owner', 'agent'],
    default: 'agent'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  mustChangePIN: {
    type: Boolean,
    default: true
  },
  lastActiveAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// ============================================================
// INDEX for faster queries
// ============================================================
userSchema.index({ employeeId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
// ============================================================
// PRE-SAVE HOOK - Hash PIN before saving
// ============================================================
userSchema.pre('save', async function(next) {
  // Only hash if PIN is modified
  if (!this.isModified('pin')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});
// ============================================================
// METHOD - Compare PIN during login
// ============================================================
userSchema.methods.comparePin = async function(candidatePin) {
  return await bcrypt.compare(candidatePin, this.pin);
};
// ============================================================
// METHOD - Get safe user data (no PIN)
// ============================================================
userSchema.methods.toSafeObject = function() {
  return {
    _id: this._id,
    name: this.name,
    employeeId: this.employeeId,
    role: this.role,
    isActive: this.isActive,
    mustChangePIN: this.mustChangePIN,
    lastActiveAt: this.lastActiveAt,
    createdAt: this.createdAt
  };
};
module.exports = mongoose.model('User', userSchema);
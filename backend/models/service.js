// ============================================================
// SERVICE MODEL - Banking/Financial Services
// ============================================================
const mongoose = require('mongoose');
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Service slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
// ============================================================
// INDEX for faster queries
// ============================================================
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1 });
module.exports = mongoose.model('Service', serviceSchema);
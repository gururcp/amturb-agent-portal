// ============================================================
// MERCHANT MODEL - Business Registrations
// ============================================================
const mongoose = require('mongoose');
const Service = require('./service'); // Import Service model
const merchantSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    default: '',
    trim: true
  },
  city: {
    type: String,
    default: '',
    trim: true
  },
  gps_lat: {
    type: Number,
    default: null
  },
  gps_lng: {
    type: Number,
    default: null
  },
  interestedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Onboarded'],
    default: 'New'
  },
  nextVisitDate: {
    type: Date,
    default: null
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Agent ID is required']
  },
  visitLog: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ownerNotes: [{
    note: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
// ============================================================
// INDEXES for performance
// ============================================================
merchantSchema.index({ agentId: 1 });
merchantSchema.index({ phone: 1 }, { unique: true });
merchantSchema.index({ nextVisitDate: 1 });
merchantSchema.index({ status: 1 });
merchantSchema.index({ createdAt: -1 });
merchantSchema.index({ businessName: 'text', ownerName: 'text' });
// ============================================================
// PRE-SAVE HOOK - Sound Box Auto-Rule
// ============================================================
merchantSchema.pre('save', async function(next) {
  if (this.isModified('interestedServices')) {
    try {
      // Service model is already imported at top
      const services = await Service.find({ 
        slug: { $in: ['sound_box', 'current_savings', 'upi_qr'] } 
      });
      const soundBoxId = services.find(s => s.slug === 'sound_box')?._id?.toString();
      const currentId = services.find(s => s.slug === 'current_savings')?._id?.toString();
      const upiId = services.find(s => s.slug === 'upi_qr')?._id?.toString();
      const ids = this.interestedServices.map(id => id.toString());
      // If Sound Box is selected, auto-add Current/Savings and UPI/QR
      if (soundBoxId && ids.includes(soundBoxId)) {
        if (currentId && !ids.includes(currentId)) {
          this.interestedServices.push(currentId);
        }
        if (upiId && !ids.includes(upiId)) {
          this.interestedServices.push(upiId);
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
// ============================================================
// PRE-SAVE HOOK - Update timestamp
// ============================================================
merchantSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
module.exports = mongoose.models.merchant || mongoose.model('merchant', merchantSchema);
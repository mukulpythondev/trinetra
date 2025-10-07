// src/models/SOS.js
const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['medical', 'security', 'lost-child', 'lost-person', 'fire', 'other']
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  templeZone: {
    type: String,
    default: null  // e.g., 'main-hall', 'parking', 'entrance'
  },
  status: {
    type: String,
    enum: ['active', 'acknowledged', 'in-progress', 'resolved', 'cancelled'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  responseTime: {
    type: Number,  // in seconds
    default: null
  },
  resolutionNotes: {
    type: String,
    default: null
  },
  images: [{
    type: String  // URLs to uploaded images
  }],
  notifiedAdmins: [{
    adminId: mongoose.Schema.Types.ObjectId,
    notifiedAt: Date
  }]
}, {
  timestamps: true
});

// Index for geospatial queries
sosSchema.index({ location: '2dsphere' });
sosSchema.index({ status: 1, priority: -1 });
sosSchema.index({ createdAt: -1 });

// Method to acknowledge SOS
sosSchema.methods.acknowledge = function(adminId) {
  this.status = 'acknowledged';
  this.assignedTo = adminId;
  this.acknowledgedAt = new Date();
  this.responseTime = Math.floor((this.acknowledgedAt - this.createdAt) / 1000);
  return this.save();
};

// Method to mark as in-progress
sosSchema.methods.markInProgress = function() {
  this.status = 'in-progress';
  return this.save();
};

// Method to resolve SOS
sosSchema.methods.resolve = function(notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolutionNotes = notes;
  return this.save();
};

// Static method to get active SOS count
sosSchema.statics.getActiveCount = function() {
  return this.countDocuments({ 
    status: { $in: ['active', 'acknowledged', 'in-progress'] } 
  });
};

module.exports = mongoose.model('SOS', sosSchema);
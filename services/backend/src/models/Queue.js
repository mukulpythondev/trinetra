// src/models/Queue.js
const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
  templeId: {
    type: String,
    required: true,
    enum: ['kedarnath']
  },
  slotTime: {
  type: String, // store as "06:00-07:00"
  required: true
},

  totalCapacity: {
    type: Number,
    required: true,
    default: 100
  },
  currentCount: {
    type: Number,
    default: 0
  },
  priorityCount: {
    type: Number,
    default: 0
  },
  regularCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['open', 'full', 'closed'],
    default: 'open'
  },
  averageWaitTime: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
queueSchema.index({ templeId: 1, slotTime: 1 }, { unique: true });

// Method to check if slot is available
queueSchema.methods.isAvailable = function() {
  return this.currentCount < this.totalCapacity && this.status === 'open';
};

// Method to add to queue
queueSchema.methods.addToQueue = function(isPriority = false) {
  if (this.isAvailable()) {
    this.currentCount += 1;
    if (isPriority) {
      this.priorityCount += 1;
    } else {
      this.regularCount += 1;
    }
    
    if (this.currentCount >= this.totalCapacity) {
      this.status = 'full';
    }
    
    return this.save();
  }
  throw new Error('Queue is full');
};

// Method to remove from queue
queueSchema.methods.removeFromQueue = function(isPriority = false) {
  if (this.currentCount > 0) {
    this.currentCount -= 1;
    if (isPriority && this.priorityCount > 0) {
      this.priorityCount -= 1;
    } else if (this.regularCount > 0) {
      this.regularCount -= 1;
    }
    
    if (this.status === 'full') {
      this.status = 'open';
    }
    
    return this.save();
  }
};

module.exports = mongoose.model('Queue', queueSchema);
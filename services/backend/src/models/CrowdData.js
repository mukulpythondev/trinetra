// src/models/CrowdData.js
const mongoose = require('mongoose');

const crowdDataSchema = new mongoose.Schema({
  templeId: {
    type: String,
    required: true,
    enum: ['kedarnath']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  crowdCount: {
    type: Number,
    required: true,
    min: 0
  },
  densityLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'critical'],
    required: true
  },
  zone: {
    type: String,
    default: 'main'  // e.g., 'entrance', 'main-hall', 'parking'
  },
  cameraId: {
    type: String,
    default: null
  },
  imageUrl: {
    type: String,
    default: null
  },
  prediction: {
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    nextHourCount: {
      type: Number,
      default: null
    }
  },
  source: {
    type: String,
    enum: ['ai-model', 'manual', 'sensor'],
    default: 'ai-model'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
crowdDataSchema.index({ templeId: 1, timestamp: -1 });
crowdDataSchema.index({ timestamp: -1 });
crowdDataSchema.index({ templeId: 1, zone: 1, timestamp: -1 });

// Static method to get latest crowd data
crowdDataSchema.statics.getLatest = function(templeId, zone = 'main') {
  return this.findOne({ templeId, zone })
    .sort({ timestamp: -1 })
    .lean();
};

// Static method to get hourly data for today
crowdDataSchema.statics.getTodayHourly = async function(templeId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.aggregate([
    {
      $match: {
        templeId,
        timestamp: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: { $hour: '$timestamp' },
        avgCount: { $avg: '$crowdCount' },
        maxCount: { $max: '$crowdCount' },
        minCount: { $min: '$crowdCount' },
        densityLevel: { $last: '$densityLevel' }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);
};

// Static method to get prediction for next day
crowdDataSchema.statics.getNextDayPrediction = async function(templeId) {
  // This would typically call your AI service
  // For now, return placeholder
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    predictedCount: Math.floor(Math.random() * 300) + 50,
    confidence: 0.85
  }));
  
  return hours;
};

module.exports = mongoose.model('CrowdData', crowdDataSchema);
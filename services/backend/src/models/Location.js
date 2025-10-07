// src/models/Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  templeId: {
    type: String,
    enum: ['kedarnath'],
    default: null
  },
  isWithinTempleArea: {
    type: Boolean,
    default: false
  },
  distanceFromTemple: {
    type: Number, // in meters
    default: null
  },
  accuracy: {
    type: Number, // GPS accuracy in meters
    default: null
  }
}, {
  timestamps: true
});

// Index for geospatial queries
locationSchema.index({ location: '2dsphere' });
locationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Location', locationSchema);
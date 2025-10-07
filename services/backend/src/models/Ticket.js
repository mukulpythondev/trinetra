// src/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templeId: {
    type: String,
    required: true,
    enum:['kedarnath']
  },
  darshanType: {
    type: String,
    required: true,
    enum: ['regular', 'vip', 'special']
  },
  slotTime: {
    type: Date,
    required: true
  },
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  priorityCategory: {
    type: String,
    enum: ['none', 'elderly', 'differently-abled', 'pregnant', 'child'],
    default: 'none'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  queueNumber: {
    type: Number,
    default: null
  },
  checkInTime: {
    type: Date,
    default: null
  },
  completedTime: {
    type: Date,
    default: null
  },
  qrCode: {
    type: String,  // QR code data
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: null
  },
  specialRequirements: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ templeId: 1, slotTime: 1 });
ticketSchema.index({ queueNumber: 1 });

// Generate queue number
ticketSchema.methods.generateQueueNumber = async function() {
  const count = await mongoose.model('Ticket').countDocuments({
    templeId: this.templeId,
    slotTime: this.slotTime,
    status: { $in: ['confirmed', 'pending'] }
  });
  
  this.queueNumber = count + 1;
  return this.save();
};

// Check-in method
ticketSchema.methods.checkIn = function() {
  this.status = 'confirmed';
  this.checkInTime = new Date();
  return this.save();
};

// Complete darshan
ticketSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedTime = new Date();
  return this.save();
};

module.exports = mongoose.model('Ticket', ticketSchema);
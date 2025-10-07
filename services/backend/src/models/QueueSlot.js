const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  templeId: { type: String, required: true, enum: ['kedarnath'] },
  slotId: { type: String, required: true }, // e.g. slot1, slot2
  start_time: String,
  end_time: String,
  max_capacity: { type: Number, default: 50 },
  booked_count: { type: Number, default: 0 }
});

module.exports = mongoose.model('QueueSlot', slotSchema);

const QueueSlot = require('../models/QueueSlot');

// Create a new slot
exports.createQueueSlot = async (req, res) => {
  try {
    const { templeId, slotId, slotTime, max_capacity } = req.body;

    const slot = new QueueSlot({ templeId, slotId, slotTime, max_capacity });
    await slot.save();

    res.status(201).json({ success: true, slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all slots for a temple
exports.getTempleSlots = async (req, res) => {
  try {
    const slots = await QueueSlot.find({ templeId: req.params.templeId });
    res.json({ success: true, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a specific slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const slot = await QueueSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add booking to queue
exports.addToQueue = async (req, res) => {
  try {
    const slot = await QueueSlot.findOne({ slotId: req.params.id }); // slotId matches 'slot1'
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    if (slot.booked_count >= slot.max_capacity) {
      return res.status(400).json({ success: false, message: 'Slot is full' });
    }

    slot.booked_count += 1;
    await slot.save();

    res.json({ success: true, message: 'Booking confirmed', slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove booking
exports.removeFromQueue = async (req, res) => {
  try {
    const slot = await QueueSlot.findOne({ slotId: req.params.id });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    if (slot.booked_count > 0) {
      slot.booked_count -= 1;
      await slot.save();
    }

    res.json({ success: true, message: 'Booking removed', slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Update slot
exports.updateSlot = async (req, res) => {
  try {
    const slot = await QueueSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    res.json({ success: true, slot });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await QueueSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');

// Create a new slot
router.post('/', queueController.createQueueSlot);

// Get all slots for a temple
router.get('/temple/:templeId', queueController.getTempleSlots);

// Get a specific slot by ID
router.get('/:id', queueController.getSlotById);

// Update slot
router.put('/:id', queueController.updateSlot);

// Delete slot
router.delete('/:id', queueController.deleteSlot);

// Add booking to queue
router.post('/:id/add', queueController.addToQueue);

// Remove booking
router.post('/:id/remove', queueController.removeFromQueue);

module.exports = router;

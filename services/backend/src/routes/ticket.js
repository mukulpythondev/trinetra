// src/routes/ticket.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protect, isAdmin } = require('../middleware/auth');

// @route   POST /api/tickets/book
router.post('/book', protect, ticketController.bookTicket);

// @route   GET /api/tickets/my-tickets
router.get('/my-tickets', protect, ticketController.getMyTickets);

// @route   GET /api/tickets/slots
router.get('/slots', ticketController.getAvailableSlots);

// @route   PUT /api/tickets/:id/cancel
router.put('/:id/cancel', protect, ticketController.cancelTicket);

// @route   PUT /api/tickets/:id/checkin (Admin only)
router.put('/:id/checkin', protect, isAdmin, ticketController.checkInTicket);

// @route   GET /api/tickets/queue/:templeId
router.get('/queue/:templeId', ticketController.getQueueStatus);

module.exports = router;
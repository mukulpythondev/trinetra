// src/routes/sos.js
const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const { protect, isAdmin } = require('../middleware/auth');

// @route   POST /api/sos/create
router.post('/create', protect, sosController.createSOS);

// @route   GET /api/sos/all (Admin only)
router.get('/all', protect, isAdmin, sosController.getAllSOS);

// @route   GET /api/sos/my-alerts
router.get('/my-alerts', protect, sosController.getMySOS);

// @route   PUT /api/sos/:id/acknowledge (Admin only)
router.put('/:id/acknowledge', protect, isAdmin, sosController.acknowledgeSOS);

// @route   PUT /api/sos/:id/in-progress (Admin only)
router.put('/:id/in-progress', protect, isAdmin, sosController.markInProgress);

// @route   PUT /api/sos/:id/resolve (Admin only)
router.put('/:id/resolve', protect, isAdmin, sosController.resolveSOS);

// @route   GET /api/sos/stats (Admin only)
router.get('/stats', protect, isAdmin, sosController.getSOSStats);

module.exports = router;
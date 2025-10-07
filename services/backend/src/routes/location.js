// src/routes/location.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { protect, isAdmin } = require('../middleware/auth');

// @route   POST /api/location/update
router.post('/update', protect, locationController.updateLocation);

// @route   GET /api/location/active-devotees (Admin only)
router.get('/active-devotees', protect, isAdmin, locationController.getActiveDevotees);

// @route   GET /api/location/heatmap (Admin only)
router.get('/heatmap', protect, isAdmin, locationController.getHeatmapData);

// @route   GET /api/location/stats (Admin only)
router.get('/stats', protect, isAdmin, locationController.getLocationStats);

module.exports = router;
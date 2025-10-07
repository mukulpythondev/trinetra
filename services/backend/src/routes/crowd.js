// src/routes/crowd.js
const express = require('express');
const router = express.Router();
const crowdController = require('../controllers/crowdController');
const { protect, isAdmin } = require('../middleware/auth');

// @route   GET /api/crowd/current/:templeId
router.get('/current/:templeId', crowdController.getCurrentCrowd);

// @route   GET /api/crowd/today/:templeId
router.get('/today/:templeId', crowdController.getTodayCrowd);

// @route   GET /api/crowd/predict/:templeId
router.get('/predict/:templeId', crowdController.getPrediction);

// @route   POST /api/crowd/update (Admin/Internal)
router.post('/update', protect, isAdmin, crowdController.updateCrowdData);

// @route   GET /api/crowd/analytics/:templeId (Admin only)
router.get('/analytics/:templeId', protect, isAdmin, crowdController.getCrowdAnalytics);

module.exports = router;
// routes/nextDayPrediction.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// POST /api/prediction/next-day/:templeId
router.post('/:templeId', async (req, res) => {
  const { templeId } = req.params;
  const payload = req.body;

  try {
    const response = await axios.post(`${FASTAPI_URL}/predict/`, {
      templeId,
      ...payload,
    }, { timeout: 15000 });

    const data = response.data;

    res.json({
      success: true,
      templeId,
      predicted_visitors: data.predicted_visitors,
      crowd_level: data.crowd_level,
      confidence_interval: data.confidence_interval,
      rules_applied: data.rules_applied,
    });
  } catch (error) {
    console.error('Next day prediction route error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch next day prediction',
    });
  }
});
module.exports = router;

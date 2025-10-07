// src/controllers/crowdController.js
const CrowdData = require('../models/CrowdData');
const axios = require('axios');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// @desc    Get current crowd count
// @route   GET /api/crowd/current/:templeId
// @access  Public
exports.getCurrentCrowd = async (req, res) => {
  try {
    const { templeId } = req.params;
    const { zone } = req.query;

    const crowdData = await CrowdData.getLatest(templeId, zone || 'main');

    if (!crowdData) {
      return res.status(404).json({
        success: false,
        message: 'No crowd data available'
      });
    }

    res.status(200).json({
      success: true,
      data: crowdData
    });
  } catch (error) {
    console.error('Get current crowd error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch crowd data',
      error: error.message
    });
  }
};

// @desc    Get hourly crowd data for today
// @route   GET /api/crowd/today/:templeId
// @access  Public
exports.getTodayCrowd = async (req, res) => {
  try {
    const { templeId } = req.params;

    const hourlyData = await CrowdData.getTodayHourly(templeId);

    // Format for chart display
    const chartData = hourlyData.map(item => ({
      hour: item._id,
      hourLabel: `${item._id}:00`,
      avgCount: Math.round(item.avgCount),
      maxCount: item.maxCount,
      minCount: item.minCount,
      densityLevel: item.densityLevel
    }));

    res.status(200).json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Get today crowd error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s crowd data',
      error: error.message
    });
  }
};

// @desc    Get prediction for next day
// @route   GET /api/crowd/predict/:templeId
// @access  Public
exports.getPrediction = async (req, res) => {
  try {
    const { templeId } = req.params;

    // Call FastAPI ML service for prediction
    try {
      const response = await axios.get(
        `${FASTAPI_URL}/api/predict/crowd/${templeId}`,
        { timeout: 10000 }
      );

      const predictionData = response.data;

      res.status(200).json({
        success: true,
        data: predictionData
      });
    } catch (apiError) {
      // Fallback to stored prediction if API fails
      console.warn('FastAPI not available, using fallback data');
      
      const fallbackData = await CrowdData.getNextDayPrediction(templeId);

      res.status(200).json({
        success: true,
        data: fallbackData,
        fallback: true
      });
    }
  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction',
      error: error.message
    });
  }
};

// @desc    Update crowd data (called by AI service or cron)
// @route   POST /api/crowd/update
// @access  Private (Internal/Admin)
exports.updateCrowdData = async (req, res) => {
  try {
    const {
      templeId,
      crowdCount,
      densityLevel,
      zone,
      cameraId,
      imageUrl,
      confidence
    } = req.body;

    if (!templeId || crowdCount === undefined || !densityLevel) {
      return res.status(400).json({
        success: false,
        message: 'Temple ID, crowd count, and density level are required'
      });
    }

    const crowdData = await CrowdData.create({
      templeId,
      crowdCount,
      densityLevel,
      zone: zone || 'main',
      cameraId,
      imageUrl,
      prediction: {
        confidence: confidence || 0
      },
      source: 'ai-model'
    });

    // TODO: Emit WebSocket event to admin dashboard
    // emitToAdmins('crowd-updated', crowdData);

    res.status(201).json({
      success: true,
      message: 'Crowd data updated',
      data: crowdData
    });
  } catch (error) {
    console.error('Update crowd data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update crowd data',
      error: error.message
    });
  }
};

// @desc    Get crowd analytics
// @route   GET /api/crowd/analytics/:templeId
// @access  Private (Admin)
exports.getCrowdAnalytics = async (req, res) => {
  try {
    const { templeId } = req.params;
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await CrowdData.aggregate([
      {
        $match: {
          templeId,
          timestamp: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            hour: { $hour: '$timestamp' }
          },
          avgCount: { $avg: '$crowdCount' },
          maxCount: { $max: '$crowdCount' },
          peakDensity: { $max: '$densityLevel' }
        }
      },
      {
        $sort: { '_id.date': 1, '_id.hour': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};
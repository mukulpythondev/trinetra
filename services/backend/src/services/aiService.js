// src/services/aiService.js
const axios = require('axios');
const CrowdData = require('../models/CrowdData');

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

// Fetch crowd prediction from AI service
exports.fetchCrowdPrediction = async (templeId, imageUrl) => {
  try {
    const response = await axios.post(
      `${FASTAPI_URL}/api/crowd/predict`,
      {
        templeId,
        imageUrl
      },
      {
        timeout: 30000 // 30 seconds
      }
    );

    return response.data;
  } catch (error) {
    console.error('AI service error:', error.message);
    throw error;
  }
};

// Update crowd data periodically (called by cron job)
exports.updateCrowdDataFromAI = async (templeId, cameraId) => {
  try {
    console.log(`🔄 Updating crowd data for ${templeId}...`);

    // Call FastAPI AI service
    const response = await axios.get(
      `${FASTAPI_URL}/api/crowd/analyze`,
      {
        params: { templeId, cameraId },
        timeout: 20000
      }
    );

    const { crowdCount, densityLevel, confidence } = response.data;

    // Save to database
    const crowdData = await CrowdData.create({
      templeId,
      crowdCount,
      densityLevel,
      cameraId,
      prediction: { confidence },
      source: 'ai-model'
    });

    console.log(`✅ Crowd data updated: ${crowdCount} people (${densityLevel})`);

    return crowdData;
  } catch (error) {
    console.error('Update crowd data error:', error.message);
    
    // Save fallback data if AI service fails
    try {
      const fallbackData = await CrowdData.create({
        templeId,
        crowdCount: 0,
        densityLevel: 'low',
        cameraId,
        prediction: { confidence: 0 },
        source: 'manual'
      });
      return fallbackData;
    } catch (dbError) {
      console.error('Fallback save error:', dbError.message);
      return null;
    }
  }
};

// Get next day prediction from AI
exports.getNextDayPrediction = async (templeId) => {
  try {
    const response = await axios.get(
      `${FASTAPI_URL}/predict/`,
      { timeout: 15000 }
    );

    return response.data;
  } catch (error) {
    console.error('Next day prediction error:', error.message);
    
    // Fallback: Generate basic prediction based on historical data
    return generateFallbackPrediction(templeId);
  }
};

// Fallback prediction logic
const generateFallbackPrediction = async (templeId) => {
  try {
    // Get last 7 days average
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const historicalData = await CrowdData.aggregate([
      {
        $match: {
          templeId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: '$timestamp' },
          avgCount: { $avg: '$crowdCount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Generate 24-hour prediction
    const prediction = [];
    for (let hour = 0; hour < 24; hour++) {
      const historical = historicalData.find(d => d._id === hour);
      prediction.push({
        hour,
        hourLabel: `${hour}:00`,
        predictedCount: historical ? Math.round(historical.avgCount) : 50,
        confidence: historical ? 0.65 : 0.3
      });
    }

    return prediction;
  } catch (error) {
    console.error('Fallback prediction error:', error.message);
    
    // Ultimate fallback: return default values
    return Array.from({ length: 24 }, (_, hour) => ({
      hour,
      hourLabel: `${hour}:00`,
      predictedCount: 50,
      confidence: 0.3
    }));
  }
};
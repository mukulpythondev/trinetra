// src/controllers/locationController.js
const User = require('../models/User');
const { getDistance } = require('geolib');

// Temple coordinates from env
const TEMPLE_LAT = parseFloat(process.env.TEMPLE_LAT) || 21.8974;
const TEMPLE_LNG = parseFloat(process.env.TEMPLE_LNG) || 70.9629;
const TEMPLE_RADIUS = parseInt(process.env.TEMPLE_RADIUS) || 500; // meters

// @desc    Update user location
// @route   POST /api/location/update
// @access  Private
exports.updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Update user location
    const user = await User.findById(req.user.userId);
    await user.updateLocation(latitude, longitude);

    // Check if user is within temple radius
    const distanceFromTemple = getDistance(
      { latitude: TEMPLE_LAT, longitude: TEMPLE_LNG },
      { latitude, longitude }
    );

    const isWithinRadius = distanceFromTemple <= TEMPLE_RADIUS;

    res.status(200).json({
      success: true,
      message: 'Location updated',
      data: {
        latitude,
        longitude,
        isWithinTempleArea: isWithinRadius,
        distanceFromTemple: distanceFromTemple
      }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// @desc    Get active devotees near temple (Admin)
// @route   GET /api/location/active-devotees
// @access  Private (Admin)
exports.getActiveDevotees = async (req, res) => {
  try {
    const { templeId } = req.query;

    // For now, using single temple coordinates
    // In production, you'd have different coordinates for each temple
    const templeLat = TEMPLE_LAT;
    const templeLng = TEMPLE_LNG;
    const radius = TEMPLE_RADIUS;

    // Find users within radius whose location was updated in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const activeUsers = await User.find({
      role: 'user',
      'lastLocation.timestamp': { $gte: tenMinutesAgo },
      'lastLocation.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [templeLng, templeLat],
            radius / 6378100 // Earth's radius in meters
          ]
        }
      }
    }).select('name lastLocation').lean();

    // Calculate distance for each user
    const usersWithDistance = activeUsers.map(user => {
      const [lng, lat] = user.lastLocation.coordinates;
      const distance = getDistance(
        { latitude: templeLat, longitude: templeLng },
        { latitude: lat, longitude: lng }
      );

      return {
        id: user._id,
        name: user.name,
        latitude: lat,
        longitude: lng,
        distanceFromTemple: distance,
        lastUpdate: user.lastLocation.timestamp
      };
    });

    res.status(200).json({
      success: true,
      count: usersWithDistance.length,
      radius: radius,
      templeLocation: {
        latitude: templeLat,
        longitude: templeLng
      },
      data: usersWithDistance
    });
  } catch (error) {
    console.error('Get active devotees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active devotees',
      error: error.message
    });
  }
};

// @desc    Get heatmap data (Admin)
// @route   GET /api/location/heatmap
// @access  Private (Admin)
exports.getHeatmapData = async (req, res) => {
  try {
    const { templeId } = req.query;

    // Get users updated in last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const users = await User.find({
      role: 'user',
      'lastLocation.timestamp': { $gte: fifteenMinutesAgo }
    }).select('lastLocation').lean();

    // Format for heatmap
    const heatmapPoints = users
      .filter(user => user.lastLocation.coordinates[0] !== 0)
      .map(user => ({
        lat: user.lastLocation.coordinates[1],
        lng: user.lastLocation.coordinates[0],
        weight: 1 // Can be adjusted based on time or other factors
      }));

    res.status(200).json({
      success: true,
      count: heatmapPoints.length,
      data: heatmapPoints
    });
  } catch (error) {
    console.error('Get heatmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch heatmap data',
      error: error.message
    });
  }
};

// @desc    Get location statistics (Admin)
// @route   GET /api/location/stats
// @access  Private (Admin)
exports.getLocationStats = async (req, res) => {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    
    // Count active users in different time windows
    const last5Min = await User.countDocuments({
      role: 'user',
      'lastLocation.timestamp': { $gte: fiveMinutesAgo }
    });

    const last10Min = await User.countDocuments({
      role: 'user',
      'lastLocation.timestamp': { $gte: tenMinutesAgo }
    });

    // Count users within temple radius
    const withinRadius = await User.countDocuments({
      role: 'user',
      'lastLocation.timestamp': { $gte: tenMinutesAgo },
      'lastLocation.coordinates': {
        $geoWithin: {
          $centerSphere: [
            [TEMPLE_LNG, TEMPLE_LAT],
            TEMPLE_RADIUS / 6378100
          ]
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        activeLast5Min: last5Min,
        activeLast10Min: last10Min,
        withinTempleArea: withinRadius,
        templeRadius: TEMPLE_RADIUS
      }
    });
  } catch (error) {
    console.error('Get location stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch location statistics',
      error: error.message
    });
  }
};
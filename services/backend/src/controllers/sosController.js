// src/controllers/sosController.js
const SOS = require('../models/SOS');
const User = require('../models/User');

// @desc    Create SOS alert
// @route   POST /api/sos/create
// @access  Private
exports.createSOS = async (req, res) => {
  try {
    const { type, description, latitude, longitude, templeZone } = req.body;

    if (!type || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Type and location are required'
      });
    }

    // Determine priority based on type
    const priority = ['medical', 'fire', 'security'].includes(type) 
      ? 'critical' 
      : 'high';

    // Create SOS
    const sos = await SOS.create({
      userId: req.user.userId,
      type,
      description,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      templeZone,
      priority,
      status: 'active'
    });

    // Populate user details
    await sos.populate('userId', 'name phone');

    // Get all admins for notification tracking
    const admins = await User.find({ role: 'admin', isActive: true });

    // Mark admins as notified (for tracking purposes)
    admins.forEach(admin => {
      sos.notifiedAdmins.push({
        adminId: admin._id,
        notifiedAt: new Date()
      });
    });

    await sos.save();

    res.status(201).json({
      success: true,
      message: 'SOS alert created successfully. Admin team has been notified!',
      data: sos
    });
  } catch (error) {
    console.error('Create SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SOS alert',
      error: error.message
    });
  }
};

// @desc    Get all SOS alerts (Admin)
// @route   GET /api/sos/all
// @access  Private (Admin)
exports.getAllSOS = async (req, res) => {
  try {
    const { status, priority, type, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    } else {
      // By default, show active alerts
      query.status = { $in: ['active', 'acknowledged', 'in-progress'] };
    }

    if (priority) query.priority = priority;
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const sosAlerts = await SOS.find(query)
      .populate('userId', 'name phone email')
      .populate('assignedTo', 'name phone')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await SOS.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sosAlerts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: sosAlerts
    });
  } catch (error) {
    console.error('Get SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SOS alerts',
      error: error.message
    });
  }
};

// @desc    Get my SOS alerts
// @route   GET /api/sos/my-alerts
// @access  Private
exports.getMySOS = async (req, res) => {
  try {
    const sosAlerts = await SOS.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: sosAlerts.length,
      data: sosAlerts
    });
  } catch (error) {
    console.error('Get my SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your alerts',
      error: error.message
    });
  }
};

// @desc    Acknowledge SOS (Admin)
// @route   PUT /api/sos/:id/acknowledge
// @access  Private (Admin)
exports.acknowledgeSOS = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    await sos.acknowledge(req.user.userId);
    await sos.populate('userId assignedTo');

    res.status(200).json({
      success: true,
      message: 'SOS acknowledged',
      data: sos
    });
  } catch (error) {
    console.error('Acknowledge SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge SOS',
      error: error.message
    });
  }
};

// @desc    Mark SOS as in-progress (Admin)
// @route   PUT /api/sos/:id/in-progress
// @access  Private (Admin)
exports.markInProgress = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    await sos.markInProgress();

    res.status(200).json({
      success: true,
      message: 'SOS marked as in-progress',
      data: sos
    });
  } catch (error) {
    console.error('Mark in-progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SOS',
      error: error.message
    });
  }
};

// @desc    Resolve SOS (Admin)
// @route   PUT /api/sos/:id/resolve
// @access  Private (Admin)
exports.resolveSOS = async (req, res) => {
  try {
    const { resolutionNotes } = req.body;

    const sos = await SOS.findById(req.params.id);

    if (!sos) {
      return res.status(404).json({
        success: false,
        message: 'SOS alert not found'
      });
    }

    await sos.resolve(resolutionNotes);

    res.status(200).json({
      success: true,
      message: 'SOS resolved successfully',
      data: sos
    });
  } catch (error) {
    console.error('Resolve SOS error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve SOS',
      error: error.message
    });
  }
};

// @desc    Get SOS statistics (Admin)
// @route   GET /api/sos/stats
// @access  Private (Admin)
exports.getSOSStats = async (req, res) => {
  try {
    const activeCount = await SOS.getActiveCount();
    
    const totalToday = await SOS.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    const avgResponseTime = await SOS.aggregate([
      {
        $match: {
          responseTime: { $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' }
        }
      }
    ]);

    const byType = await SOS.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activeAlerts: activeCount,
        todayTotal: totalToday,
        avgResponseTime: Math.round(avgResponseTime[0]?.avgTime || 0),
        byType: byType
      }
    });
  } catch (error) {
    console.error('SOS stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SOS statistics',
      error: error.message
    });
  }
};
// src/controllers/ticketController.js
const Ticket = require('../models/Ticket');
const QRCode = require('qrcode');

// @desc    Book a ticket
// @route   POST /api/tickets/book
// @access  Private
exports.bookTicket = async (req, res) => {
  try {
    const {
      templeId,
      darshanType,
      slotTime,
      numberOfPeople,
      priorityCategory,
      specialRequirements
    } = req.body;

    // Check slot availability
    const existingTickets = await Ticket.countDocuments({
      templeId,
      slotTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    const maxCapacity = process.env.MAX_QUEUE_CAPACITY || 100;
    if (existingTickets >= maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'This slot is fully booked. Please choose another time.'
      });
    }

    // Create ticket
    const ticket = await Ticket.create({
      userId: req.user.userId,
      templeId,
      darshanType,
      slotTime,
      numberOfPeople,
      priorityCategory: priorityCategory || 'none',
      specialRequirements,
      status: 'pending'
    });

    // Generate queue number
    await ticket.generateQueueNumber();

    // Generate QR code
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      userId: req.user.userId,
      queueNumber: ticket.queueNumber
    });
    const qrCode = await QRCode.toDataURL(qrData);
    ticket.qrCode = qrCode;
    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Book ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book ticket',
      error: error.message
    });
  }
};

// @desc    Get user's tickets
// @route   GET /api/tickets/my-tickets
// @access  Private
exports.getMyTickets = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    let query = { userId: req.user.userId };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.slotTime = { $gte: new Date() };
    }

    const tickets = await Ticket.find(query)
      .sort({ slotTime: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets',
      error: error.message
    });
  }
};

// @desc    Get available slots
// @route   GET /api/tickets/slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    const { templeId, date } = req.query;

    if (!templeId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Temple ID and date are required'
      });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Define slot timings (6 AM to 9 PM, 30-min slots)
    const slots = [];
    const slotDuration = parseInt(process.env.QUEUE_SLOT_DURATION) || 30;
    const maxCapacity = parseInt(process.env.MAX_QUEUE_CAPACITY) || 100;

    for (let hour = 6; hour < 21; hour++) {
      for (let min = 0; min < 60; min += slotDuration) {
        const slotTime = new Date(selectedDate);
        slotTime.setHours(hour, min, 0, 0);

        if (slotTime >= startOfDay && slotTime <= endOfDay) {
          // Count booked tickets for this slot
          const bookedCount = await Ticket.countDocuments({
            templeId,
            slotTime,
            status: { $in: ['pending', 'confirmed'] }
          });

          slots.push({
            time: slotTime,
            available: maxCapacity - bookedCount,
            total: maxCapacity,
            isAvailable: bookedCount < maxCapacity
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slots',
      error: error.message
    });
  }
};

// @desc    Cancel ticket
// @route   PUT /api/tickets/:id/cancel
// @access  Private
exports.cancelTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'completed' || ticket.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this ticket'
      });
    }

    ticket.status = 'cancelled';
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ticket',
      error: error.message
    });
  }
};

// @desc    Check-in ticket (Admin only)
// @route   PUT /api/tickets/:id/checkin
// @access  Private (Admin)
exports.checkInTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.checkIn();

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: ticket
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error.message
    });
  }
};

// @desc    Get current queue status
// @route   GET /api/tickets/queue/:templeId
// @access  Public
exports.getQueueStatus = async (req, res) => {
  try {
    const { templeId } = req.params;

    const now = new Date();
    const currentHour = new Date(now.setMinutes(0, 0, 0));
    const nextHour = new Date(currentHour.getTime() + 60 * 60 * 1000);

    const currentQueue = await Ticket.find({
      templeId,
      slotTime: { $gte: currentHour, $lt: nextHour },
      status: { $in: ['confirmed', 'pending'] }
    }).sort({ queueNumber: 1 }).lean();

    const priorityQueue = await Ticket.find({
      templeId,
      slotTime: { $gte: currentHour, $lt: nextHour },
      priorityCategory: { $ne: 'none' },
      status: { $in: ['confirmed', 'pending'] }
    }).countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalInQueue: currentQueue.length,
        priorityQueue: priorityQueue,
        regularQueue: currentQueue.length - priorityQueue,
        estimatedWaitTime: currentQueue.length * 2, // 2 min per person
        queue: currentQueue
      }
    });
  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue status',
      error: error.message
    });
  }
};
// src/utils/helpers.js
const { getDistance } = require('geolib');

// Calculate distance between two points
exports.calculateDistance = (lat1, lng1, lat2, lng2) => {
  return getDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 }
  );
};

// Check if location is within radius
exports.isWithinRadius = (lat1, lng1, lat2, lng2, radius) => {
  const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
  return distance <= radius;
};

// Format date to YYYY-MM-DD
exports.formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get start and end of day
exports.getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

exports.getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Generate time slots
exports.generateTimeSlots = (startHour, endHour, slotDuration, date) => {
  const slots = [];
  const baseDate = new Date(date);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += slotDuration) {
      const slotTime = new Date(baseDate);
      slotTime.setHours(hour, min, 0, 0);
      slots.push(slotTime);
    }
  }
  
  return slots;
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

// Calculate estimated wait time
exports.calculateWaitTime = (queuePosition, avgServiceTime = 2) => {
  return queuePosition * avgServiceTime; // minutes
};

// Categorize crowd density
exports.categorizeDensity = (count) => {
  if (count < 50) return 'low';
  if (count < 150) return 'moderate';
  if (count < 300) return 'high';
  return 'critical';
};

// Generate random string
exports.generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Paginate results
exports.paginate = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return { skip, limit: parseInt(limit) };
};

// Format response
exports.successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

exports.errorResponse = (message = 'Error', error = null) => {
  const response = {
    success: false,
    message
  };
  if (error && process.env.NODE_ENV === 'development') {
    response.error = error;
  }
  return response;
};
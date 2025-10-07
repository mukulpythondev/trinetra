// src/config/constants.js

// Temple IDs
exports.TEMPLE_IDS = {
  KEDARNATH: 'kedarnath',
  
};

// Temple Coordinates
exports.TEMPLE_COORDINATES = {
  kedarnath: { lat: 20.8880, lng: 70.4013 },
};

// User Roles
exports.USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Ticket Status
exports.TICKET_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show'
};

// SOS Types
exports.SOS_TYPES = {
  MEDICAL: 'medical',
  SECURITY: 'security',
  LOST_CHILD: 'lost-child',
  LOST_PERSON: 'lost-person',
  FIRE: 'fire',
  OTHER: 'other'
};

// SOS Status
exports.SOS_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled'
};

// Priority Levels
exports.PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Crowd Density Levels
exports.DENSITY_LEVELS = {
  LOW: 'low',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Priority Categories
exports.PRIORITY_CATEGORIES = {
  NONE: 'none',
  ELDERLY: 'elderly',
  DIFFERENTLY_ABLED: 'differently-abled',
  PREGNANT: 'pregnant',
  CHILD: 'child'
};

// Darshan Types
exports.DARSHAN_TYPES = {
  REGULAR: 'regular',
  VIP: 'vip',
  SPECIAL: 'special'
};

// Default Settings
exports.DEFAULT_SETTINGS = {
  TEMPLE_RADIUS: 500, // meters
  QUEUE_SLOT_DURATION: 30, // minutes
  MAX_QUEUE_CAPACITY: 100,
  CROWD_UPDATE_INTERVAL: 300000, // 5 minutes in milliseconds
  LOCATION_UPDATE_THRESHOLD: 600000 // 10 minutes
};
// server.js
require('dotenv').config();
const http = require('http');
const cron = require('node-cron');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { updateCrowdDataFromAI } = require('./src/services/aiService');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Start server
server.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🙏 Temple Crowd Management System - Backend API');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
  console.log('═══════════════════════════════════════════════════════');
});

// Cron job: Update crowd data every 5 minutes
const updateInterval = parseInt(process.env.CROWD_MODEL_UPDATE_INTERVAL) || 300000;
const cronSchedule = `*/${Math.floor(updateInterval / 60000)} * * * *`;

cron.schedule(cronSchedule, async () => {
  logger.info('⏰ Running crowd data update cron job...');
  
  // Update for each temple
  const temples = ['kedarnath'];
  
  for (const temple of temples) {
    try {
      await updateCrowdDataFromAI(temple, `${temple}_main_camera`);
      logger.info(`✅ ${temple} crowd data updated`);
    } catch (error) {
      logger.error(`❌ Error updating ${temple}: ${error.message}`);
    }
  }
});

logger.info(`⏰ Crowd update cron job scheduled (every ${Math.floor(updateInterval / 60000)} minutes)`);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('🛑 Server closed');
    process.exit(0);
  });
});

module.exports = server;
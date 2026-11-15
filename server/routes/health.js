import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'healthy',
    project: 'Pet Rescue API',
    module: 'Module 0: Foundation',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus,
      readyState: mongoose.connection.readyState,
    },
    uptime: `${Math.floor(process.uptime())} seconds`,
  });
});

export default router;

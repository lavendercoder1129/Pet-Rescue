import express from 'express';
import healthRoutes from './health.js';

const router = express.Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Base route for API documentation / ping
router.get('/', (req, res) => {
  res.json({
    name: 'Pet Rescue API',
    description: 'Emergency Rescue Case Coordination & Simulated Donor Funding System',
    version: '0.1.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/health',
    },
  });
});

export default router;

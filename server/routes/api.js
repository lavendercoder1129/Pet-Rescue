import express from 'express';
import healthRoutes from './health.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication endpoints (/api/auth)
router.use('/auth', authRoutes);

// Admin endpoints (/api/admin)
router.use('/admin', adminRoutes);

// Base route for API documentation / ping
router.get('/', (req, res) => {
  res.json({
    name: 'Pet Rescue API',
    description: 'Emergency Rescue Case Coordination & Simulated Donor Funding System',
    version: '0.2.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
      },
      admin: {
        dashboard: 'GET /api/admin/dashboard',
        users: 'GET /api/admin/users',
      },
    },
  });
});

export default router;

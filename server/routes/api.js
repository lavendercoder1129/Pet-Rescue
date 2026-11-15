import express from 'express';
import healthRoutes from './health.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import caseRoutes from './caseRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import donationRoutes from './donationRoutes.js';
import transparencyRoutes from './transparencyRoutes.js';
import expenseRoutes from './expenseRoutes.js';

const router = express.Router();

// Health check endpoint
router.use('/health', healthRoutes);

// Authentication endpoints (/api/auth)
router.use('/auth', authRoutes);

// Rescue case endpoints (/api/cases)
router.use('/cases', caseRoutes);

// Donation endpoints (/api/donations)
router.use('/donations', donationRoutes);

// Expense endpoints (/api/expenses)
router.use('/expenses', expenseRoutes);

// Admin endpoints (/api/admin)
router.use('/admin', adminRoutes);

// Notification endpoints (/api/notifications)
router.use('/notifications', notificationRoutes);

// Transparency endpoints (/api/transparency)
router.use('/transparency', transparencyRoutes);

// Base route for API documentation / ping
router.get('/', (req, res) => {
  res.json({
    name: 'Pet Rescue API',
    description: 'Emergency Rescue Case Coordination & Simulated Donor Funding System',
    version: '0.3.0',
    documentation: '/docs',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
      },
      cases: {
        publicList: 'GET /api/cases',
        publicDetail: 'GET /api/cases/:id',
        submit: 'POST /api/cases',
        myCases: 'GET /api/cases/my',
        adminList: 'GET /api/cases/admin/all',
        adminApprove: 'PATCH /api/cases/admin/:id/approve',
        adminReject: 'PATCH /api/cases/admin/:id/reject',
      },
    },
  });
});

export default router;

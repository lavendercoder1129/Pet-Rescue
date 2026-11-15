import express from 'express';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Admin metrics & overview
 * @access  Private (Admin only)
 */
router.get('/dashboard', verifyAuth, requireRoles('admin'), async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalRescuers = await User.countDocuments({ role: 'rescuer' });
  const pendingRescuers = await User.countDocuments({
    role: 'rescuer',
    rescuerVerificationStatus: 'pending',
  });
  const totalDonors = await User.countDocuments({ role: 'donor' });

  res.status(200).json({
    success: true,
    message: 'Welcome to Admin Dashboard',
    stats: {
      totalUsers,
      totalDonors,
      totalRescuers,
      pendingRescuers,
    },
  });
});

/**
 * @route   GET /api/admin/users
 * @desc    List all registered users for admin review
 * @access  Private (Admin only)
 */
router.get('/users', verifyAuth, requireRoles('admin'), async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
});

/**
 * @route   PATCH /api/admin/rescuers/:id/verify
 * @desc    Approve or reject a rescuer verification status
 * @access  Private (Admin only)
 */
router.patch(
  '/rescuers/:id/verify',
  verifyAuth,
  requireRoles('admin'),
  async (req, res) => {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved, rejected, or pending.',
      });
    }

    const rescuer = await User.findById(req.params.id);
    if (!rescuer || rescuer.role !== 'rescuer') {
      return res.status(404).json({
        success: false,
        message: 'Rescuer account not found.',
      });
    }

    rescuer.rescuerVerificationStatus = status;
    await rescuer.save();

    res.status(200).json({
      success: true,
      message: `Rescuer status updated to ${status}.`,
      rescuer,
    });
  }
);

export default router;

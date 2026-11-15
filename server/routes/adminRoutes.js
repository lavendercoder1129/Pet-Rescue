import express from 'express';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import User from '../models/User.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';
import FundAllocation from '../models/FundAllocation.js';
import Expense from '../models/Expense.js';
import RescueUpdate from '../models/RescueUpdate.js';
import Announcement from '../models/Announcement.js';
import Achievement from '../models/Achievement.js';
import {
  getAdminCases,
  getAdminCaseStats,
  getAdminCaseById,
  getCaseAuditHistory,
  approveCase,
  rejectCase,
} from '../controllers/caseController.js';
import {
  getAdminDonations,
  getAdminDonationStats,
} from '../controllers/donationController.js';
import {
  getAdminFundsSummary,
  getAdminAllocations,
  createFundAllocation,
  getAdminCaseFinancials,
} from '../controllers/fundController.js';
import {
  getAdminExpenses,
  getAdminExpenseById,
  approveExpense,
  rejectExpense,
} from '../controllers/expenseController.js';
import {
  getAdminRescueUpdates,
  approveRescueUpdate,
  rejectRescueUpdate,
} from '../controllers/rescueUpdateController.js';
import {
  getAdminAchievements,
  createAdminAchievement,
  updateAdminAchievement,
  toggleAdminAchievementStatus,
} from '../controllers/achievementController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/dashboard
 * @desc    Comprehensive Admin metrics & module summaries
 * @access  Private (Admin only)
 */
router.get('/dashboard', verifyAuth, requireRoles('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalDonors,
      totalRescuers,
      pendingRescuers,
      verifiedRescuers,
      rejectedRescuers,
      pendingCases,
      approvedCases,
      rejectedCases,
      activeCases,
      resolvedCases,
      totalCases,
      donationStats,
      allocationStats,
      expenseStats,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      pendingUpdates,
      publishedUpdates,
      announcementsCount,
      achievementsCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'rescuer' }),
      User.countDocuments({ role: 'rescuer', rescuerVerificationStatus: 'pending' }),
      User.countDocuments({ role: 'rescuer', rescuerVerificationStatus: 'approved' }),
      User.countDocuments({ role: 'rescuer', rescuerVerificationStatus: 'rejected' }),
      RescueCase.countDocuments({ verificationStatus: 'Pending' }),
      RescueCase.countDocuments({ verificationStatus: 'Approved' }),
      RescueCase.countDocuments({ verificationStatus: 'Rejected' }),
      RescueCase.countDocuments({ verificationStatus: 'Approved', campaignStatus: 'Active' }),
      RescueCase.countDocuments({ campaignStatus: { $in: ['Resolved', 'Closed'] } }),
      RescueCase.countDocuments(),
      Donation.aggregate([
        { $match: { isSimulated: true, transactionStatus: 'Simulated' } },
        { $group: { _id: null, totalSimulatedDonations: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      FundAllocation.aggregate([
        { $match: { isSimulated: true, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, totalAllocatedFunds: { $sum: '$amount' }, totalSpent: { $sum: '$amountSpent' } } },
      ]),
      Expense.aggregate([
        { $match: { isSimulated: true, verificationStatus: 'Approved' } },
        { $group: { _id: null, totalApprovedExpenses: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.countDocuments({ verificationStatus: 'Pending' }),
      Expense.countDocuments({ verificationStatus: 'Approved' }),
      Expense.countDocuments({ verificationStatus: 'Rejected' }),
      RescueUpdate.countDocuments({ status: 'pending' }),
      RescueUpdate.countDocuments({ status: 'published' }),
      Announcement.countDocuments(),
      Achievement.countDocuments(),
    ]);

    const totalSimulatedDonations = donationStats[0]?.totalSimulatedDonations || 0;
    const totalDonationsCount = donationStats[0]?.count || 0;
    const totalAllocatedFunds = allocationStats[0]?.totalAllocatedFunds || 0;
    const totalApprovedExpenses = expenseStats[0]?.totalApprovedExpenses || 0;

    res.status(200).json({
      success: true,
      message: 'Welcome to Admin Dashboard',
      stats: {
        totalUsers,
        totalDonors,
        totalRescuers,
        pendingRescuers,
        verifiedRescuers,
        rejectedRescuers,
        pendingCases,
        approvedCases,
        rejectedCases,
        activeCases,
        resolvedCases,
        totalCases,
        totalSimulatedDonations,
        totalDonationsCount,
        totalAllocatedFunds,
        totalApprovedExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        pendingUpdates,
        publishedUpdates,
        announcementsCount,
        achievementsCount,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
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

/**
 * Case Verification Admin Endpoints under /api/admin/cases
 */
router.get('/cases/stats', verifyAuth, requireRoles('admin'), getAdminCaseStats);
router.get('/cases', verifyAuth, requireRoles('admin'), getAdminCases);
router.get('/cases/:id', verifyAuth, requireRoles('admin'), getAdminCaseById);
router.get('/cases/:id/history', verifyAuth, requireRoles('admin'), getCaseAuditHistory);
router.patch('/cases/:id/approve', verifyAuth, requireRoles('admin'), approveCase);
router.patch('/cases/:id/reject', verifyAuth, requireRoles('admin'), rejectCase);

/**
 * Admin Donations Overview Endpoints under /api/admin/donations
 */
router.get('/donations/stats', verifyAuth, requireRoles('admin'), getAdminDonationStats);
router.get('/donations', verifyAuth, requireRoles('admin'), getAdminDonations);

/**
 * Admin Fund Allocation Endpoints under /api/admin/funds
 */
router.get('/funds/summary', verifyAuth, requireRoles('admin'), getAdminFundsSummary);
router.get('/funds/allocations', verifyAuth, requireRoles('admin'), getAdminAllocations);
router.post('/funds/allocations', verifyAuth, requireRoles('admin'), createFundAllocation);
router.get('/funds/cases/:caseId', verifyAuth, requireRoles('admin'), getAdminCaseFinancials);

/**
 * Admin Expense Verification Endpoints under /api/admin/expenses
 */
router.get('/expenses', verifyAuth, requireRoles('admin'), getAdminExpenses);
router.get('/expenses/:id', verifyAuth, requireRoles('admin'), getAdminExpenseById);
router.patch('/expenses/:id/approve', verifyAuth, requireRoles('admin'), approveExpense);
router.patch('/expenses/:id/reject', verifyAuth, requireRoles('admin'), rejectExpense);

/**
 * Admin Rescue Updates Moderation Endpoints under /api/admin/rescue-updates
 */
router.get('/rescue-updates', verifyAuth, requireRoles('admin'), getAdminRescueUpdates);
router.patch('/rescue-updates/:id/approve', verifyAuth, requireRoles('admin'), approveRescueUpdate);
router.patch('/rescue-updates/:id/reject', verifyAuth, requireRoles('admin'), rejectRescueUpdate);

/**
 * Admin Achievements & Badges Endpoints under /api/admin/achievements
 */
router.get('/achievements', verifyAuth, requireRoles('admin'), getAdminAchievements);
router.post('/achievements', verifyAuth, requireRoles('admin'), createAdminAchievement);
router.patch('/achievements/:id', verifyAuth, requireRoles('admin'), updateAdminAchievement);
router.patch('/achievements/:id/status', verifyAuth, requireRoles('admin'), toggleAdminAchievementStatus);

export default router;

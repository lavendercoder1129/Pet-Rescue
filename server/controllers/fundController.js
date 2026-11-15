import crypto from 'crypto';
import mongoose from 'mongoose';
import FundAllocation from '../models/FundAllocation.js';
import RescueCase from '../models/RescueCase.js';
import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';

/**
 * Generate a unique allocation reference code
 * Format: ALLOC-YYYYMMDD-XXXXXX
 */
const generateAllocationRef = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ALLOC-${dateStr}-${randomSuffix}`;
};

/**
 * Helper to compute financial metrics for a single case
 * Total Donations = sum of simulated donations for that case
 * Total Allocated = sum of active/spent fund allocations (excluding Cancelled)
 * Total Verified Spending = sum of verified expenses approved through Module 8 (amountSpent)
 * Remaining Allocated Balance = Total Allocated - Total Verified Spending
 * Unallocated Funds = Math.max(0, Total Donations - Total Allocated)
 * Fund Utilization = Total Allocated > 0 ? (Total Verified Spending / Total Allocated) * 100 : 0
 */
export const calculateCaseFinancials = async (caseId) => {
  const caseObjId = new mongoose.Types.ObjectId(caseId);

  // 1. Total Donations
  const donationAgg = await Donation.aggregate([
    { $match: { rescueCase: caseObjId, transactionStatus: 'Simulated' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const totalDonations = donationAgg.length > 0 ? donationAgg[0].total : 0;
  const donorCount = donationAgg.length > 0 ? donationAgg[0].count : 0;

  // 2. Active Allocations (status != 'Cancelled')
  const allocAgg = await FundAllocation.aggregate([
    { $match: { rescueCase: caseObjId, status: { $ne: 'Cancelled' } } },
    {
      $group: {
        _id: null,
        totalAllocated: { $sum: '$amount' },
        totalSpent: { $sum: '$amountSpent' },
        allocCount: { $sum: 1 },
      },
    },
  ]);
  const totalAllocated = allocAgg.length > 0 ? allocAgg[0].totalAllocated : 0;
  const totalVerifiedSpending = allocAgg.length > 0 ? allocAgg[0].totalSpent : 0;

  const remainingAllocatedBalance = Math.max(0, totalAllocated - totalVerifiedSpending);
  const unallocatedFunds = Math.max(0, totalDonations - totalAllocated);
  const fundUtilization =
    totalAllocated > 0
      ? Math.min(100, Math.round((totalVerifiedSpending / totalAllocated) * 100))
      : 0;

  return {
    totalDonations,
    donorCount,
    totalAllocated,
    totalVerifiedSpending,
    remainingAllocatedBalance,
    unallocatedFunds,
    fundUtilization,
  };
};

/**
 * @route   GET /api/transparency/summary
 * @desc    Public aggregated financial statistics across all cases
 * @access  Public
 */
export const getTransparencySummary = async (req, res, next) => {
  try {
    const [donationsAgg, allocAgg, casesCount] = await Promise.all([
      Donation.aggregate([
        { $match: { transactionStatus: 'Simulated' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      FundAllocation.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: null,
            totalAllocated: { $sum: '$amount' },
            totalSpent: { $sum: '$amountSpent' },
            count: { $sum: 1 },
          },
        },
      ]),
      RescueCase.countDocuments({ verificationStatus: 'Approved' }),
    ]);

    const totalDonations = donationsAgg.length > 0 ? donationsAgg[0].total : 0;
    const totalAllocated = allocAgg.length > 0 ? allocAgg[0].totalAllocated : 0;
    const totalVerifiedSpending = allocAgg.length > 0 ? allocAgg[0].totalSpent : 0;

    const remainingAllocatedFunds = Math.max(0, totalAllocated - totalVerifiedSpending);
    const unallocatedFunds = Math.max(0, totalDonations - totalAllocated);
    const overallUtilization =
      totalAllocated > 0
        ? Math.min(100, Math.round((totalVerifiedSpending / totalAllocated) * 100))
        : 0;

    // Category distribution for charts
    const categoryDistribution = await FundAllocation.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$allocationCategory',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.status(200).json({
      success: true,
      isSimulated: true,
      disclaimer:
        'These figures are generated within an academic demonstration system. They do not represent actual donations, payments, or financial transfers.',
      stats: {
        totalDonations,
        totalAllocated,
        totalVerifiedSpending,
        remainingAllocatedFunds,
        unallocatedFunds,
        overallUtilization,
        approvedCasesCount: casesCount,
        categoryDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/transparency/cases
 * @desc    Public campaign-level transparency cards with sanitized financial summaries
 * @access  Public
 */
export const getTransparencyCases = async (req, res, next) => {
  try {
    const { search = '', page = 1, limit = 12 } = req.query;

    const filter = { verificationStatus: 'Approved' };
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: regex }, { animalName: regex }, { location: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [cases, totalCount] = await Promise.all([
      RescueCase.find(filter)
        .select('title animalName animalType location urgencyLevel fundraisingGoal amountCollected images campaignStatus createdAt')
        .sort({ amountCollected: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RescueCase.countDocuments(filter),
    ]);

    // Attach financial calculation to each case
    const caseSummaries = await Promise.all(
      cases.map(async (c) => {
        const financials = await calculateCaseFinancials(c._id);
        return {
          ...c,
          financials,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: caseSummaries.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      cases: caseSummaries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/funds/summary
 * @desc    Complete financial overview for admin dashboard
 * @access  Private (Admin only)
 */
export const getAdminFundsSummary = async (req, res, next) => {
  try {
    const [donationsAgg, allocAgg, casesAgg, categoryAgg] = await Promise.all([
      Donation.aggregate([
        { $match: { transactionStatus: 'Simulated' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      FundAllocation.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: null,
            totalAllocated: { $sum: '$amount' },
            totalSpent: { $sum: '$amountSpent' },
            count: { $sum: 1 },
          },
        },
      ]),
      RescueCase.aggregate([
        { $match: { verificationStatus: 'Approved' } },
        { $group: { _id: '$campaignStatus', count: { $sum: 1 } } },
      ]),
      FundAllocation.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: '$allocationCategory',
            allocated: { $sum: '$amount' },
            spent: { $sum: '$amountSpent' },
            count: { $sum: 1 },
          },
        },
        { $sort: { allocated: -1 } },
      ]),
    ]);

    const totalDonations = donationsAgg.length > 0 ? donationsAgg[0].total : 0;
    const totalAllocated = allocAgg.length > 0 ? allocAgg[0].totalAllocated : 0;
    const totalVerifiedSpending = allocAgg.length > 0 ? allocAgg[0].totalSpent : 0;
    const totalAllocationsCount = allocAgg.length > 0 ? allocAgg[0].count : 0;

    const remainingAllocatedBalance = Math.max(0, totalAllocated - totalVerifiedSpending);
    const unallocatedFunds = Math.max(0, totalDonations - totalAllocated);
    const overallUtilization =
      totalAllocated > 0
        ? Math.min(100, Math.round((totalVerifiedSpending / totalAllocated) * 100))
        : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        totalAllocated,
        totalVerifiedSpending,
        unallocatedFunds,
        remainingAllocatedBalance,
        overallUtilization,
        totalAllocationsCount,
        categoryBreakdown: categoryAgg,
        campaignStatusCounts: casesAgg,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/funds/allocations
 * @desc    Get allocation records with filtering, search, and pagination
 * @access  Private (Admin only)
 */
export const getAdminAllocations = async (req, res, next) => {
  try {
    const {
      caseId,
      category,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      filter.rescueCase = caseId;
    }

    if (category && category !== 'All') {
      filter.allocationCategory = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [allocations, totalCount] = await Promise.all([
      FundAllocation.find(filter)
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
        .populate('allocatedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      FundAllocation.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: allocations.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      allocations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/admin/funds/allocations
 * @desc    Allocate available unallocated funds to an approved rescue case
 * @access  Private (Admin only)
 */
export const createFundAllocation = async (req, res, next) => {
  try {
    const adminUser = req.user;
    const {
      caseId,
      amount,
      allocationCategory,
      description,
    } = req.body;

    // 1. Validate ID
    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid rescue case ID is required.',
      });
    }

    // 2. Validate Amount
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Allocation amount must be a positive number greater than zero.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'An explanation / justification description is required for fund allocation.',
      });
    }

    // 3. Retrieve Case
    const rescueCase = await RescueCase.findById(caseId);
    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    if (rescueCase.verificationStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Funds can only be allocated to Approved rescue cases.',
      });
    }

    // 4. Calculate current unallocated funds on backend to prevent over-allocation
    const financials = await calculateCaseFinancials(caseId);

    if (numAmount > financials.unallocatedFunds) {
      return res.status(400).json({
        success: false,
        message: `Allocation amount (₹${numAmount.toLocaleString()}) exceeds available unallocated funds (₹${financials.unallocatedFunds.toLocaleString()}).`,
      });
    }

    // 5. Generate unique allocation reference
    let allocationReference = generateAllocationRef();
    let collision = await FundAllocation.findOne({ allocationReference });
    while (collision) {
      allocationReference = generateAllocationRef();
      collision = await FundAllocation.findOne({ allocationReference });
    }

    // 6. Create Allocation
    const allocation = await FundAllocation.create({
      rescueCase: rescueCase._id,
      amount: numAmount,
      allocationCategory: allocationCategory || 'Emergency treatment',
      description: description.trim(),
      allocatedBy: adminUser._id,
      allocationReference,
      status: 'Active',
      amountSpent: 0,
      isSimulated: true,
    });

    // 7. Audit Log
    await AuditLog.create({
      caseId: rescueCase._id,
      adminId: adminUser._id,
      action: 'Reopened', // or custom audit log action
      previousStatus: rescueCase.verificationStatus,
      newStatus: rescueCase.verificationStatus,
      reviewNote: `Allocated ₹${numAmount.toLocaleString()} to "${allocation.allocationCategory}". Ref: ${allocationReference}. Note: ${description.trim()}`,
      timestamp: new Date(),
    }).catch(() => {});

    // Compute updated financials
    const updatedFinancials = await calculateCaseFinancials(caseId);

    const populatedAlloc = await FundAllocation.findById(allocation._id)
      .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
      .populate('allocatedBy', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      message: `Successfully allocated ₹${numAmount.toLocaleString()} to ${rescueCase.animalName}.`,
      allocation: populatedAlloc,
      caseFinancials: updatedFinancials,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/funds/cases/:caseId
 * @desc    Get detailed financial & allocation breakdown for a single case
 * @access  Private (Admin only)
 */
export const getAdminCaseFinancials = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid rescue case ID is required.',
      });
    }

    const rescueCase = await RescueCase.findById(caseId)
      .populate('createdBy', 'name email phone')
      .lean();

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const [financials, allocations, recentDonations] = await Promise.all([
      calculateCaseFinancials(caseId),
      FundAllocation.find({ rescueCase: caseId })
        .populate('allocatedBy', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      Donation.find({ rescueCase: caseId, transactionStatus: 'Simulated' })
        .populate('donor', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      case: rescueCase,
      financials,
      allocations,
      recentDonations,
    });
  } catch (error) {
    next(error);
  }
};

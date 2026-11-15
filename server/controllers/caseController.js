import mongoose from 'mongoose';
import RescueCase from '../models/RescueCase.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { calculateCaseFinancials } from './fundController.js';

/**
 * @route   GET /api/cases
 * @desc    Get approved & active rescue campaigns for public exploration
 * @access  Public
 */
export const getPublicCases = async (req, res, next) => {
  try {
    const {
      search,
      animalType,
      urgencyLevel,
      campaignStatus = 'Active',
      sort = 'recent',
      page = 1,
      limit = 12,
    } = req.query;

    // Strict Security Constraint: Public listing ONLY reveals Approved cases
    const filter = {
      verificationStatus: 'Approved',
    };

    // Filter by campaign status if provided (default Active or Resolved)
    if (campaignStatus && campaignStatus !== 'All') {
      filter.campaignStatus = campaignStatus;
    } else {
      filter.campaignStatus = { $in: ['Active', 'Resolved'] };
    }

    // Filter by animal type
    if (animalType && animalType !== 'All') {
      filter.animalType = animalType;
    }

    // Filter by urgency level
    if (urgencyLevel && urgencyLevel !== 'All') {
      filter.urgencyLevel = urgencyLevel;
    }

    // Search query on title, animalName, or location
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { animalName: regex },
        { location: regex },
        { injuryType: regex },
      ];
    }

    // Sorting logic
    let sortOption = { createdAt: -1 }; // default: most recent
    if (sort === 'urgency') {
      // Custom mapping: Critical -> Urgent -> Normal
      // Since urgencyLevel is string, we can sort or combine with pipeline, or use secondary sort
      sortOption = { urgencyLevel: 1, createdAt: -1 };
    } else if (sort === 'progress') {
      sortOption = { amountCollected: -1 };
    } else if (sort === 'goal_asc') {
      sortOption = { fundraisingGoal: 1 };
    } else if (sort === 'goal_desc') {
      sortOption = { fundraisingGoal: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [cases, totalCount] = await Promise.all([
      RescueCase.find(filter)
        .populate('createdBy', 'name email phone')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RescueCase.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: cases.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      cases,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/cases/:id
 * @desc    Get detailed view of a single approved rescue case
 * @access  Public
 */
export const getPublicCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let rescueCase = null;
    // Check if ID is a valid MongoDB ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      rescueCase = await RescueCase.findById(id)
        .populate('createdBy', 'name email phone')
        .lean();
    } else {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Strict Security Constraint: Public visitors cannot view Pending or Rejected cases
    if (rescueCase.verificationStatus !== 'Approved') {
      return res.status(404).json({
        success: false,
        message: 'Rescue case is not publicly available or pending review.',
      });
    }

    // Calculate real-time fund transparency breakdown
    const financials = await calculateCaseFinancials(rescueCase._id);

    res.status(200).json({
      success: true,
      case: {
        ...rescueCase,
        financials,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/cases
 * @desc    Submit a new emergency rescue case for admin review
 * @access  Private (Rescuer only, requires approved verification)
 */
export const createRescueCase = async (req, res, next) => {
  try {
    const user = req.user;

    // Rescuer authorization check
    if (user.role !== 'rescuer' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only registered Rescuers can submit emergency rescue cases.',
      });
    }

    // Require approved rescuer verification status
    if (user.role === 'rescuer' && user.rescuerVerificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message:
          'Your rescuer account is currently in Pending verification status. You must be approved by an administrator before submitting live rescue cases.',
      });
    }

    const {
      title,
      animalName,
      animalType,
      breed,
      age,
      gender,
      location,
      description,
      injuryType,
      injuryDescription,
      medicalCondition,
      urgencyLevel,
      estimatedTreatmentCost,
      fundraisingGoal,
    } = req.body;

    // Validation
    if (!title || !animalName || !location || !description || !injuryDescription || !medicalCondition) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required basic and medical information.',
      });
    }

    const costNum = Number(estimatedTreatmentCost);
    const goalNum = Number(fundraisingGoal);

    if (isNaN(costNum) || costNum < 100) {
      return res.status(400).json({
        success: false,
        message: 'Estimated treatment cost must be at least ₹100.',
      });
    }

    if (isNaN(goalNum) || goalNum < 100) {
      return res.status(400).json({
        success: false,
        message: 'Fundraising goal must be at least ₹100.',
      });
    }

    // Handle uploaded files
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        // Store relative path accessible via static express route /uploads/cases/
        images.push(`/uploads/cases/${file.filename}`);
      });
    } else if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      images.push(...req.body.imageUrls);
    }

    // Create case - Strictly defaults to Pending
    const newCase = await RescueCase.create({
      title: title.trim(),
      animalName: animalName.trim(),
      animalType: animalType || 'Dog',
      breed: breed ? breed.trim() : 'Indie / Mixed Breed',
      age: age ? age.trim() : 'Unknown Age',
      gender: gender || 'Unknown',
      location: location.trim(),
      description: description.trim(),
      injuryType: injuryType ? injuryType.trim() : 'General Trauma',
      injuryDescription: injuryDescription.trim(),
      medicalCondition: medicalCondition.trim(),
      urgencyLevel: urgencyLevel || 'Urgent',
      estimatedTreatmentCost: costNum,
      fundraisingGoal: goalNum,
      amountCollected: 0,
      campaignStatus: 'Pending',
      verificationStatus: 'Pending', // Frontend cannot bypass
      images,
      createdBy: user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Rescue case submitted successfully and queued for administrative verification.',
      case: newCase,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/cases/my
 * @desc    Get cases submitted by the currently authenticated rescuer
 * @access  Private (Rescuer only)
 */
export const getMyCases = async (req, res, next) => {
  try {
    const user = req.user;

    const cases = await RescueCase.find({ createdBy: user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/cases/stats
 * @desc    Get aggregate verification metrics for admin dashboard
 * @access  Private (Admin only)
 */
export const getAdminCaseStats = async (req, res, next) => {
  try {
    const [totalCases, pendingCases, approvedCases, rejectedCases, criticalCases] =
      await Promise.all([
        RescueCase.countDocuments(),
        RescueCase.countDocuments({ verificationStatus: 'Pending' }),
        RescueCase.countDocuments({ verificationStatus: 'Approved' }),
        RescueCase.countDocuments({ verificationStatus: 'Rejected' }),
        RescueCase.countDocuments({ urgencyLevel: 'Critical' }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCases,
        pendingCases,
        approvedCases,
        rejectedCases,
        criticalCases,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/cases
 * @desc    Get all submitted rescue cases for administrative review with search, sort, filter, pagination
 * @access  Private (Admin only)
 */
export const getAdminCases = async (req, res, next) => {
  try {
    const {
      status = 'All',
      search = '',
      sort = 'newest',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};
    if (status && status !== 'All') {
      filter.verificationStatus = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { title: regex },
        { animalName: regex },
        { location: regex },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'urgency') {
      // Urgent ordering: Critical, Urgent, Normal
      sortOption = { urgencyLevel: 1, createdAt: -1 };
    } else if (sort === 'updated') {
      sortOption = { updatedAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // To allow searching by rescuer name, we can check if search matches users or populate
    let finalFilter = filter;
    if (search && search.trim()) {
      // Find rescuer IDs matching name
      const User = mongoose.model('User');
      const matchingRescuers = await User.find({
        name: new RegExp(search.trim(), 'i'),
      }).select('_id');
      const rescuerIds = matchingRescuers.map((r) => r._id);

      finalFilter = {
        ...filter,
        $or: [
          ...(filter.$or || []),
          { createdBy: { $in: rescuerIds } },
        ],
      };
    }

    const [cases, totalCount] = await Promise.all([
      RescueCase.find(finalFilter)
        .populate('createdBy', 'name email phone rescuerVerificationStatus')
        .populate('reviewedBy', 'name email')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RescueCase.countDocuments(finalFilter),
    ]);

    // Critical count specifically for alert banner if needed
    const criticalCount = await RescueCase.countDocuments({
      urgencyLevel: 'Critical',
      verificationStatus: 'Pending',
    });

    res.status(200).json({
      success: true,
      count: cases.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      criticalPendingCount: criticalCount,
      cases,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/cases/:id
 * @desc    Get complete administrative information for a case including previous submissions
 * @access  Private (Admin only)
 */
export const getAdminCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const rescueCase = await RescueCase.findById(id)
      .populate('createdBy', 'name email phone rescuerVerificationStatus createdAt')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Previous submitted cases by this rescuer
    let rescuerPreviousCases = [];
    if (rescueCase.createdBy?._id) {
      rescuerPreviousCases = await RescueCase.find({
        createdBy: rescueCase.createdBy._id,
        _id: { $ne: rescueCase._id },
      })
        .select('title animalName verificationStatus campaignStatus urgencyLevel createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    }

    res.status(200).json({
      success: true,
      case: rescueCase,
      rescuerPreviousCases,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/cases/:id/history
 * @desc    Get audit history trail for a rescue case
 * @access  Private (Admin only)
 */
export const getCaseAuditHistory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const history = await AuditLog.find({ caseId: id })
      .populate('adminId', 'name email role')
      .sort({ timestamp: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/cases/:id/approve
 * @desc    Approve a rescue case, activating its campaign
 * @access  Private (Admin only)
 */
export const approveCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;
    const adminUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const rescueCase = await RescueCase.findById(id);

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Guard: Prevent repeated decisions without re-review
    if (rescueCase.verificationStatus === 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'This rescue case has already been approved.',
      });
    }

    const previousStatus = rescueCase.verificationStatus;
    const cleanNote = reviewNote ? String(reviewNote).trim().slice(0, 1000) : '';

    rescueCase.verificationStatus = 'Approved';
    rescueCase.campaignStatus = 'Active';
    rescueCase.reviewedBy = adminUser._id;
    rescueCase.reviewedAt = new Date();
    rescueCase.reviewNote = cleanNote;
    rescueCase.rejectionReason = ''; // Clear rejection reason if previously set

    await rescueCase.save();

    // Append-only audit log
    await AuditLog.create({
      caseId: rescueCase._id,
      adminId: adminUser._id,
      action: 'Approved',
      previousStatus,
      newStatus: 'Approved',
      reviewNote: cleanNote,
      timestamp: new Date(),
    });

    // In-app notification for the rescuer
    await Notification.create({
      recipient: rescueCase.createdBy,
      title: 'Rescue Case Approved 🎉',
      message: `Your case "${rescueCase.title}" for ${rescueCase.animalName} has been approved and is now active for crowdfunding.${cleanNote ? ` Admin note: "${cleanNote}"` : ''}`,
      caseId: rescueCase._id,
    });

    res.status(200).json({
      success: true,
      message: `Rescue case "${rescueCase.title}" approved and activated for public crowdfunding.`,
      case: rescueCase,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/cases/:id/reject
 * @desc    Reject a rescue case with a required rejection reason
 * @access  Private (Admin only)
 */
export const rejectCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reviewNote, rejectionReason } = req.body;
    const adminUser = req.user;

    const reason = (rejectionReason || reviewNote || '').trim();

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required to reject a rescue case.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const rescueCase = await RescueCase.findById(id);

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Guard: Prevent repeated decisions
    if (rescueCase.verificationStatus === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'This rescue case has already been rejected.',
      });
    }

    const previousStatus = rescueCase.verificationStatus;
    const cleanReason = reason.slice(0, 1000);

    rescueCase.verificationStatus = 'Rejected';
    rescueCase.campaignStatus = 'Rejected';
    rescueCase.reviewedBy = adminUser._id;
    rescueCase.reviewedAt = new Date();
    rescueCase.rejectionReason = cleanReason;
    rescueCase.reviewNote = cleanReason;

    await rescueCase.save();

    // Append-only audit log
    await AuditLog.create({
      caseId: rescueCase._id,
      adminId: adminUser._id,
      action: 'Rejected',
      previousStatus,
      newStatus: 'Rejected',
      reviewNote: cleanReason,
      timestamp: new Date(),
    });

    // In-app notification for the rescuer
    await Notification.create({
      recipient: rescueCase.createdBy,
      title: 'Rescue Case Requires Revision / Rejected ⚠️',
      message: `Your case "${rescueCase.title}" was not approved. Reason: "${cleanReason}". You can review the feedback in your rescuer portal.`,
      caseId: rescueCase._id,
    });

    res.status(200).json({
      success: true,
      message: `Rescue case "${rescueCase.title}" has been rejected.`,
      case: rescueCase,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/cases/:id/resubmit
 * @desc    Resubmit a rejected case after updating fields
 * @access  Private (Rescuer owner only)
 */
export const resubmitRescueCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const rescueCase = await RescueCase.findById(id);

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Rescuer ownership check
    if (
      rescueCase.createdBy.toString() !== user._id.toString() &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to resubmit your own cases.',
      });
    }

    if (rescueCase.verificationStatus !== 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Only rejected cases can be resubmitted for verification.',
      });
    }

    const {
      title,
      animalName,
      animalType,
      breed,
      age,
      gender,
      location,
      description,
      injuryType,
      injuryDescription,
      medicalCondition,
      urgencyLevel,
      estimatedTreatmentCost,
      fundraisingGoal,
    } = req.body;

    if (title) rescueCase.title = title.trim();
    if (animalName) rescueCase.animalName = animalName.trim();
    if (animalType) rescueCase.animalType = animalType;
    if (breed !== undefined) rescueCase.breed = breed.trim();
    if (age !== undefined) rescueCase.age = age.trim();
    if (gender) rescueCase.gender = gender;
    if (location) rescueCase.location = location.trim();
    if (description) rescueCase.description = description.trim();
    if (injuryType) rescueCase.injuryType = injuryType.trim();
    if (injuryDescription) rescueCase.injuryDescription = injuryDescription.trim();
    if (medicalCondition) rescueCase.medicalCondition = medicalCondition.trim();
    if (urgencyLevel) rescueCase.urgencyLevel = urgencyLevel;

    if (estimatedTreatmentCost) {
      const costNum = Number(estimatedTreatmentCost);
      if (!isNaN(costNum) && costNum >= 100) {
        rescueCase.estimatedTreatmentCost = costNum;
      }
    }

    if (fundraisingGoal) {
      const goalNum = Number(fundraisingGoal);
      if (!isNaN(goalNum) && goalNum >= 100) {
        rescueCase.fundraisingGoal = goalNum;
      }
    }

    // Handle new uploaded images if supplied
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/cases/${file.filename}`);
      rescueCase.images = [...rescueCase.images, ...newImages];
    } else if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
      rescueCase.images = [...rescueCase.images, ...req.body.imageUrls];
    }

    // Reset status to Pending; keep previous review note in audit log
    const previousStatus = rescueCase.verificationStatus;
    rescueCase.verificationStatus = 'Pending';
    rescueCase.campaignStatus = 'Pending';

    await rescueCase.save();

    // Record in Audit Trail
    await AuditLog.create({
      caseId: rescueCase._id,
      adminId: user._id, // User who triggered the resubmission action
      action: 'Resubmitted',
      previousStatus,
      newStatus: 'Pending',
      reviewNote: 'Rescuer updated case details and resubmitted for admin review.',
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Rescue case updated and resubmitted to admin verification queue.',
      case: rescueCase,
    });
  } catch (error) {
    next(error);
  }
};

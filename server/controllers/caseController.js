import RescueCase from '../models/RescueCase.js';

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

    res.status(200).json({
      success: true,
      case: rescueCase,
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
 * @route   GET /api/admin/cases
 * @desc    Get all submitted rescue cases for administrative review
 * @access  Private (Admin only)
 */
export const getAdminCases = async (req, res, next) => {
  try {
    const { status = 'All' } = req.query;

    const filter = {};
    if (status && status !== 'All') {
      filter.verificationStatus = status;
    }

    const cases = await RescueCase.find(filter)
      .populate('createdBy', 'name email phone rescuerVerificationStatus')
      .populate('reviewedBy', 'name email')
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
 * @route   GET /api/admin/cases/:id
 * @desc    Get complete administrative information for a case
 * @access  Private (Admin only)
 */
export const getAdminCaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    const rescueCase = await RescueCase.findById(id)
      .populate('createdBy', 'name email phone rescuerVerificationStatus')
      .populate('reviewedBy', 'name email')
      .lean();

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    res.status(200).json({
      success: true,
      case: rescueCase,
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

    const rescueCase = await RescueCase.findById(id);

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Set to Approved and campaign status to Active
    rescueCase.verificationStatus = 'Approved';
    rescueCase.campaignStatus = 'Active';
    rescueCase.reviewedBy = adminUser._id;
    rescueCase.reviewedAt = new Date();
    if (reviewNote) {
      rescueCase.reviewNote = reviewNote.trim();
    }

    await rescueCase.save();

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
    const { reviewNote } = req.body;
    const adminUser = req.user;

    if (!reviewNote || !reviewNote.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason / review note is required to reject a rescue case.',
      });
    }

    const rescueCase = await RescueCase.findById(id);

    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    rescueCase.verificationStatus = 'Rejected';
    rescueCase.campaignStatus = 'Rejected';
    rescueCase.reviewedBy = adminUser._id;
    rescueCase.reviewedAt = new Date();
    rescueCase.reviewNote = reviewNote.trim();

    await rescueCase.save();

    res.status(200).json({
      success: true,
      message: `Rescue case "${rescueCase.title}" has been rejected.`,
      case: rescueCase,
    });
  } catch (error) {
    next(error);
  }
};

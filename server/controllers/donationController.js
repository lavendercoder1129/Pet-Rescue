import crypto from 'crypto';
import mongoose from 'mongoose';
import Donation from '../models/Donation.js';
import RescueCase from '../models/RescueCase.js';
import Notification from '../models/Notification.js';

/**
 * Generate a unique, professional simulated donation reference
 * Format: SIM-YYYYMMDD-XXXXXX
 */
const generateReference = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `SIM-${dateStr}-${randomSuffix}`;
};

/**
 * @route   POST /api/donations
 * @desc    Process a simulated donation for an approved & active rescue case
 * @access  Private (Authenticated users: donor, rescuer, or admin)
 */
export const createDonation = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      caseId,
      amount,
      donationMessage = '',
      isAnonymous = false,
      idempotencyKey,
    } = req.body;

    // 1. Idempotency Check: Prevent duplicate submissions
    if (idempotencyKey && typeof idempotencyKey === 'string' && idempotencyKey.trim()) {
      const existingDonation = await Donation.findOne({
        donor: user._id,
        idempotencyKey: idempotencyKey.trim(),
      })
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected images')
        .populate('donor', 'name email')
        .lean();

      if (existingDonation) {
        return res.status(200).json({
          success: true,
          message: 'Your simulated donation was recorded successfully.',
          donation: existingDonation,
          isDuplicate: true,
        });
      }
    }

    // 2. Validate Case ID
    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid rescue case ID is required.',
      });
    }

    // 3. Amount Validation (reject 0, negative, non-numeric, or excessively large amounts)
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 10) {
      return res.status(400).json({
        success: false,
        message: 'Simulated donation amount must be at least ₹10.',
      });
    }

    if (numericAmount > 500000) {
      return res.status(400).json({
        success: false,
        message: 'Simulated donation amount cannot exceed ₹500,000 per transaction.',
      });
    }

    // 4. Retrieve Case & Verify Eligibility
    const rescueCase = await RescueCase.findById(caseId);
    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    // Critical Constraint: Only Approved and Active cases can receive donations
    if (rescueCase.verificationStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot donate to a case with verification status: ${rescueCase.verificationStatus}. Only Approved cases can receive simulated contributions.`,
      });
    }

    if (rescueCase.campaignStatus !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Cannot donate to a campaign in "${rescueCase.campaignStatus}" state. Campaign must be Active.`,
      });
    }

    // 5. Generate unique reference
    let donationReference = generateReference();
    let collisionCheck = await Donation.findOne({ donationReference });
    while (collisionCheck) {
      donationReference = generateReference();
      collisionCheck = await Donation.findOne({ donationReference });
    }

    // 6. Database Transaction / Safe Compensation Strategy
    let createdDonation = null;
    let session = null;

    try {
      // Check if replica set / transactions are supported
      session = await mongoose.startSession();
      session.startTransaction();

      // Create donation within session
      const [newDonation] = await Donation.create(
        [
          {
            donor: user._id,
            rescueCase: rescueCase._id,
            amount: numericAmount,
            currency: 'INR',
            donationReference,
            donationMessage: donationMessage ? String(donationMessage).trim().slice(0, 500) : '',
            isAnonymous: Boolean(isAnonymous),
            idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
            transactionStatus: 'Simulated',
            paymentMethod: 'Simulation Only',
            isSimulated: true,
          },
        ],
        { session }
      );

      // Atomically increment amountCollected on the rescue case
      const updatedCase = await RescueCase.findByIdAndUpdate(
        rescueCase._id,
        { $inc: { amountCollected: numericAmount } },
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      createdDonation = newDonation;
    } catch (txError) {
      if (session) {
        await session.abortTransaction().catch(() => {});
        session.endSession().catch(() => {});
      }

      // If standalone Mongo doesn't support replica set transactions, run safe compensation
      const newDonation = await Donation.create({
        donor: user._id,
        rescueCase: rescueCase._id,
        amount: numericAmount,
        currency: 'INR',
        donationReference,
        donationMessage: donationMessage ? String(donationMessage).trim().slice(0, 500) : '',
        isAnonymous: Boolean(isAnonymous),
        idempotencyKey: idempotencyKey ? String(idempotencyKey).trim() : undefined,
        transactionStatus: 'Simulated',
        paymentMethod: 'Simulation Only',
        isSimulated: true,
      });

      try {
        await RescueCase.findByIdAndUpdate(rescueCase._id, {
          $inc: { amountCollected: numericAmount },
        });
      } catch (caseUpdateError) {
        // Compensate: Delete orphan donation
        await Donation.findByIdAndDelete(newDonation._id);
        throw caseUpdateError;
      }

      createdDonation = newDonation;
    }

    // 7. Create In-App Notifications
    // Notification for donor
    await Notification.create({
      recipient: user._id,
      title: 'Simulated Donation Recorded 🐾',
      message: `Your simulated gift of ₹${numericAmount.toLocaleString()} to "${rescueCase.title}" (${rescueCase.animalName}) was recorded successfully. Ref: ${donationReference}.`,
      caseId: rescueCase._id,
    }).catch(() => {});

    // Notification for case rescuer (if rescuer is not the donor)
    if (rescueCase.createdBy.toString() !== user._id.toString()) {
      const donorDisplayName = isAnonymous ? 'A kind anonymous donor' : (user.name || 'A supporter');
      await Notification.create({
        recipient: rescueCase.createdBy,
        title: 'New Simulated Donation Received! 🎉',
        message: `${donorDisplayName} contributed a simulated ₹${numericAmount.toLocaleString()} to your rescue case "${rescueCase.title}".`,
        caseId: rescueCase._id,
      }).catch(() => {});
    }

    // Populate for response
    const populatedDonation = await Donation.findById(createdDonation._id)
      .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected images')
      .populate('donor', 'name email')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Your simulated donation was recorded successfully.',
      donation: populatedDonation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/donations/my
 * @desc    Get authenticated donor's simulated donation history
 * @access  Private (Authenticated users)
 */
export const getMyDonations = async (req, res, next) => {
  try {
    const user = req.user;
    const { search = '', sort = 'newest', page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { donor: user._id };

    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'amount_desc') {
      sortOption = { amount: -1 };
    } else if (sort === 'amount_asc') {
      sortOption = { amount: 1 };
    }

    // Retrieve user donations with case info populated
    let donationsQuery = Donation.find(filter)
      .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected images')
      .sort(sortOption);

    const [allUserDonations, totalCount] = await Promise.all([
      donationsQuery.lean(),
      Donation.countDocuments(filter),
    ]);

    // In-memory filter for search if matching case title, animal name, or reference
    let filtered = allUserDonations;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = allUserDonations.filter(
        (d) =>
          d.donationReference.toLowerCase().includes(q) ||
          d.rescueCase?.title?.toLowerCase().includes(q) ||
          d.rescueCase?.animalName?.toLowerCase().includes(q)
      );
    }

    const paginated = filtered.slice(skip, skip + limitNum);

    // Aggregate summary for user's donor stats
    const totalSimulatedGiven = allUserDonations.reduce((acc, d) => acc + (d.amount || 0), 0);
    const uniqueCasesSupported = new Set(
      allUserDonations.map((d) => d.rescueCase?._id?.toString()).filter(Boolean)
    ).size;

    res.status(200).json({
      success: true,
      count: paginated.length,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
      currentPage: pageNum,
      summary: {
        totalSimulatedGiven,
        uniqueCasesSupported,
        totalDonationsCount: allUserDonations.length,
      },
      donations: paginated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/donations/:id
 * @desc    Get detailed donation receipt (Strictly accessible by owner or Admin)
 * @access  Private
 */
export const getDonationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Search by ObjectId or by donationReference (e.g. SIM-20261115-XXXXXX)
    let donation = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      donation = await Donation.findById(id)
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected images description')
        .populate('donor', 'name email phone')
        .lean();
    } else {
      donation = await Donation.findOne({ donationReference: id.toUpperCase().trim() })
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected images description')
        .populate('donor', 'name email phone')
        .lean();
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Simulated donation record not found.',
      });
    }

    // Strict Authorization Check: Owner or Admin only
    const isOwner = donation.donor?._id?.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this donation receipt.',
      });
    }

    // Anonymize donor details if requested by donor, unless viewer is the owner or an admin
    if (donation.isAnonymous && !isOwner && !isAdmin) {
      donation.donor = { name: 'Anonymous Supporter' };
    }

    res.status(200).json({
      success: true,
      donation,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/donations/stats
 * @desc    Get aggregate donation metrics for administrative overview
 * @access  Private (Admin only)
 */
export const getAdminDonationStats = async (req, res, next) => {
  try {
    const [totalDonations, donorsList, totalAmountAgg] = await Promise.all([
      Donation.countDocuments(),
      Donation.distinct('donor'),
      Donation.aggregate([
        { $match: { transactionStatus: 'Simulated' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    const totalSimulatedAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].totalAmount : 0;
    const uniqueDonorsCount = donorsList.length;

    // Top campaigns supported
    const topCampaigns = await Donation.aggregate([
      { $match: { transactionStatus: 'Simulated' } },
      {
        $group: {
          _id: '$rescueCase',
          totalRaised: { $sum: '$amount' },
          donationsCount: { $sum: 1 },
        },
      },
      { $sort: { totalRaised: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'rescuecases',
          localField: '_id',
          foreignField: '_id',
          as: 'caseDetails',
        },
      },
      { $unwind: '$caseDetails' },
      {
        $project: {
          _id: 1,
          totalRaised: 1,
          donationsCount: 1,
          title: '$caseDetails.title',
          animalName: '$caseDetails.animalName',
          fundraisingGoal: '$caseDetails.fundraisingGoal',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalDonations,
        totalSimulatedAmount,
        uniqueDonorsCount,
        topCampaigns,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/donations
 * @desc    Get all donation records for admin review with filtering, search, and pagination
 * @access  Private (Admin only)
 */
export const getAdminDonations = async (req, res, next) => {
  try {
    const {
      status = 'All',
      caseId,
      donorId,
      search = '',
      page = 1,
      limit = 15,
      startDate,
      endDate,
    } = req.query;

    const filter = {};

    if (status && status !== 'All') {
      filter.transactionStatus = status;
    }

    if (caseId && mongoose.Types.ObjectId.isValid(caseId)) {
      filter.rescueCase = caseId;
    }

    if (donorId && mongoose.Types.ObjectId.isValid(donorId)) {
      filter.donor = donorId;
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

    if (search && search.trim()) {
      filter.donationReference = new RegExp(search.trim(), 'i');
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [donations, totalCount] = await Promise.all([
      Donation.find(filter)
        .populate('rescueCase', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
        .populate('donor', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Donation.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: donations.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      donations,
    });
  } catch (error) {
    next(error);
  }
};

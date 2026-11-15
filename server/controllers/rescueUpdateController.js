import mongoose from 'mongoose';
import RescueUpdate from '../models/RescueUpdate.js';
import RescueCase from '../models/RescueCase.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

/**
 * @route   POST /api/rescue-updates
 * @desc    Submit an update for an approved case the rescuer owns
 * @access  Private (Rescuer, Admin)
 */
export const submitRescueUpdate = async (req, res, next) => {
  try {
    const user = req.user;
    const { caseId, title, description, milestone } = req.body;

    // 1. Role validation
    if (user.role !== 'rescuer' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only registered rescuers and administrators can submit rescue updates.',
      });
    }

    if (user.role === 'rescuer' && user.rescuerVerificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your rescuer profile is pending verification. Only approved rescuers may post updates.',
      });
    }

    // 2. Validate inputs
    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid rescue case ID is required.',
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Update title is required.',
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Update description / progress report is required.',
      });
    }

    // 3. Verify case exists and check ownership & eligibility
    const rescueCase = await RescueCase.findById(caseId);
    if (!rescueCase) {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found.',
      });
    }

    if (user.role !== 'admin' && rescueCase.createdBy.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to submit updates for your own rescue cases.',
      });
    }

    if (rescueCase.verificationStatus !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: 'Updates can only be submitted for Approved rescue cases.',
      });
    }

    // 4. Process images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        images.push(`/uploads/updates/${file.filename}`);
      });
    }

    // 5. Create Rescue Update strictly defaulting to pending
    const newUpdate = await RescueUpdate.create({
      caseId: rescueCase._id,
      rescuerId: user._id,
      title: title.trim(),
      description: description.trim(),
      milestone: milestone || 'treatment',
      images,
      status: 'pending',
      isSimulated: true,
    });

    // In-app notification for submitting rescuer
    await Notification.create({
      recipient: user._id,
      title: 'Update Submitted for Review 🐾',
      message: `Your progress update "${newUpdate.title}" for ${rescueCase.animalName} was submitted and queued for administrative moderation.`,
      caseId: rescueCase._id,
    }).catch(() => {});

    const populatedUpdate = await RescueUpdate.findById(newUpdate._id)
      .populate('caseId', 'title animalName location urgencyLevel')
      .populate('rescuerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Rescue update submitted successfully and queued for moderation.',
      update: populatedUpdate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rescue-updates/my-updates
 * @desc    Retrieve submitted updates for authenticated rescuer
 * @access  Private (Rescuer, Admin)
 */
export const getMyUpdates = async (req, res, next) => {
  try {
    const user = req.user;
    const { status = 'all', page = 1, limit = 10 } = req.query;

    const filter = { rescuerId: user._id };
    if (status !== 'all' && ['pending', 'published', 'rejected'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [updates, totalCount] = await Promise.all([
      RescueUpdate.find(filter)
        .populate('caseId', 'title animalName location urgencyLevel fundraisingGoal amountCollected')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RescueUpdate.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: updates.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      updates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rescue-updates/my-cases
 * @desc    Retrieve eligible approved cases owned by the authenticated rescuer
 * @access  Private (Rescuer, Admin)
 */
export const getMyEligibleCases = async (req, res, next) => {
  try {
    const user = req.user;
    const filter = {
      verificationStatus: 'Approved',
    };
    if (user.role !== 'admin') {
      filter.createdBy = user._id;
    }

    const cases = await RescueCase.find(filter)
      .select('title animalName animalType location urgencyLevel images createdAt')
      .sort({ createdAt: -1 })
      .lean();

    // Attach latest update info and total updates count
    const casesWithStats = await Promise.all(
      cases.map(async (c) => {
        const updateCount = await RescueUpdate.countDocuments({
          caseId: c._id,
          status: 'published',
        });
        const latestUpdate = await RescueUpdate.findOne({
          caseId: c._id,
          status: 'published',
        })
          .sort({ createdAt: -1 })
          .select('title milestone createdAt')
          .lean();

        return {
          ...c,
          publishedUpdatesCount: updateCount,
          latestUpdate: latestUpdate || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      cases: casesWithStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rescue-updates/:id
 * @desc    Retrieve an update by ID (owner or admin)
 * @access  Private
 */
export const getRescueUpdateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid update ID.' });
    }

    const update = await RescueUpdate.findById(id)
      .populate('caseId', 'title animalName location urgencyLevel fundraisingGoal amountCollected createdBy')
      .populate('rescuerId', 'name email');

    if (!update) {
      return res.status(404).json({ success: false, message: 'Rescue update not found.' });
    }

    if (user.role !== 'admin' && update.rescuerId._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this update.',
      });
    }

    res.status(200).json({
      success: true,
      update,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/rescue-updates/:id
 * @desc    Edit an update only if status is pending or rejected (resets to pending)
 * @access  Private (Owner rescuer or Admin)
 */
export const editRescueUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { title, description, milestone } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid update ID.' });
    }

    const update = await RescueUpdate.findById(id);
    if (!update) {
      return res.status(404).json({ success: false, message: 'Rescue update not found.' });
    }

    if (user.role !== 'admin' && update.rescuerId.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to edit your own updates.',
      });
    }

    // Published updates cannot be freely edited by rescuer without admin workflow
    if (user.role !== 'admin' && update.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'Published updates cannot be edited directly. Please submit a new milestone progress update.',
      });
    }

    if (title && title.trim()) update.title = title.trim();
    if (description && description.trim()) update.description = description.trim();
    if (milestone) update.milestone = milestone;

    // Additional images if uploaded
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/updates/${file.filename}`);
      update.images = [...(update.images || []), ...newImages].slice(0, 5);
    }

    // Editing resets rejected or pending status back to pending moderation
    update.status = 'pending';
    update.adminFeedback = '';
    await update.save();

    res.status(200).json({
      success: true,
      message: 'Rescue update revised and resubmitted for admin moderation.',
      update,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/rescue-updates/case/:caseId
 * @desc    Public endpoint: retrieve only published updates for a publicly visible case
 * @access  Public
 */
export const getCasePublishedUpdates = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({ success: false, message: 'Invalid case ID.' });
    }

    const rescueCase = await RescueCase.findById(caseId);
    if (!rescueCase || rescueCase.verificationStatus !== 'Approved') {
      return res.status(404).json({
        success: false,
        message: 'Rescue case not found or not published.',
      });
    }

    const updates = await RescueUpdate.find({
      caseId: rescueCase._id,
      status: 'published',
    })
      .sort({ createdAt: 1 }) // Chronological order for the timeline
      .select('title description milestone images createdAt publishedAt rescuerId')
      .populate('rescuerId', 'name')
      .lean();

    res.status(200).json({
      success: true,
      case: {
        _id: rescueCase._id,
        title: rescueCase.title,
        animalName: rescueCase.animalName,
        urgencyLevel: rescueCase.urgencyLevel,
        location: rescueCase.location,
      },
      count: updates.length,
      updates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/admin/rescue-updates
 * @desc    Admin: list updates awaiting review and previously reviewed updates
 * @access  Private (Admin)
 */
export const getAdminRescueUpdates = async (req, res, next) => {
  try {
    const { status = 'all', search, milestone, page = 1, limit = 15 } = req.query;

    const filter = {};
    if (status !== 'all' && ['pending', 'published', 'rejected'].includes(status.toLowerCase())) {
      filter.status = status.toLowerCase();
    }
    if (milestone && milestone !== 'all') {
      filter.milestone = milestone;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const [updates, totalCount, pendingCount, publishedCount, rejectedCount] = await Promise.all([
      RescueUpdate.find(filter)
        .populate('caseId', 'title animalName animalType location urgencyLevel')
        .populate('rescuerId', 'name email rescuerVerificationStatus')
        .populate('reviewedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      RescueUpdate.countDocuments(filter),
      RescueUpdate.countDocuments({ status: 'pending' }),
      RescueUpdate.countDocuments({ status: 'published' }),
      RescueUpdate.countDocuments({ status: 'rejected' }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalSubmitted: totalCount,
        pendingCount,
        publishedCount,
        rejectedCount,
      },
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      updates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/rescue-updates/:id/approve
 * @desc    Admin: approve and publish a rescue update
 * @access  Private (Admin)
 */
export const approveRescueUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid update ID.' });
    }

    const update = await RescueUpdate.findById(id).populate('caseId');
    if (!update) {
      return res.status(404).json({ success: false, message: 'Rescue update not found.' });
    }

    if (update.status === 'published') {
      return res.status(400).json({
        success: false,
        message: 'This rescue update has already been approved and published.',
      });
    }

    const prevStatus = update.status;
    update.status = 'published';
    update.reviewedBy = user._id;
    update.reviewedAt = new Date();
    update.adminFeedback = req.body.adminFeedback || '';
    await update.save();

    // Audit Log
    await AuditLog.create({
      caseId: update.caseId._id,
      updateId: update._id,
      adminId: user._id,
      action: 'Update Approved',
      previousStatus: prevStatus,
      newStatus: 'published',
      reviewNote: `Admin approved update "${update.title}" (Milestone: ${update.milestone})`,
      timestamp: new Date(),
    }).catch(() => {});

    // Notify submitting rescuer
    await Notification.create({
      recipient: update.rescuerId,
      title: 'Update Approved & Published! 🌟',
      message: `Your progress update "${update.title}" for ${update.caseId.animalName} has been approved and is now live on the public timeline.`,
      caseId: update.caseId._id,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Rescue update approved and published successfully.',
      update,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/admin/rescue-updates/:id/reject
 * @desc    Admin: reject a rescue update with a mandatory reason
 * @access  Private (Admin)
 */
export const rejectRescueUpdate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const { reason, adminFeedback } = req.body;
    const rejectionNote = reason || adminFeedback;

    if (!rejectionNote || !rejectionNote.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A mandatory rejection reason or feedback is required to reject an update.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid update ID.' });
    }

    const update = await RescueUpdate.findById(id).populate('caseId');
    if (!update) {
      return res.status(404).json({ success: false, message: 'Rescue update not found.' });
    }

    const prevStatus = update.status;
    update.status = 'rejected';
    update.adminFeedback = rejectionNote.trim();
    update.reviewedBy = user._id;
    update.reviewedAt = new Date();
    await update.save();

    // Audit Log
    await AuditLog.create({
      caseId: update.caseId._id,
      updateId: update._id,
      adminId: user._id,
      action: 'Update Rejected',
      previousStatus: prevStatus,
      newStatus: 'rejected',
      reviewNote: rejectionNote.trim(),
      timestamp: new Date(),
    }).catch(() => {});

    // Notify submitting rescuer
    await Notification.create({
      recipient: update.rescuerId,
      title: 'Update Requires Revision ⚠️',
      message: `Your update "${update.title}" for ${update.caseId.animalName} was not approved: "${rejectionNote.trim()}". You can revise and resubmit it.`,
      caseId: update.caseId._id,
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: 'Rescue update rejected with feedback.',
      update,
    });
  } catch (error) {
    next(error);
  }
};

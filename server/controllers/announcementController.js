import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement (Admin only)
 * @access  Private (Admin)
 */
export const createAnnouncement = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      title,
      message,
      type = 'general',
      status = 'draft',
      priority = 0,
      startAt,
      expiresAt,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title is required.',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Announcement message is required.',
      });
    }

    const startDate = startAt ? new Date(startAt) : new Date();
    const expiryDate = expiresAt ? new Date(expiresAt) : null;

    if (expiryDate && expiryDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be after the start date.',
      });
    }

    const isPublished = status === 'published';

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      type,
      status,
      priority: Number(priority) || 0,
      startAt: startDate,
      expiresAt: expiryDate,
      createdBy: user._id,
      publishedAt: isPublished ? new Date() : null,
      isSimulated: true,
    });

    // If published immediately, optionally notify registered users
    if (isPublished) {
      // Create broadcast notifications asynchronously
      User.find({ role: { $in: ['donor', 'rescuer'] } })
        .select('_id')
        .limit(100)
        .then((users) => {
          const notifs = users.map((u) => ({
            recipient: u._id,
            title: `Announcement: ${announcement.title}`,
            message: announcement.message.slice(0, 150),
          }));
          return Notification.insertMany(notifs);
        })
        .catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: `Announcement created successfully as ${status}.`,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/announcements
 * @desc    List all announcements for admin management
 * @access  Private (Admin)
 */
export const getAdminAnnouncements = async (req, res, next) => {
  try {
    const { status = 'all', type = 'all', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status !== 'all') filter.status = status;
    if (type !== 'all') filter.type = type;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [announcements, totalCount] = await Promise.all([
      Announcement.find(filter)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Announcement.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum) || 1,
      currentPage: pageNum,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/announcements/:id
 * @desc    Get announcement by ID (Admin only)
 * @access  Private (Admin)
 */
export const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
    }

    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    res.status(200).json({
      success: true,
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/announcements/:id
 * @desc    Update announcement (Admin only)
 * @access  Private (Admin)
 */
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      title,
      message,
      type,
      status,
      priority,
      startAt,
      expiresAt,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (title && title.trim()) announcement.title = title.trim();
    if (message && message.trim()) announcement.message = message.trim();
    if (type) announcement.type = type;
    if (priority !== undefined) announcement.priority = Number(priority);
    if (startAt) announcement.startAt = new Date(startAt);
    if (expiresAt !== undefined) {
      announcement.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }

    if (status && status !== announcement.status) {
      announcement.status = status;
      if (status === 'published' && !announcement.publishedAt) {
        announcement.publishedAt = new Date();
      }
    }

    announcement.updatedBy = user._id;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PATCH /api/announcements/:id/archive
 * @desc    Archive announcement (Admin only)
 * @access  Private (Admin)
 */
export const archiveAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    announcement.status = 'archived';
    announcement.updatedBy = user._id;
    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement archived successfully.',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/announcements/active
 * @desc    Public endpoint: retrieve active announcements (published, startAt <= now, expiresAt > now or null)
 * @access  Public
 */
export const getActiveAnnouncements = async (req, res, next) => {
  try {
    const now = new Date();
    const filter = {
      status: 'published',
      startAt: { $lte: now },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    };

    const announcements = await Announcement.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .select('title message type priority startAt expiresAt publishedAt createdAt')
      .lean();

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
      isSimulated: true,
      disclaimer: 'Academic simulation data for platform updates.',
    });
  } catch (error) {
    next(error);
  }
};

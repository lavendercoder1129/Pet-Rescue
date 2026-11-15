import express from 'express';
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/notifications
 * @desc    Get authenticated user's notifications
 * @access  Private
 */
router.get('/', verifyAuth, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate('caseId', 'title animalName verificationStatus')
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.patch('/:id/read', verifyAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID',
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user._id, // Strict isolation
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or unauthorized',
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all user's notifications as read
 * @access  Private
 */
router.patch('/read-all', verifyAuth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
});

export default router;

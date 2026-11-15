import express from 'express';
import {
  createAnnouncement,
  getAdminAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  archiveAnnouncement,
  getActiveAnnouncements,
} from '../controllers/announcementController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Public endpoint
router.get('/active', getActiveAnnouncements);

// Protected Admin endpoints
router.post('/', verifyAuth, requireRoles('admin'), createAnnouncement);
router.get('/', verifyAuth, requireRoles('admin'), getAdminAnnouncements);
router.get('/:id', verifyAuth, requireRoles('admin'), getAnnouncementById);
router.patch('/:id', verifyAuth, requireRoles('admin'), updateAnnouncement);
router.patch('/:id/archive', verifyAuth, requireRoles('admin'), archiveAnnouncement);

export default router;

import express from 'express';
import {
  submitRescueUpdate,
  getMyUpdates,
  getMyEligibleCases,
  getRescueUpdateById,
  editRescueUpdate,
  getCasePublishedUpdates,
} from '../controllers/rescueUpdateController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { uploadUpdateImages } from '../middleware/updateUploadMiddleware.js';

const router = express.Router();

// Public timeline for a specific rescue case
router.get('/case/:caseId', getCasePublishedUpdates);

// Protected rescuer endpoints
router.post(
  '/',
  verifyAuth,
  requireRoles('rescuer', 'admin'),
  uploadUpdateImages.array('images', 5),
  submitRescueUpdate
);

router.get('/my-updates', verifyAuth, requireRoles('rescuer', 'admin'), getMyUpdates);
router.get('/my-cases', verifyAuth, requireRoles('rescuer', 'admin'), getMyEligibleCases);
router.get('/:id', verifyAuth, getRescueUpdateById);
router.patch(
  '/:id',
  verifyAuth,
  requireRoles('rescuer', 'admin'),
  uploadUpdateImages.array('images', 5),
  editRescueUpdate
);

export default router;

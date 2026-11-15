import express from 'express';
import {
  getPublicCases,
  getPublicCaseById,
  createRescueCase,
  getMyCases,
  getAdminCases,
  getAdminCaseById,
  approveCase,
  rejectCase,
} from '../controllers/caseController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { uploadCaseImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPublicCases);
router.get('/my', verifyAuth, requireRoles('rescuer', 'admin'), getMyCases);
router.get('/:id', getPublicCaseById);

// Rescuer submission (Protected: Rescuer or Admin)
router.post(
  '/',
  verifyAuth,
  requireRoles('rescuer', 'admin'),
  uploadCaseImages.array('images', 5),
  createRescueCase
);

// Admin Case Verification Routes
router.get('/admin/all', verifyAuth, requireRoles('admin'), getAdminCases);
router.get('/admin/:id', verifyAuth, requireRoles('admin'), getAdminCaseById);
router.patch('/admin/:id/approve', verifyAuth, requireRoles('admin'), approveCase);
router.patch('/admin/:id/reject', verifyAuth, requireRoles('admin'), rejectCase);

export default router;

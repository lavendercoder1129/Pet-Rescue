import express from 'express';
import {
  getPublicCases,
  getPublicCaseById,
  createRescueCase,
  getMyCases,
  getAdminCases,
  getAdminCaseById,
  getAdminCaseStats,
  getCaseAuditHistory,
  approveCase,
  rejectCase,
  resubmitRescueCase,
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

// Rescuer resubmission for rejected cases
router.patch(
  '/:id/resubmit',
  verifyAuth,
  requireRoles('rescuer', 'admin'),
  uploadCaseImages.array('images', 5),
  resubmitRescueCase
);

// Admin Case Verification Routes (Both /admin/all and /admin/cases compatible)
router.get('/admin/stats', verifyAuth, requireRoles('admin'), getAdminCaseStats);
router.get('/admin/all', verifyAuth, requireRoles('admin'), getAdminCases);
router.get('/admin/:id', verifyAuth, requireRoles('admin'), getAdminCaseById);
router.get('/admin/:id/history', verifyAuth, requireRoles('admin'), getCaseAuditHistory);
router.patch('/admin/:id/approve', verifyAuth, requireRoles('admin'), approveCase);
router.patch('/admin/:id/reject', verifyAuth, requireRoles('admin'), rejectCase);

export default router;

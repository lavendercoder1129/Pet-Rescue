import express from 'express';
import {
  submitExpense,
  getMyExpenses,
  getExpenseById,
  getExpenseDocument,
} from '../controllers/expenseController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';
import { requireRoles } from '../middleware/roleMiddleware.js';
import { uploadExpenseDocuments } from '../middleware/expenseUploadMiddleware.js';

const router = express.Router();

/**
 * Rescuer Expense Endpoints
 */
router.post(
  '/',
  verifyAuth,
  requireRoles('rescuer', 'admin'),
  uploadExpenseDocuments.array('documents', 5),
  submitExpense
);

router.get('/my', verifyAuth, requireRoles('rescuer', 'admin'), getMyExpenses);
router.get('/:id', verifyAuth, getExpenseById);

// Protected Document Download
router.get('/:id/documents/:documentId', verifyAuth, getExpenseDocument);

export default router;

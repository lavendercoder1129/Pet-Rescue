import express from 'express';
import {
  createDonation,
  getMyDonations,
  getDonationById,
} from '../controllers/donationController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * All donation endpoints require authentication
 */
router.post('/', verifyAuth, createDonation);
router.get('/my', verifyAuth, getMyDonations);
router.get('/:id', verifyAuth, getDonationById);

export default router;

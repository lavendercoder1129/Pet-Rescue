import express from 'express';
import {
  getPublicLeaderboard,
  getRecognitionSettings,
  updateRecognitionSettings,
} from '../controllers/achievementController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public leaderboard
router.get('/leaderboard', getPublicLeaderboard);

// Protected privacy settings
router.get('/recognition-settings', verifyAuth, getRecognitionSettings);
router.patch('/recognition-settings', verifyAuth, updateRecognitionSettings);

export default router;

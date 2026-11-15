import express from 'express';
import {
  getAvailableAchievements,
  getMyAchievements,
} from '../controllers/achievementController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected donor endpoints
router.get('/', verifyAuth, getAvailableAchievements);
router.get('/my', verifyAuth, getMyAchievements);

export default router;

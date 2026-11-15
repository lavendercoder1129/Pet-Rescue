import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
} from '../controllers/authController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', verifyAuth, getMe);

export default router;

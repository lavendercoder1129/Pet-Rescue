import express from 'express';
import {
  getTransparencySummary,
  getTransparencyCases,
} from '../controllers/fundController.js';

const router = express.Router();

// Public Transparency Endpoints
router.get('/summary', getTransparencySummary);
router.get('/cases', getTransparencyCases);

export default router;

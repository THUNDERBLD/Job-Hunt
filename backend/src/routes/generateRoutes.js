// Force restart
import express from 'express';
import { generateMessage, getUsage } from '../controllers/generateController.js';
import { protect, checkGenerationLimit } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/usage', getUsage);
router.post('/',     checkGenerationLimit, generateMessage);

export default router;
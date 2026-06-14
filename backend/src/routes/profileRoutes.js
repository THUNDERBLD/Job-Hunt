import express from 'express';
import { getProfile, upsertProfile } from '../controllers/profileController.js';

const router = express.Router();

router.get('/', getProfile);
router.put('/', upsertProfile);

export default router;
import express from 'express';
import {
  register, login, getMe, updateMe,
  updateProfile, updateCohereKey, removeCohereKey,
  updateGeminiKey, removeGeminiKey,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.post('/register', register);
router.post('/login',    login);

// Private
router.get('/me',            protect, getMe);
router.put('/me',            protect, updateMe);
router.put('/profile',       protect, updateProfile);
router.put('/cohere-key',    protect, updateCohereKey);
router.delete('/cohere-key', protect, removeCohereKey);
router.put('/gemini-key',    protect, updateGeminiKey);
router.delete('/gemini-key', protect, removeGeminiKey);

export default router;
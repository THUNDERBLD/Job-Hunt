import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/userModel.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      return next();
    } catch (error) {
      if (process.env.DEV_BYPASS_AUTH === 'true') {
        const devUser = await User.findOne({});
        if (devUser) {
          req.user = devUser;
          return next();
        }
      }
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    if (process.env.DEV_BYPASS_AUTH === 'true') {
      const devUser = await User.findOne({});
      if (devUser) {
        req.user = devUser;
        return next();
      }
    }
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


// ── checkGenerationLimit ──────────────────────────────────────
// Must be used AFTER protect
// Blocks generation if free-tier user is over their limit
export const checkGenerationLimit = asyncHandler(async (req, res, next) => {
  // Fetch user with cohereApiKey and geminiApiKey (selected: false by default)
  const user = await User.findById(req.user._id).select('+cohereApiKey +geminiApiKey');

  if (!user.canGenerate()) {
    res.status(429);
    throw new Error(
      `Monthly generation limit reached (${user.aiGenerationsLimit} generations). Add your own Cohere API key to generate unlimited messages.`
    );
  }

  // Attach full user (with key) so controller can use it
  req.user = user;
  next();
});
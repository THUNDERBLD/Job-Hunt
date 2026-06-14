import asyncHandler from '../utils/asyncHandler.js';
import Profile      from '../models/profileModel.js';

// ─────────────────────────────────────────────────────────────
// @desc    Get your profile (resume, skills, projects)
// @route   GET /api/profile
// @access  Public
// ─────────────────────────────────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ singleton: true });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: 'No profile found. Create one with PUT /api/profile',
    });
  }

  res.json({ success: true, data: profile });
});

// ─────────────────────────────────────────────────────────────
// @desc    Create or update your profile (upsert)
// @route   PUT /api/profile
// @access  Public
// Body: { name, bio, resumeText, skills[], projects[], resumeLink }
// ─────────────────────────────────────────────────────────────
export const upsertProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { singleton: true },
    { ...req.body, singleton: true },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, data: profile });
});
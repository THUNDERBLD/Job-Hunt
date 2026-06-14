import jwt           from 'jsonwebtoken';
import User          from '../models/userModel.js';
import asyncHandler  from '../utils/asyncHandler.js';

// ── Generate JWT ──────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── Safe user object (no password, no key) ────────────────────
const safeUser = (user) => ({
  _id:                 user._id,
  name:                user.name,
  email:               user.email,
  plan:                user.plan,
  profile:             user.profile,
  aiGenerationsUsed:   user.aiGenerationsUsed,
  aiGenerationsLimit:  user.aiGenerationsLimit,
  usageResetAt:        user.usageResetAt,
  hasCohereKey:        !!user.cohereApiKey,   // just a boolean — never expose the key
  hasGeminiKey:        !!user.geminiApiKey,
  createdAt:           user.createdAt,
});

// ─────────────────────────────────────────────────────────────
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    token: generateToken(user._id),
    data:  safeUser(user),
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Login
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // Explicitly select password (it's excluded by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({
    success: true,
    token: generateToken(user._id),
    data:  safeUser(user),
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+cohereApiKey +geminiApiKey');
  res.json({ success: true, data: safeUser(user) });
});

// ─────────────────────────────────────────────────────────────
// @desc    Update profile (bio, skills, projects, resume)
// @route   PUT /api/auth/profile
// @access  Private
// Body: { bio, resumeText, skills[], projects[], resumeLink }
// ─────────────────────────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Merge profile fields
  user.profile = { ...user.profile.toObject(), ...req.body };
  await user.save();

  res.json({ success: true, data: safeUser(user) });
});

// ─────────────────────────────────────────────────────────────
// @desc    Save / update personal Cohere API key
// @route   PUT /api/auth/cohere-key
// @access  Private
// Body: { cohereApiKey }
// ─────────────────────────────────────────────────────────────
export const updateCohereKey = asyncHandler(async (req, res) => {
  const { cohereApiKey } = req.body;

  if (!cohereApiKey || !cohereApiKey.trim()) {
    res.status(400);
    throw new Error('cohereApiKey is required');
  }

  const user = await User.findById(req.user._id).select('+cohereApiKey +geminiApiKey');
  user.cohereApiKey = cohereApiKey.trim();
  user.plan = 'pro'; // upgrading plan when they add a key
  await user.save();

  res.json({
    success: true,
    message: 'Cohere API key saved. You now have unlimited AI generations.',
    data: safeUser(user),
  });
});

export const removeCohereKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+cohereApiKey +geminiApiKey');
  user.cohereApiKey = null;
  // Set plan to free only if they don't have a Gemini key either
  if (!user.geminiApiKey) {
    user.plan = 'free';
  }
  await user.save();

  res.json({
    success: true,
    message: 'Cohere API key removed.',
    data: safeUser(user),
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Save / update personal Gemini API key
// @route   PUT /api/auth/gemini-key
// @access  Private
// Body: { geminiApiKey }
// ─────────────────────────────────────────────────────────────
export const updateGeminiKey = asyncHandler(async (req, res) => {
  const { geminiApiKey } = req.body;

  if (!geminiApiKey || !geminiApiKey.trim()) {
    res.status(400);
    throw new Error('geminiApiKey is required');
  }

  const user = await User.findById(req.user._id).select('+cohereApiKey +geminiApiKey');
  user.geminiApiKey = geminiApiKey.trim();
  user.plan = 'pro'; // upgrading plan when they add a key
  await user.save();

  res.json({
    success: true,
    message: 'Gemini API key saved. You now have unlimited AI generations.',
    data: safeUser(user),
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Remove personal Gemini API key
// @route   DELETE /api/auth/gemini-key
// @access  Private
// ─────────────────────────────────────────────────────────────
export const removeGeminiKey = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+cohereApiKey +geminiApiKey');
  user.geminiApiKey = null;
  // Set plan to free only if they don't have a Cohere key either
  if (!user.cohereApiKey) {
    user.plan = 'free';
  }
  await user.save();

  res.json({
    success: true,
    message: 'Gemini API key removed.',
    data: safeUser(user),
  });
});

// ─────────────────────────────────────────────────────────────
// @desc    Update name or email
// @route   PUT /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────
export const updateMe = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findById(req.user._id);

  if (name)  user.name  = name;
  if (email) user.email = email;
  await user.save();

  res.json({ success: true, data: safeUser(user) });
});
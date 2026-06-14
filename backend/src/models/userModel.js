import mongoose from 'mongoose';
import bcrypt    from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // ── Auth ──────────────────────────────────────────────────
    name:     { type: String, required: [true, 'Name is required'], trim: true },
    email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },

    // ── Plan ─────────────────────────────────────────────────
    // 'free' = uses platform Cohere key (rate limited)
    // 'pro'  = uses their own Cohere key (unlimited)
    plan: {
      type:    String,
      enum:    ['free', 'pro'],
      default: 'free',
    },

    // ── Personal Cohere API key ───────────────────────────────
    // Stored when user adds their own key
    cohereApiKey: {
      type:    String,
      default: null,
      select:  false,   // never returned in queries unless explicitly requested
    },

    // ── Personal Gemini API key ───────────────────────────────
    // Stored when user adds their own key
    geminiApiKey: {
      type:    String,
      default: null,
      select:  false,
    },

    // ── Profile / Resume (for AI generation) ─────────────────
    profile: {
      bio:        { type: String, default: '' },
      resumeText: { type: String, default: '' },
      skills:     [String],
      resumeLink: { type: String, default: '' },
      projects: [
        {
          name:        String,
          description: String,
          techStack:   [String],
          link:        String,
        },
      ],
    },

    // ── Usage tracking (for free tier limits) ─────────────────
    aiGenerationsUsed:  { type: Number, default: 0 },
    aiGenerationsLimit: { type: Number, default: 50 },  // free tier: 50/month
    usageResetAt:       { type: Date,   default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

// ── Hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Compare password ──────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ── Reset monthly usage ───────────────────────────────────────
userSchema.methods.resetMonthlyUsage = function () {
  this.aiGenerationsUsed = 0;
  this.usageResetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
};

// ── Check if user can generate (free tier check) ──────────────
userSchema.methods.canGenerate = function () {
  // Pro users or users with their own keys = unlimited
  if (this.plan === 'pro') return true;
  if (this.cohereApiKey || this.geminiApiKey) return true;

  // Reset counter if month has passed
  if (new Date() > this.usageResetAt) this.resetMonthlyUsage();

  return this.aiGenerationsUsed < this.aiGenerationsLimit;
};

const User = mongoose.model('User', userSchema);
export default User;
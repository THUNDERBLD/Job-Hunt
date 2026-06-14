import mongoose from 'mongoose';

// ── Excel column → DB field mapping ──────────────────────────
// Socails       → socials
// Companies     → companies
// Start-ups     → startups
// Person        → person
// Referrals     → referrals
// Position      → position
// Messaged      → messaged
// Links         → links  (LinkedIn URL)
// Status/Stage  → statusStage
// Priority      → priority
// Resume        → resume
// Notes         → notes
// Email         → email
// Sent Mails    → sentMails

const contactSchema = new mongoose.Schema(
  {
    // ── Owner ─────────────────────────────────────────────────
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      index:    true,  // fast lookup by user
    },

    // ── Exact Excel columns ───────────────────────────────────
    socials:     { type: String, trim: true, default: 'LinkedIn' },  // "Socails" (typo in sheet)
    companies:   { type: String, trim: true, default: '' },          // "Companies"
    startups:    { type: String, trim: true, default: '' },          // "Start-ups" (Yes/No/MNC)
    person:      { type: String, required: [true, 'Person (name) is required'], trim: true }, // "Person"
    referrals:   { type: String, trim: true, default: 'Not asked' }, // "Referrals"
    position:    { type: String, trim: true, default: '' },          // "Position"
    messaged:    { type: String, enum: ['Yes', 'No'], default: 'No' }, // "Messaged"
    links:       { type: String, trim: true, default: '' },          // "Links" (LinkedIn URL)
    statusStage: { type: String, trim: true, default: 'NAN' },       // "Status/Stage"
    priority:    { type: String, enum: ['High', 'Mid', 'Low'], default: 'Mid' }, // "Priority"
    resume:      { type: String, trim: true, default: '' },          // "Resume" (Drive link)
    notes:       { type: String, default: '' },                      // "Notes"
    email:       { type: String, trim: true, default: null },        // "Email"
    sentMails:   { type: String, enum: ['Yes', 'No'], default: 'No' }, // "Sent Mails"

    // ── Extra fields not in Excel but useful ──────────────────
    // Proper status pipeline (replaces the messy statusStage string)
    status: {
      type: String,
      enum: ['discovered', 'connection_sent', 'connected', 'messaged', 'email_sent', 'replied', 'in_process', 'rejected', 'on_hold'],
      default: 'discovered',
    },
    // Auto-detect from startups column: 'startup' | 'mnc' | 'unknown'
    companyType: {
      type:    String,
      enum:    ['startup', 'mnc', 'unknown'],
      default: 'unknown',
    },

    // ── AI Generated Content ──────────────────────────────────
    generatedMessage:      { type: String, default: '' },
    generatedLinkedInNote: { type: String, default: '' },
    generatedLinkedInDM:   { type: String, default: '' },
    generatedEmail:        { type: String, default: '' },
    generatedEmailSubject: { type: String, default: '' },
    generatedAt:           { type: Date,   default: null },

    // ── Status Timestamps ─────────────────────────────────────
    connectionSentAt: { type: Date, default: null },
    connectedAt:      { type: Date, default: null },
    messagedAt:       { type: Date, default: null },
    emailSentAt:      { type: Date, default: null },
    repliedAt:        { type: Date, default: null },
  },
  { timestamps: true }
);

// Unique contact per user (same LinkedIn URL can't be added twice by same user)
contactSchema.index({ userId: 1, links: 1 }, { unique: true, sparse: true });

// Auto-detect companyType from the 'startups' column value
contactSchema.pre('save', function (next) {
  if (this.isModified('startups')) {
    const v = (this.startups || '').toLowerCase().trim();
    if (v === 'mnc')      this.companyType = 'mnc';
    else if (v === 'yes') this.companyType = 'startup';
    else                  this.companyType = 'unknown';
  }

  // Auto-stamp status timestamps
  if (this.isModified('status')) {
    const now = new Date();
    const map = {
      connection_sent: 'connectionSentAt',
      connected:       'connectedAt',
      messaged:        'messagedAt',
      email_sent:      'emailSentAt',
      replied:         'repliedAt',
    };
    const field = map[this.status];
    if (field && !this[field]) this[field] = now;
  }

  next();
});

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
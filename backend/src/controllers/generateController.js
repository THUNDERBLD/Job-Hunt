import asyncHandler        from '../utils/asyncHandler.js';
import Contact             from '../models/contactModel.js';
import { buildPrompt }     from '../services/promptService.js';
import { parseEmailOutput} from '../utils/parseAiOutput.js';
import { getCohereClient, COHERE_MODEL } from '../config/cohere.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ─────────────────────────────────────────────────────────────
// @desc    Generate LinkedIn note / DM / cold email via Cohere
// @route   POST /api/generate
// @access  Private (+ checkGenerationLimit middleware)
// Body:    { contactId, type, jobDescription? }
// type:    'linkedin' | 'message' | 'email'
// ─────────────────────────────────────────────────────────────
export const generateMessage = asyncHandler(async (req, res) => {
  const { contactId, type, jobDescription = '' } = req.body;

  if (!contactId) {
    res.status(400);
    throw new Error('contactId is required');
  }
  if (!['linkedin', 'message', 'email'].includes(type)) {
    res.status(400);
    throw new Error('type must be: linkedin | message | email');
  }

  // Contact must belong to this user
  const contact = await Contact.findOne({ _id: contactId, userId: req.user._id });
  if (!contact) {
    res.status(404);
    throw new Error('Contact not found');
  }

  // Profile lives on the user document now
  const profile = req.user.profile;
  if (!profile?.bio && !profile?.resumeText && !profile?.skills?.length) {
    res.status(400);
    throw new Error('Set up your profile first via PUT /api/auth/profile');
  }

  // Build the prompt
  // Map contact fields to what promptService expects
  const contactForPrompt = {
    name:        contact.person,
    position:    contact.position,
    company:     contact.companies,
    companyType: contact.companyType,
    linkedinUrl: contact.links,
  };

  const promptText = buildPrompt(type, profile, contactForPrompt, jobDescription);

  let rawText = '';
  let providerUsed = 'Gemini';
  const geminiKey = req.user.geminiApiKey || process.env.GEMINI_API_KEY;

  if (geminiKey) {
    try {
      console.log('Attempting AI generation with Gemini (gemini-2.5-flash)...');
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(promptText);
      rawText = result.response.text().trim();
      console.log('AI generation with Gemini succeeded!');
    } catch (geminiError) {
      console.error('Gemini API failed, falling back to Cohere. Error:', geminiError.message || geminiError);
      providerUsed = 'Cohere';
    }
  } else {
    console.log('Gemini API key not set. Using Cohere...');
    providerUsed = 'Cohere';
  }

  if (providerUsed === 'Cohere') {
    const client = getCohereClient(req.user.cohereApiKey);
    const response = await client.chat({
      model: COHERE_MODEL,
      messages: [{ role: 'user', content: promptText }],
    });
    rawText = response.message.content[0].text.trim();
    console.log('AI generation with Cohere succeeded!');
  }

  // Parse and save back to contact
  let responseData;
  if (type === 'email') {
    const parsed = parseEmailOutput(rawText);
    responseData  = parsed;
    await Contact.findByIdAndUpdate(contactId, {
      generatedEmail:        parsed.content,
      generatedEmailSubject: parsed.subject,
      generatedAt:           new Date(),
      ...(jobDescription && { statusStage: 'Email Drafted' }),
    });
  } else if (type === 'linkedin') {
    responseData = { content: rawText };
    await Contact.findByIdAndUpdate(contactId, {
      generatedLinkedInNote: rawText,
      generatedMessage:      rawText,
      generatedAt:           new Date(),
    });
  } else if (type === 'message') {
    responseData = { content: rawText };
    await Contact.findByIdAndUpdate(contactId, {
      generatedLinkedInDM: rawText,
      generatedMessage:    rawText,
      generatedAt:         new Date(),
    });
  }

  // Increment usage counter for free-tier users who don't have their own keys
  if (req.user.plan === 'free' && !req.user.cohereApiKey && !req.user.geminiApiKey) {
    await req.user.constructor.findByIdAndUpdate(req.user._id, {
      $inc: { aiGenerationsUsed: 1 },
    });
  }

  res.json({ success: true, data: responseData });
});

// ─────────────────────────────────────────────────────────────
// @desc    Get generation usage stats for current user
// @route   GET /api/generate/usage
// @access  Private
// ─────────────────────────────────────────────────────────────
export const getUsage = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      plan:               user.plan,
      used:               user.aiGenerationsUsed,
      limit:              user.aiGenerationsLimit,
      remaining:          Math.max(0, user.aiGenerationsLimit - user.aiGenerationsUsed),
      resetsAt:           user.usageResetAt,
      hasPersonalKey:     !!user.cohereApiKey || !!user.geminiApiKey,
      unlimited:          user.plan === 'pro' || !!user.cohereApiKey || !!user.geminiApiKey,
    },
  });
});
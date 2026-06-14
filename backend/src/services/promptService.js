// services/promptService.js
// Pure functions that build AI prompts.
// No DB calls, no side effects — just takes data, returns a string.

const buildProfileContext = (profile) => `
ABOUT THE SENDER (${profile.name}):
Bio: ${profile.bio || 'Not provided'}

Skills: ${profile.skills?.join(', ') || 'Not specified'}

Projects:
${
  profile.projects?.length
    ? profile.projects.map(p =>
        `• ${p.name}: ${p.description} (Stack: ${p.techStack?.join(', ') || 'N/A'})${p.link ? ` → ${p.link}` : ''}`
      ).join('\n')
    : 'Not specified'
}

Resume:
${profile.resumeText || 'Not provided'}
`.trim();

const buildContactContext = (contact) => `
TARGET PERSON:
Name:     ${contact.name}
Role:     ${contact.position} at ${contact.company}
Type:     ${contact.companyType === 'startup' ? 'Startup' : 'MNC / Large Company'}
LinkedIn: ${contact.linkedinUrl}
`.trim();

// ─────────────────────────────────────────────────────────────
// LinkedIn Connection Request Note (≤ 200 chars)
// ─────────────────────────────────────────────────────────────
const linkedInNotePrompt = (profile, contact, jd) => `
You are helping ${profile.name} write a LinkedIn connection request note.

${buildProfileContext(profile)}

${buildContactContext(contact)}
${jd ? `\nJOB DESCRIPTION:\n${jd}` : ''}

TASK: Write a LinkedIn connection note.

STRICT RULES:
- MAX 200 characters (hard LinkedIn limit — count carefully)
- Sound like a real person, not a template
- Reference something specific about their role or company
- End with a soft ask (explore opportunities / would love to connect)
- No emojis, no "I hope this finds you well"
- Don't start with "Hi" or "Hello"

Return ONLY the note text. No labels, no quotes, nothing else.
`.trim();

// ─────────────────────────────────────────────────────────────
// LinkedIn DM (after connecting)
// ─────────────────────────────────────────────────────────────
const linkedInMessagePrompt = (profile, contact, jd) => `
You are helping ${profile.name} write a LinkedIn DM to someone who just accepted their connection request.

${buildProfileContext(profile)}

${buildContactContext(contact)}
${jd ? `\nJOB DESCRIPTION:\n${jd}` : ''}

TASK: Write a LinkedIn direct message.

STRICT RULES:
- Max 250 words
- Genuine and specific — not copy-paste sounding
- Mention 1-2 relevant projects or skills that match their context
- Clear and single ask at the end (open to opportunities, would love to discuss, etc.)
- Conversational — like a message to a real person, not a cover letter
- No emojis, no corporate jargon

Return ONLY the message text. No labels, no quotes, nothing else.
`.trim();

// ─────────────────────────────────────────────────────────────
// Cold Email
// ─────────────────────────────────────────────────────────────
const coldEmailPrompt = (profile, contact, jd) => `
You are helping ${profile.name} write a cold outreach email to a ${contact.position} at ${contact.company}.

${buildProfileContext(profile)}

${buildContactContext(contact)}
${jd ? `\nJOB DESCRIPTION:\n${jd}` : ''}

TASK: Write a cold outreach email.

STRICT RULES:
- Subject: punchy, specific, under 10 words — something they'll actually open
- Body: max 120 words
- First sentence must hook them with something specific about their company or product
- Mention exactly 1 project or skill that's directly relevant to their context
- End with one clear CTA (15-min call, reply if interested, etc.)
- No "I hope this email finds you well", no "passionate", "hardworking", "team player"
- Sound like a sharp developer reaching out, not a desperate job seeker

Return in EXACTLY this format, no deviations:
SUBJECT: <subject line>
BODY:
<email body>
`.trim();

// ─────────────────────────────────────────────────────────────
// Main export — picks the right prompt builder
// ─────────────────────────────────────────────────────────────
export const buildPrompt = (type, profile, contact, jobDescription = '') => {
  switch (type) {
    case 'linkedin': return linkedInNotePrompt(profile, contact, jobDescription);
    case 'message':  return linkedInMessagePrompt(profile, contact, jobDescription);
    case 'email':    return coldEmailPrompt(profile, contact, jobDescription);
    default: throw new Error(`Unknown prompt type: ${type}`);
  }
};
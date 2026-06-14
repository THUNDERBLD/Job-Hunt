# Postman Testing Guide — JobHunt Backend

---

## Step 0 — Start the Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀  Server running → http://localhost:5000
✅  MongoDB connected → localhost
```

---

## Step 1 — Set Up a Postman Environment (do this once)

This lets you use `{{BASE_URL}}` instead of typing the full URL every time.

1. In Postman, click **Environments** (top right) → **+**
2. Name it `JobHunt Local`
3. Add this variable:

| Variable   | Initial Value           |
|------------|-------------------------|
| `BASE_URL` | `http://localhost:5000`  |

4. Click **Save**
5. Select `JobHunt Local` from the environment dropdown (top right)

---

## Step 2 — Health Check (confirm server is running)

```
GET {{BASE_URL}}/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Step 3 — Create Your Profile (DO THIS FIRST — AI won't work without it)

```
PUT {{BASE_URL}}/api/profile
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "name": "Your Name",
  "bio": "Final year CS student. Built full-stack apps with React and Node.js. Looking for SDE roles at startups.",
  "skills": ["React", "Node.js", "MongoDB", "JavaScript", "Python", "Git"],
  "resumeText": "Your Name | yourmail@gmail.com | LinkedIn | GitHub\n\nEDUCATION\nB.Tech Computer Science | Your College | 2025\n\nSKILLS\nFrontend: React, HTML, CSS, Tailwind\nBackend: Node.js, Express, MongoDB\n\nPROJECTS\nProject 1 - Description of what it does. Built with React + Node.\nProject 2 - Description. Built with Python + MongoDB.\n\nPaste your actual resume text here.",
  "resumeLink": "https://drive.google.com/file/d/YOUR_FILE_ID/view",
  "projects": [
    {
      "name": "JobHunt Extension",
      "description": "Chrome extension to track LinkedIn outreach and generate AI-personalized messages",
      "techStack": ["React", "Node.js", "MongoDB", "Chrome Extension API"],
      "link": "https://github.com/yourusername/jobhunt"
    },
    {
      "name": "Another Project",
      "description": "What it does and why it's cool",
      "techStack": ["React", "Firebase"],
      "link": "https://github.com/yourusername/project"
    }
  ]
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Your Name",
    "bio": "...",
    "skills": ["React", "Node.js", ...],
    ...
  }
}
```

---

## Step 4 — Get Your Profile

```
GET {{BASE_URL}}/api/profile
```

No body needed. Just confirms your profile was saved.

---

## Step 5 — Create a Contact

```
POST {{BASE_URL}}/api/contacts
```

**Headers:**
```
Content-Type: application/json
```

**Body (raw → JSON):**
```json
{
  "name": "Saad Jamal",
  "position": "Founder & CEO",
  "company": "Serri.ai",
  "companyType": "startup",
  "linkedinUrl": "https://www.linkedin.com/in/saad-jamal/",
  "email": null,
  "social": "LinkedIn",
  "source": "wellfound",
  "priority": "high",
  "jobRole": "SDE Intern",
  "notes": "Found on Wellfound. Startup looks interesting."
}
```

**Expected response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "664abc123def456ghi789",
    "name": "Saad Jamal",
    "status": "discovered",
    "priority": "high",
    ...
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**SAVE THE `_id`** — you'll need it for update, delete, and AI generation.

---

## Step 6 — Try Creating the SAME Contact Again (duplicate test)

Run the exact same POST from Step 5 again.

**Expected response (409 Conflict):**
```json
{
  "success": false,
  "error": "Already tracking Saad Jamal from Serri.ai"
}
```

---

## Step 7 — Get All Contacts

```
GET {{BASE_URL}}/api/contacts
```

**Expected response:**
```json
{
  "success": true,
  "count": 1,
  "stats": {
    "total": 1,
    "byStatus": { "discovered": 1 },
    "highPriority": 1
  },
  "data": [...]
}
```

---

## Step 8 — Get All Contacts With Filters

Filter by status:
```
GET {{BASE_URL}}/api/contacts?status=discovered
```

Filter by priority:
```
GET {{BASE_URL}}/api/contacts?priority=high
```

Search by name or company:
```
GET {{BASE_URL}}/api/contacts?search=saad
```

Combine filters:
```
GET {{BASE_URL}}/api/contacts?status=connected&priority=high
```

---

## Step 9 — Get a Single Contact

```
GET {{BASE_URL}}/api/contacts/PASTE_ID_HERE
```

Replace `PASTE_ID_HERE` with the `_id` from Step 5.

---

## Step 10 — Update Contact Status

This is how you move a contact through the pipeline.

```
PUT {{BASE_URL}}/api/contacts/PASTE_ID_HERE
```

**Body:**
```json
{
  "status": "connection_sent"
}
```

Run it again with each status to see the timestamps auto-fill:

```json
{ "status": "connected" }
```
```json
{ "status": "messaged" }
```
```json
{ "status": "replied" }
```

Check the response — `connectedAt`, `messagedAt`, `repliedAt` will auto-populate.

---

## Step 11 — Update Email (after finding it on LinkedIn)

```
PUT {{BASE_URL}}/api/contacts/PASTE_ID_HERE
```

**Body:**
```json
{
  "email": "saad@serri.ai"
}
```

---

## Step 12 — Generate a LinkedIn Connection Note

```
POST {{BASE_URL}}/api/generate
```

**Body:**
```json
{
  "contactId": "PASTE_ID_HERE",
  "type": "linkedin",
  "jobDescription": "We are looking for a full-stack developer intern to help build our AI-powered sales platform. You'll work with React, Node.js, and our ML pipeline. Strong fundamentals in JavaScript required."
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "content": "Saw what you're building at Serri.ai — AI for sales is a space I've been deeply interested in. Working on similar problems in my projects. Would love to connect and learn more."
  }
}
```

Note: LinkedIn notes are ≤ 200 characters.

---

## Step 13 — Generate a LinkedIn DM (after connecting)

```
POST {{BASE_URL}}/api/generate
```

**Body:**
```json
{
  "contactId": "PASTE_ID_HERE",
  "type": "message",
  "jobDescription": "Looking for a React developer who can build scalable frontends and work closely with the founding team."
}
```

---

## Step 14 — Generate a Cold Email

```
POST {{BASE_URL}}/api/generate
```

**Body:**
```json
{
  "contactId": "PASTE_ID_HERE",
  "type": "email",
  "jobDescription": "We need someone who can own the frontend, ship fast, and think like a founder."
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "subject": "React dev who ships fast — Serri.ai frontend",
    "content": "Hi Saad,\n\nSerri.ai's approach to structuring sales conversations with AI is genuinely different from what I've seen...\n\nWould love a 15-min call if you're open to it."
  }
}
```

---

## Step 15 — Export to Excel

```
GET {{BASE_URL}}/api/contacts/export
```

In Postman:
1. Hit **Send**
2. Click **Save Response → Save to a file**
3. Save as `tracker.xlsx`
4. Open in Excel — you'll see your color-coded rows

---

## Step 16 — Delete a Contact

```
DELETE {{BASE_URL}}/api/contacts/PASTE_ID_HERE
```

**Expected response:**
```json
{
  "success": true,
  "message": "Saad Jamal deleted successfully"
}
```

---

## Step 17 — Test Error Handling

**Hit a route that doesn't exist:**
```
GET {{BASE_URL}}/api/blahblah
```
→ Should return `404` with `"Route not found"`

**Hit a contact with a fake ID:**
```
GET {{BASE_URL}}/api/contacts/000000000000000000000000
```
→ Should return `404` with `"Contact not found"`

---

## Where to Get Your Gemini API Key

1. Go to → [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy it → paste into `.env` as `GEMINI_API_KEY=...`
4. Restart the server (`Ctrl+C` → `npm run dev`)

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ECONNREFUSED` on MongoDB | MongoDB not running | Run `mongod` in a separate terminal |
| `Cannot find module` | Missing `node_modules` | Run `npm install` |
| `Profile not set up yet` | Step 3 was skipped | Run Step 3 first |
| `Contact not found` | Wrong or deleted ID | Use a fresh ID from GET all contacts |
| `Gemini API error` | Bad/missing API key | Check `.env` → restart server |
| `duplicate` error | Same LinkedIn URL | That contact is already tracked — expected behavior |

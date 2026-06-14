<p align="center">
  <h1 align="center">🎯 JobHunt Tracker</h1>
  <p align="center">
    <strong>Track LinkedIn outreach. Generate AI messages. Ship faster.</strong>
  </p>
  <p align="center">
    A Chrome extension + Node.js backend that turns LinkedIn into a structured job-hunting pipeline with AI-powered outreach.
  </p>
</p>

---

## ✨ Features

### 🔍 LinkedIn Scraping

- **Auto-scrape** LinkedIn profiles when you visit any `/in/` page — name, title, company, email, profile URL
- **Smart company detection** — auto-classifies as startup vs MNC using a curated list
- Handles LinkedIn's SPA navigation with a `MutationObserver`
- Data is cached in the service worker so the popup opens instantly

### 📇 Contact Management (Full CRUD)

- **Add contacts** pre-filled from the LinkedIn scrape — one click to save
- **Filter & search** by status, priority, company type, or free-text search
- **9 outreach statuses**: `discovered → connection_sent → connected → messaged → email_sent → replied → in_process → rejected → on_hold`
- **Priority levels** (high / mid / low) and **referral tracking**
- **Auto-timestamping** — changing status auto-stamps `connectedAt`, `messagedAt`, `repliedAt`, etc.
- **Duplicate guard** — prevents saving the same LinkedIn URL twice

### 🤖 AI Message Generation (Gemini + Cohere Fallback)

Generate context-aware outreach using your profile + the contact's info + an optional job description. The backend prioritizes the Google Gemini API (`gemini-2.5-flash`) and automatically falls back to the Cohere API (`command-r`) if there are errors or missing configurations.

| Type       | What it generates          | Constraints                       |
| ---------- | -------------------------- | --------------------------------- |
| `linkedin` | Connection request note    | ≤ 200 chars (LinkedIn hard limit) |
| `message`  | LinkedIn DM (post-connect) | ≤ 250 words, conversational       |
| `email`    | Cold outreach email        | Subject + body, ≤ 120 word body   |

- Prompts are crafted to sound human — no "I hope this finds you well"
- Generated content is saved on the contact for later reference

### 📊 Web Workspace Dashboard

A comprehensive, widescreen desktop React application synced with your database:
- **Interactive Analytics**: View visual stage splits (Discovered, Messaged, Replied), total outreach counts, response rates, and top target company allocations.
- **Leads Table (CRUD)**: Advanced grid listing all contacts, search-as-you-type filter bars, multi-category pipelines, and editing modals to quickly modify lead details.
- **Outreach Composer Console**: Choose target contacts, compose formatted templates, copy text directly to clipboard, and check remaining generation credits.
- **Excel Import / Export**: Download Excel templates, populate contacts offline, drag and drop sheets to upload in bulk, or backup your collection in one click.
- **Self-Hosted Key Bypass**: Set up your own Gemini and Cohere keys in the browser Settings to unlock unlimited generation actions.

### 👤 Profile & Keys Management

- Store your bio, resume content, skills, and projects — used automatically in every AI context prompt.
- Manage self-hosted LLM keys securely inside the profile panel.

---

## 🏗️ Architecture

```
jobhunt/
├── backend/                    ← Node.js + Express + MongoDB
│   └── src/
│       ├── app.js              ← Entry point (Express server)
│       ├── config/             ← DB connections & client SDK configs
│       ├── models/             ← Mongoose schemas (Contact, User)
│       ├── controllers/        ← API logic (Auth, Contacts, Import/Export, AI)
│       ├── routes/             ← Express routes mapping
│       ├── services/           ← Pure prompt building logic
│       └── utils/              ← Middleware helpers (Auth, Async)
│
├── extension/                  ← Chrome Extension (React + Vite + Monospace CSS)
│   ├── public/                 ← Icons & MV3 manifest
│   ├── src/
│   │   ├── background/         ← Service worker tab handlers
│   │   ├── content/            ← DOM scrapers injected into LinkedIn
│   │   └── popup/              ← Pop-up user views (Auth, Contact List, AI Compose)
│   └── vite.config.js
│
└── frontend/                   ← Desktop Web Application (React + Vite)
    ├── src/
    │   ├── components/         ← UI layouts & Navigation Sidebars
    │   ├── pages/              ← Workspace Views (Landing, Dashboard, Leads, AI, Settings)
    │   └── utils/              ← API client & design systems styling
    └── vite.config.js
```

---

## 🛠️ Tech Stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| **Extension** | React 18, Vite 6, Chrome Manifest V3, Monospace CSS   |
| **Web App**   | React 18, Vite 6, Tailwind CSS v4, Modern Flexbox     |
| **Backend**   | Node.js, Express 4, MongoDB (Mongoose 8)              |
| **AI**        | Gemini (`gemini-2.5-flash`) with Cohere (`command-r`) fallback |
| **Export**    | ExcelJS, Multer (multipart Excel file parsing)        |
| **Dev Tools** | Nodemon, ESLint, `vite-plugin-static-copy`            |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Gemini API Key** — get one at [aistudio.google.com](https://aistudio.google.com)
- **Cohere API Key** (Fallback) — get one at [cohere.com](https://cohere.com)
- **Google Chrome** (or any Chromium-based browser)

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/jobhunt-extension.git
cd jobhunt-extension
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=change_me_to_a_random_secret_string
GEMINI_API_KEY=your_gemini_api_key_here
COHERE_API_KEY=your_cohere_api_key_here
```

Start the server:

```bash
npm run dev       # nodemon (auto-restart)
# or
npm start         # plain node
```

The API will be available at `http://localhost:8000`. Verify with:

```bash
curl http://localhost:8000/health
```

### 3. Desktop Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` to view the beautiful Landing Page and Auth Dashboard portal.

### 4. Chrome Extension setup

```bash
cd extension
npm install
npm run build
```

### 5. Load into Chrome

1. Open `chrome://extensions` in your browser.
2. Enable **Developer mode** (top-right toggle switcher).
3. Click **Load unpacked**.
4. Select the build output `extension/dist` folder.

### 6. Use the Workflow

1. Navigate to any LinkedIn profile page (`https://www.linkedin.com/in/...`).
2. Open the JobHunt Chrome Extension popup from the extensions tray.
3. Profile fields are auto-populated in the panel. Save to pipeline database.
4. Open your dashboard (`http://localhost:5173`) to view graphs, import/export sheets, track pipeline progress, or generate outreach copies using customized context.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. The server runs on port `8000` by default.

### Contacts

| Method   | Endpoint               | Description                                                                             |
| -------- | ---------------------- | --------------------------------------------------------------------------------------- |
| `GET`    | `/api/contacts`        | List all contacts (supports `?status`, `?priority`, `?companyType`, `?search`, `?sort`) |
| `GET`    | `/api/contacts/:id`    | Get a single contact                                                                    |
| `POST`   | `/api/contacts`        | Create a contact (duplicate LinkedIn URL check)                                         |
| `PUT`    | `/api/contacts/:id`    | Update any field                                                                        |
| `DELETE` | `/api/contacts/:id`    | Delete a contact                                                                        |
| `GET`    | `/api/contacts/export` | Download all contacts as `.xlsx`                                                        |

### Profile

| Method | Endpoint       | Description                            |
| ------ | -------------- | -------------------------------------- |
| `GET`  | `/api/profile` | Get your profile                       |
| `PUT`  | `/api/profile` | Create or update your profile (upsert) |

### AI Generation

| Method | Endpoint        | Description                                                      |
| ------ | --------------- | ---------------------------------------------------------------- |
| `POST` | `/api/generate` | Generate a message. Body: `{ contactId, type, jobDescription? }` |

`type` must be one of: `linkedin` | `message` | `email`

### Health Check

| Method | Endpoint  | Description                                  |
| ------ | --------- | -------------------------------------------- |
| `GET`  | `/health` | Returns `{ status: "ok", timestamp: "..." }` |

---

## 📁 Contact Schema

| Field                   | Type   | Notes                                                 |
| ----------------------- | ------ | ----------------------------------------------------- |
| `name`                  | String | Required                                              |
| `position`              | String | Scraped from LinkedIn                                 |
| `company`               | String | Scraped from LinkedIn                                 |
| `companyType`           | Enum   | `startup` / `mnc` / `unknown`                         |
| `linkedinUrl`           | String | Required, unique                                      |
| `email`                 | String | Passive scrape only                                   |
| `status`                | Enum   | 9 values (see Features)                               |
| `priority`              | Enum   | `high` / `mid` / `low`                                |
| `referralStatus`        | Enum   | `not_asked` / `asked` / `confirmed` / `not_available` |
| `generatedMessage`      | String | AI-generated LinkedIn note/DM                         |
| `generatedEmail`        | String | AI-generated cold email body                          |
| `generatedEmailSubject` | String | AI-generated email subject                            |
| `notes`                 | String | Free-form notes                                       |
| `source`                | Enum   | `wellfound` / `ycombinator` / `linkedin` / `other`    |

---

## 🧑‍💻 Development

### Extension (hot-reload)

For development, use `npm run dev` in the `extension/` directory to get Vite's dev server. However, for testing as a Chrome extension, you must:

```bash
cd extension
npm run build    # produces dist/
```

Then reload the extension in `chrome://extensions`.

### Backend

```bash
cd backend
npm run dev      # nodemon watches for changes
```

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions and guidelines.

## 📄 License

[MIT](LICENSE)

---

<p align="center">
  Built for hustlers who track every connection, not just spray and pray. 🚀
</p>

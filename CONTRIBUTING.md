# Contributing to JobHunt Tracker

Thanks for considering contributing! Here's how to get started.

## 🚀 Quick Setup

### Prerequisites

- **Node.js** v18+
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)
- **Gemini API Key** — free at [aistudio.google.com](https://aistudio.google.com)
- **Cohere API Key** (optional fallback) — free at [cohere.com](https://cohere.com)
- **Google Chrome** (or any Chromium browser)

### 1. Fork & Clone

```bash
git clone https://github.com/<your-username>/jobhunt-extension.git
cd jobhunt-extension
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI, API keys, and a random JWT_SECRET
npm run dev
```

### 3. Frontend Web App

```bash
cd frontend
npm install
npm run dev
```

### 4. Extension

```bash
cd extension
npm install
npm run build
```

Then load `extension/dist` as an unpacked extension in `chrome://extensions` (Developer mode ON).

## 📂 Project Structure

```
backend/    → Node.js + Express + MongoDB API
extension/  → Chrome Extension (React + Vite)
frontend/   → Desktop Web Application & Landing Page (React + Vite)
```

## 🧑‍💻 Development Workflow

1. **Backend**: `cd backend && npm run dev` — auto-restarts with nodemon.
2. **Frontend**: `cd frontend && npm run dev` — opens active React hot-reloading server.
3. **Extension**: After code changes, run `cd extension && npm run build`, then reload in `chrome://extensions`.
4. **API URL**: Both frontend and extension communicate with the backend. Customize API endpoint URLs via respective `.env` files.

## 🔀 Pull Request Process

1. Create a feature branch: `git checkout -b feat/your-feature`
2. Make your changes
3. Test locally (both backend + extension)
4. Push and open a PR with a clear description of what changed and why

## 💡 Ideas for Contributions

- Add more AI providers (OpenAI, Claude, etc.)
- Build the frontend landing page
- Add unit/integration tests
- Improve LinkedIn scraper accuracy
- Dark/light theme toggle
- Export to CSV / Google Sheets

## 📝 Code Style

- Use ES modules (`import`/`export`)
- Mono-spaced font in the extension UI (matches the existing design system)
- Keep controllers thin — business logic goes in `services/`

## 🐛 Found a Bug?

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if it's a UI issue

---

Thanks for helping make job hunting less painful! 🎯

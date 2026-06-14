# 🔌 JobHunt Tracker Chrome Extension

This is the Chrome Extension popup client for the JobHunt Tracker project, built with React, Vite, and styled with Vanilla CSS.

## 🚀 Setup & Build Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run dev server (Web View mode):**
   ```bash
   npm run dev
   ```
   Runs a local dev server on `http://localhost:5173`. Useful for testing UI design/flow directly in a web browser.

3. **Build the extension (Chrome Extension mode):**
   ```bash
   npm run build
   ```
   This compiles the extension files and outputs a bundle to the `dist/` directory.

4. **Load the extension in Google Chrome:**
   * Open Chrome and navigate to `chrome://extensions`.
   * Enable **Developer mode** using the toggle in the top-right corner.
   * Click **Load unpacked** in the top-left corner.
   * Select the `extension/dist` folder from this project.

## 📁 Key File Locations

* `src/content/scraper.js` - Script injected into LinkedIn profile pages to auto-extract contact information (name, role, company, URL, etc.).
* `src/popup/App.jsx` - Main React page router controlling view transitions inside the extension popup.
* `src/popup/pages/` - Individual popup screens:
  * `Dashboard.jsx` - Overview stats & pipeline details.
  * `AddContact.jsx` - Review and save scraped LinkedIn profiles.
  * `ContactList.jsx` - Search, filter, and view saved contacts.
  * `ContactDetail.jsx` - Manage status, priority, and generated AI outreach.
  * `Generate.jsx` - Select outreach type (note, DM, email) and call LLM engines.
* `src/utils/api.js` - HTTP requests wrapper mapping to the backend server.

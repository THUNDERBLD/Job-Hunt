# 🗄️ JobHunt Tracker Backend

This is the Node.js / Express backend server for the JobHunt Tracker project. It interacts with MongoDB, handles user authentication, performs Excel exports of contact data, and interfaces with the LLMs (Gemini / Cohere) to generate personalized outreach.

## 🚀 Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>
   JWT_SECRET=your_jwt_secret_here
   GEMINI_API_KEY=your_gemini_api_key_here
   COHERE_API_KEY=your_cohere_api_key_here
   NODE_ENV=development
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The backend will start on `http://localhost:8000`.

## 📁 Folder Structure

```
backend/
├── src/
│   ├── app.js              # Express app initialization & server entry
│   ├── config/
│   │   ├── db.js           # MongoDB connection config
│   │   └── cohere.js       # Cohere API client config
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile updates
│   │   ├── contactController.js  # CRUD operations & Excel exports for contacts
│   │   └── generateController.js # AI note/email generation routing
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT route protection middleware
│   │   └── errorMiddleware.js    # Global error response & 404 handler
│   ├── models/
│   │   ├── contactModel.js       # Contact database schema
│   │   ├── userModel.js          # User database schema (includes profile info)
│   │   └── profileModel.js       # Legacy profile collection schema
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/* endpoints
│   │   ├── contactRoutes.js      # /api/contacts/* endpoints
│   │   ├── dashboardRoutes.js    # /api/dashboard/* endpoints
│   │   └── generateRoutes.js     # /api/generate endpoint
│   ├── services/
│   │   └── promptService.js      # Outreach template & prompt generation functions
│   └── utils/
│       ├── asyncHandler.js       # Express controller wrapper for catching async errors
│       └── parseAiOutput.js      # Utility to clean and structure LLM-generated outputs
```

## 📡 Key Endpoints

See the main [root README](../readme.md#api-reference) for the full API documentation and endpoint details.

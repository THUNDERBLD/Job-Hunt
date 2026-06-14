import 'dotenv/config';
import express  from 'express';
import cors     from 'cors';
import connectDB from './config/db.js';

// Routes
import authRoutes      from './routes/authRoutes.js';
import contactRoutes   from './routes/contactRoutes.js';
import generateRoutes  from './routes/generateRoutes.js';
import importRoutes    from './routes/importRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Middleware
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// ── Connect DB ────────────────────────────────────────────────
await connectDB();

const app = express();

// ── Core Middleware ───────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server (web dashboard)
  'http://localhost:3000',   // alternate dev port
  /^chrome-extension:\/\//,  // Chrome extension
];

if (process.env.FRONTEND_URL) {
  // Support comma-separated URLs
  const customOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim());
  allowedOrigins.push(...customOrigins);
}

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:  'ok',
    version: '2.0.0',
    time:    new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/contacts',  contactRoutes);
app.use('/api/generate',  generateRoutes);
app.use('/api/import',    importRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Error Handling ────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  JobHunt Backend v2.0 running on port ${PORT}`);
  console.log(`📡  http://localhost:${PORT}`);
  console.log(`🔑  Auth:      POST /api/auth/register | POST /api/auth/login`);
  console.log(`👤  Profile:   PUT  /api/auth/profile`);
  console.log(`🔌  Cohere:    PUT  /api/auth/cohere-key`);
  console.log(`📋  Contacts:  GET  /api/contacts`);
  console.log(`📥  Import:    POST /api/import`);
  console.log(`✨  Generate:  POST /api/generate`);
  console.log(`📊  Dashboard: GET  /api/dashboard\n`);
});

export default app;
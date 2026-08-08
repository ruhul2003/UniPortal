import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.js';
import noticesRouter from './routes/notices.js';
import routinesRouter from './routes/routines.js';
import announcementsRouter from './routes/announcements.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://uni-portal-five.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/users', usersRouter);

// Root welcome endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: '🚀 UniPortal Backend API Server is running successfully!',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      notices: '/api/notices',
      routines: '/api/routines',
      announcements: '/api/announcements',
      auth: '/api/auth'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'UniPortal API Server', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 [UniPortal Server] Running on http://localhost:${PORT}`);
});

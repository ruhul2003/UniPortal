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
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'UniPortal API Server', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 [UniPortal Server] Running on http://localhost:${PORT}`);
});

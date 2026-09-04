import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRouter from './routes/auth.js';
import noticesRouter from './routes/notices.js';
import routinesRouter from './routes/routines.js';
import announcementsRouter from './routes/announcements.js';
import usersRouter from './routes/users.js';
import sectionRequestsRouter from './routes/sectionRequests.js';
import attendanceRouter from './routes/attendance.js';
import assignmentsRouter from './routes/assignments.js';
import resourcesRouter from './routes/resources.js';
import forumRouter from './routes/forum.js';
import feedbackRouter from './routes/feedback.js';
import marksRouter from './routes/marks.js';
import examsRouter from './routes/exams.js';
import permitsRouter from './routes/permits.js';
import leaveRequestsRouter from './routes/leaveRequests.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow localhost, vercel.app subdomains, or explicit FRONTEND_URL
    if (
      origin.includes('localhost') || 
      origin.includes('127.0.0.1') || 
      origin.includes('vercel.app') ||
      (process.env.FRONTEND_URL && origin.includes(process.env.FRONTEND_URL))
    ) {
      return callback(null, true);
    }

  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database connection middleware for Serverless Vercel environment
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in middleware:', err);
    res.status(503).json({ error: 'Database connection unavailable' });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/routines', routinesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/users', usersRouter);
app.use('/api/section-requests', sectionRequestsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/assignments', assignmentsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/forum', forumRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/marks', marksRouter);
app.use('/api/exams', examsRouter);
app.use('/api/permits', permitsRouter);
app.use('/api/leave-requests', leaveRequestsRouter);

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
      attendance: '/api/attendance',
      assignments: '/api/assignments',
      resources: '/api/resources',
      forum: '/api/forum',
      feedback: '/api/feedback',
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

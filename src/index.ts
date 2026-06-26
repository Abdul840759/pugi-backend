import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import userRoutes from './routes/users';
import progressRoutes from './routes/progress';
import messageRoutes from './routes/messages';
import quizRoutes from './routes/quizzes';
import certificateRoutes from './routes/certificates';
import roadmapRoutes from './routes/roadmaps';
import liveClassRoutes from './routes/liveClasses';
import youtubeRoutes from './routes/youtube';
import planRoutes from './routes/plans';
import { errorHandler } from './middleware/errorHandler';
import passport from 'passport';
import { setupGoogleAuth } from './utils/googleAuth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
setupGoogleAuth();
app.use(passport.initialize());
app.use(express.json({ limit: '10mb' })); // 10mb for base64 avatars
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/plans', planRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 PUGI backend running on port ${PORT}`);
  });
});

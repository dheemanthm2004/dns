import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import { notificationQueue } from './queue/notificationQueue';
import notifyRouter from './routes/notify';
import authRouter from './routes/auth';
import templatesRouter from './routes/templates';
import batchRouter from './routes/batch';
import analyticsRouter from './routes/analytics';
import healthRouter from './routes/health';
import logsRouter from './routes/logs';
import swaggerRouter from './swagger';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/auth';

// Import services
import { startScheduler } from './scheduler/scheduler';
import { sendInApp, setSocketServer } from './services/inAppService';

// Prisma Client setup
const prisma = new PrismaClient();

// Create Express app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:12001",
    "https://dheenotifications.vercel.app",
    "https://work-1-gxnyunxxvadenmxk.prod-runtime.all-hands.dev",
    "https://work-2-gxnyunxxvadenmxk.prod-runtime.all-hands.dev"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"]
}));

// Rate limiting
app.use(rateLimiter());

// Create HTTP and WebSocket servers
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  },
  allowEIO3: true
});

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);
  socket.join(socket.id);
  socket.emit('connected', { 
    id: socket.id,
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected:', socket.id);
  });

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`🏠 User ${socket.id} joined room: ${room}`);
  });
});

// Pass Socket.IO instance to other modules
setSocketServer(io);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🔔 DheeNotifications Enterprise API is running!',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      notifications: '/api/notify',
      templates: '/api/templates',
      batch: '/api/batch',
      analytics: '/api/analytics',
      logs: '/api/logs',
      health: '/api/health',
      docs: '/api/docs'
    },
    features: [
      'Multi-channel notifications (Email, SMS, In-App)',
      'Template management',
      'Batch processing',
      'Real-time analytics',
      'JWT & API key authentication',
      'Webhook support',
      'Scheduled notifications'
    ]
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/notify', notifyRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/batch', batchRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/health', healthRouter);
app.use('/api/docs', swaggerRouter);

// Test endpoints (remove in production)
app.get('/test-db', async (req, res) => {
  try {
    const logs = await prisma.notificationLog.findMany({ take: 3 });
    res.json({ 
      status: '✅ Database connected', 
      logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Database connection failed',
      details: (error as Error).message
    });
  }
});

app.post('/test-queue', async (req, res) => {
  try {
    const job = await notificationQueue.add('send', {
      to: process.env.TEST_EMAIL || 'test@example.com',
      channel: 'email',
      message: 'Hello from DheeNotifications! This is a test notification from the queue system.',
      subject: 'Test Notification'
    });
    res.json({ 
      status: '✅ Test job added to queue',
      jobId: job.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Queue test failed',
      details: (error as Error).message
    });
  }
});

app.post('/test-sms', async (req, res) => {
  try {
    const job = await notificationQueue.add('send', {
      to: process.env.TEST_PHONE || '+919686490654',
      channel: 'sms',
      message: 'Hello from DheeNotifications! This is a test SMS notification.'
    });
    res.json({ 
      status: '✅ Test SMS job added to queue',
      jobId: job.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ SMS test failed',
      details: (error as Error).message
    });
  }
});

// Socket.IO test endpoint
app.post('/test-socket', (req, res) => {
  try {
    io.emit('test-notification', {
      message: 'Hello from DheeNotifications! This is a test real-time notification.',
      timestamp: new Date().toISOString(),
      type: 'info'
    });
    res.json({ 
      status: '✅ Test socket notification sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: '❌ Socket test failed',
      details: (error as Error).message
    });
  }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start scheduler
startScheduler();

// Start HTTP + WebSocket server
const PORT = process.env.PORT || 12000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DheeNotifications Enterprise Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔌 WebSocket Server: Ready for real-time notifications`);
  console.log(`📧 Test Email: ${process.env.TEST_EMAIL}`);
  console.log(`📱 Test Phone: ${process.env.TEST_PHONE}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
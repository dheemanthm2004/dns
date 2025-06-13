import express from 'express';
import { PrismaClient } from '@prisma/client';
import { redisConnection } from '../utils/redis';
import { notificationQueue } from '../queue/notificationQueue';

const router = express.Router();
const prisma = new PrismaClient();

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  details?: any;
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      service: 'database',
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: { error: (error as Error).message }
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    await redisConnection.ping();
    return {
      service: 'redis',
      status: 'healthy',
      responseTime: Date.now() - start
    };
  } catch (error) {
    return {
      service: 'redis',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: { error: (error as Error).message }
    };
  }
}

async function checkQueue(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const waiting = await notificationQueue.getWaiting();
    const active = await notificationQueue.getActive();
    const failed = await notificationQueue.getFailed();

    const queueHealth = failed.length > 100 ? 'degraded' : 'healthy';

    return {
      service: 'queue',
      status: queueHealth,
      responseTime: Date.now() - start,
      details: {
        waiting: waiting.length,
        active: active.length,
        failed: failed.length
      }
    };
  } catch (error) {
    return {
      service: 'queue',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      details: { error: (error as Error).message }
    };
  }
}

// Health check endpoint
router.get('/', async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkRedis(),
    checkQueue()
  ]);

  const overallStatus = checks.every(check => check.status === 'healthy') 
    ? 'healthy' 
    : checks.some(check => check.status === 'unhealthy') 
      ? 'unhealthy' 
      : 'degraded';

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    uptime: process.uptime(),
    checks
  };

  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  res.status(statusCode).json(response);
});

// Detailed system info
router.get('/system', async (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime()
    },
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
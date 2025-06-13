import IORedis from "ioredis";

export const redisConnection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
});

redisConnection.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisConnection.on('ready', () => {
  console.log('🚀 Redis is ready to accept commands');
});
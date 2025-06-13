import { Queue } from 'bullmq';
import { redisConnection } from "../utils/redis";

export const notificationQueue = new Queue('notifications', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
  },
});

console.log('📋 Notification queue initialized');
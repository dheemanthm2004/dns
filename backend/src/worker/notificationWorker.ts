import { Worker, Job } from 'bullmq';
import { sendEmail } from '../services/emailService';
import { sendSMS } from '../services/smsService';
import { TemplateService } from '../services/templateService';
import { AnalyticsService } from '../services/analyticsService';
import { WebhookService } from '../services/webhookService';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { redisConnection } from '../utils/redis';

dotenv.config();

const prisma = new PrismaClient();

const worker = new Worker(
  'notifications',
  async (job: Job) => {
    const { 
      to, 
      channel, 
      message, 
      subject, 
      templateId, 
      userId, 
      batchId, 
      scheduledId,
      variables = {} 
    } = job.data;

    let status = 'success';
    let error: string | null = null;
    let finalMessage = message;
    let finalSubject = subject;

    console.log(`🔄 Processing ${channel} notification to ${to} (Job ${job.id})`);

    try {
      // Render template if provided
      if (templateId) {
        const rendered = await TemplateService.renderTemplate(templateId, variables);
        finalMessage = rendered.body;
        finalSubject = rendered.subject;
        console.log(`📝 Template ${templateId} rendered for ${to}`);
      }

      // Send notification based on channel
      switch (channel) {
        case 'email':
          await sendEmail(to, finalMessage, finalSubject);
          break;
        case 'sms':
          await sendSMS(to, finalMessage);
          break;
        case 'in-app':
          // In-app notifications require Socket.IO server
          // For now, we'll log success (in production, connect to Socket.IO server)
          console.log(`📱 In-app notification would be sent to ${to}: ${finalMessage}`);
          break;
        case 'push':
          // TODO: Implement push notification service
          throw new Error('Push notifications not implemented yet');
        default:
          throw new Error(`Unknown channel: ${channel}`);
      }

      // Record analytics
      await AnalyticsService.recordEvent({
        type: 'sent',
        channel,
        userId,
        metadata: { batchId, templateId, scheduledId }
      });

      // Send success webhook
      await WebhookService.notifyWebhooks('notification.sent', {
        to,
        channel,
        message: finalMessage,
        subject: finalSubject,
        batchId,
        userId,
        jobId: job.id
      }, userId);

      console.log(`✅ ${channel} notification sent successfully to ${to}`);

    } catch (err: any) {
      status = 'failed';
      error = err.message;

      // Record failed analytics
      await AnalyticsService.recordEvent({
        type: 'failed',
        channel,
        userId,
        metadata: { batchId, templateId, scheduledId, error: err.message }
      });

      // Send failure webhook
      await WebhookService.notifyWebhooks('notification.failed', {
        to,
        channel,
        error: err.message,
        batchId,
        userId,
        jobId: job.id
      }, userId);

      console.error(`❌ ${channel} notification failed for ${to}: ${err.message}`);
      throw err; // This triggers BullMQ retry
    } finally {
      // Log to database
      await prisma.notificationLog.create({
        data: {
          to,
          channel,
          message: finalMessage,
          subject: finalSubject,
          status,
          error,
          userId,
          templateId,
          metadata: { batchId, scheduledId, variables, jobId: job.id }
        },
      });

      // Update scheduled notification status if applicable
      if (scheduledId) {
        await prisma.scheduledNotification.update({
          where: { id: scheduledId },
          data: { status: status === 'success' ? 'sent' : 'failed' }
        });
      }
    }
  },
  {
    connection: redisConnection,
    concurrency: 10, // Process 10 jobs concurrently
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50 // Keep last 50 failed jobs
  }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

worker.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

worker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('🔧 Notification worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down worker gracefully');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down worker gracefully');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

export default worker;
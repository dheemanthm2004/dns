import { PrismaClient } from '@prisma/client';
import { notificationQueue } from '../queue/notificationQueue';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export class BatchService {
  static async processBatchFromCSV(
    csvContent: string, 
    channel: string, 
    templateId?: number,
    userId?: number
  ) {
    const results: any[] = [];
    const errors: any[] = [];

    return new Promise((resolve, reject) => {
      const stream = Readable.from([csvContent]);
      
      stream.pipe(parse({
        columns: true,
        skip_empty_lines: true
      }))
      .on('data', async (row) => {
        try {
          // Validate required fields
          if (!row.to || !row.message) {
            errors.push({ row, error: 'Missing required fields: to, message' });
            return;
          }

          // Add to queue
          const jobData = {
            to: row.to,
            channel,
            message: row.message,
            subject: row.subject,
            templateId,
            userId,
            variables: { ...row }
          };

          await notificationQueue.add('send-batch', jobData, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            delay: results.length * 100 // Stagger sends
          });

          results.push({ to: row.to, status: 'queued' });
        } catch (error: any) {
          errors.push({ row, error: error.message });
        }
      })
      .on('end', () => {
        resolve({ 
          processed: results.length, 
          errors: errors.length,
          results,
          errors 
        });
      })
      .on('error', reject);
    });
  }

  static async createBatchJob(data: {
    name: string;
    channel: string;
    recipients: string[];
    message: string;
    subject?: string;
    templateId?: number;
    sendAt?: Date;
    userId: number;
  }) {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    for (let i = 0; i < data.recipients.length; i++) {
      const recipient = data.recipients[i];
      
      const jobData = {
        to: recipient,
        channel: data.channel,
        message: data.message,
        subject: data.subject,
        templateId: data.templateId,
        userId: data.userId,
        batchId
      };

      const jobOptions = {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        delay: data.sendAt ? data.sendAt.getTime() - Date.now() + (i * 100) : i * 100
      };

      await notificationQueue.add('send-batch', jobData, jobOptions);
    }

    return {
      batchId,
      totalRecipients: data.recipients.length,
      status: 'queued'
    };
  }

  static async getBatchStatus(batchId: string) {
    const jobs = await notificationQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
    const batchJobs = jobs.filter(job => job.data.batchId === batchId);

    const status = {
      total: batchJobs.length,
      waiting: batchJobs.filter(job => job.opts.delay && job.opts.delay > Date.now()).length,
      processing: batchJobs.filter(job => job.isActive()).length,
      completed: batchJobs.filter(job => job.isCompleted()).length,
      failed: batchJobs.filter(job => job.isFailed()).length
    };

    return status;
  }
}
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class WebhookService {
  static async sendWebhook(data: {
    url: string;
    event: string;
    payload: any;
    secret?: string;
  }) {
    try {
      const timestamp = Date.now();
      const body = JSON.stringify({
        event: data.event,
        timestamp,
        data: data.payload
      });

      const headers: any = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': data.event,
        'X-Webhook-Timestamp': timestamp.toString(),
        'User-Agent': 'DheeNotifications-Webhook/1.0'
      };

      // Add signature if secret is provided
      if (data.secret) {
        const signature = crypto
          .createHmac('sha256', data.secret)
          .update(body)
          .digest('hex');
        headers['X-Webhook-Signature'] = `sha256=${signature}`;
      }

      const response = await axios.post(data.url, body, {
        headers,
        timeout: 30000,
        validateStatus: (status) => status < 500 // Retry on 5xx errors
      });

      console.log(`🔗 Webhook delivered to ${data.url}: ${response.status}`);
      return { success: true, status: response.status };
    } catch (error: any) {
      console.error('❌ Webhook delivery failed:', error.message);
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status 
      };
    }
  }

  static async notifyWebhooks(event: string, payload: any, userId?: number) {
    // In a real app, you'd store webhook URLs in the database per user/organization
    // For now, we'll use environment variables
    const webhookUrls = (process.env.WEBHOOK_URLS || '').split(',').filter(Boolean);
    
    if (webhookUrls.length === 0) {
      return [];
    }

    const promises = webhookUrls.map(url => 
      this.sendWebhook({
        url: url.trim(),
        event,
        payload,
        secret: process.env.WEBHOOK_SECRET
      })
    );

    return await Promise.allSettled(promises);
  }
}
import { PrismaClient } from '@prisma/client';
import { redisConnection } from '../utils/redis';

const prisma = new PrismaClient();

export class AnalyticsService {
  static async recordEvent(event: {
    type: 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked';
    channel: string;
    userId?: number;
    notificationId?: number;
    metadata?: any;
  }) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    // Update daily analytics
    const existing = await prisma.notificationAnalytics.findUnique({
      where: {
        date_channel: {
          date,
          channel: event.channel
        }
      }
    });

    if (existing) {
      await prisma.notificationAnalytics.update({
        where: { id: existing.id },
        data: {
          [event.type]: { increment: 1 }
        }
      });
    } else {
      await prisma.notificationAnalytics.create({
        data: {
          date,
          channel: event.channel,
          [event.type]: 1
        }
      }).catch(() => {
        // Ignore unique constraint errors - record might already exist
      });
    }

    // Store real-time metrics in Redis
    const redisKey = `analytics:${event.channel}:${event.type}:${date.toISOString().split('T')[0]}`;
    await redisConnection.incr(redisKey);
    await redisConnection.expire(redisKey, 86400 * 30); // 30 days
  }

  static async getDashboardMetrics(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get analytics data
    const analytics = await prisma.notificationAnalytics.findMany({
      where: {
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });

    // Get user's notification logs for personal stats
    const userLogs = await prisma.notificationLog.findMany({
      where: {
        userId,
        createdAt: { gte: startDate }
      }
    });

    // Calculate totals
    const totalSent = analytics.reduce((sum, record) => sum + record.sent, 0);
    const totalDelivered = analytics.reduce((sum, record) => sum + record.delivered, 0);
    const totalFailed = analytics.reduce((sum, record) => sum + record.failed, 0);
    const totalOpened = analytics.reduce((sum, record) => sum + record.opened, 0);

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const failureRate = totalSent > 0 ? (totalFailed / totalSent) * 100 : 0;

    // Channel breakdown
    const channelStats = analytics.reduce((acc, record) => {
      if (!acc[record.channel]) {
        acc[record.channel] = { sent: 0, delivered: 0, failed: 0, opened: 0 };
      }
      acc[record.channel].sent += record.sent;
      acc[record.channel].delivered += record.delivered;
      acc[record.channel].failed += record.failed;
      acc[record.channel].opened += record.opened;
      return acc;
    }, {} as Record<string, any>);

    // Daily trends
    const dailyTrends = analytics.map(record => ({
      date: record.date.toISOString().split('T')[0],
      sent: record.sent,
      delivered: record.delivered,
      failed: record.failed,
      opened: record.opened,
      channel: record.channel
    }));

    return {
      summary: {
        totalSent,
        totalDelivered,
        totalFailed,
        totalOpened,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100
      },
      channelStats,
      dailyTrends,
      userStats: {
        personalSent: userLogs.length,
        personalSuccess: userLogs.filter(log => log.status === 'success').length,
        personalFailed: userLogs.filter(log => log.status === 'failed').length
      }
    };
  }

  static async getRealTimeMetrics() {
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];

    const channels = ['email', 'sms', 'in-app', 'push'];
    const metrics: any = {};

    for (const channel of channels) {
      const sent = await redisConnection.get(`analytics:${channel}:sent:${todayKey}`) || '0';
      const delivered = await redisConnection.get(`analytics:${channel}:delivered:${todayKey}`) || '0';
      const failed = await redisConnection.get(`analytics:${channel}:failed:${todayKey}`) || '0';
      const opened = await redisConnection.get(`analytics:${channel}:opened:${todayKey}`) || '0';

      metrics[channel] = {
        sent: parseInt(sent),
        delivered: parseInt(delivered),
        failed: parseInt(failed),
        opened: parseInt(opened)
      };
    }

    return metrics;
  }

  static async getTopFailureReasons(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const failedLogs = await prisma.notificationLog.findMany({
      where: {
        status: 'failed',
        createdAt: { gte: startDate },
        error: { not: null }
      },
      select: { error: true, channel: true }
    });

    const errorCounts = failedLogs.reduce((acc, log) => {
      const key = `${log.channel}: ${log.error}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }
}
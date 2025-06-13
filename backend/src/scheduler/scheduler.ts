import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { notificationQueue } from "../queue/notificationQueue";

const prisma = new PrismaClient();

export function startScheduler() {
  console.log('⏰ Starting notification scheduler...');
  
  // 🕐 Every minute - check for scheduled notifications
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const dueNotifications = await prisma.scheduledNotification.findMany({
        where: {
          sendAt: { lte: now },
          status: "pending",
        },
        take: 100, // Process max 100 at a time
      });

      if (dueNotifications.length > 0) {
        console.log(`📅 Processing ${dueNotifications.length} scheduled notifications`);
      }

      for (const notif of dueNotifications) {
        // ✅ Add with retry options
        await notificationQueue.add(
          "send",
          {
            to: notif.to,
            channel: notif.channel,
            message: notif.message,
            subject: notif.subject,
            templateId: notif.templateId,
            userId: notif.userId,
            metadata: notif.metadata,
            scheduledId: notif.id
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 10000,
            },
          }
        );

        // ✅ Mark as queued
        await prisma.scheduledNotification.update({
          where: { id: notif.id },
          data: { status: "queued" },
        });

        console.log(`📤 Scheduled notification ${notif.id} queued at ${now}`);
      }
    } catch (error) {
      console.error('❌ Scheduler error:', error);
    }
  });

  // 🕐 Every hour - cleanup old completed jobs
  cron.schedule("0 * * * *", async () => {
    try {
      await notificationQueue.clean(24 * 60 * 60 * 1000, 100, 'completed');
      await notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 50, 'failed');
      console.log('🧹 Queue cleanup completed');
    } catch (error) {
      console.error('❌ Queue cleanup error:', error);
    }
  });

  console.log('✅ Scheduler started successfully');
}
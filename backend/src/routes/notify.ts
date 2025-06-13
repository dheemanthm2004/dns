import express from "express";
import { body, validationResult } from "express-validator";
import { notificationQueue } from "../queue/notificationQueue";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { notificationValidation, validateRequest, sanitizeInput } from "../middleware/validation";

const prisma = new PrismaClient();
const router = express.Router();

router.post(
  "/",
  authenticateToken,
  sanitizeInput,
  notificationValidation,
  validateRequest,
  async (req: AuthRequest, res: express.Response): Promise<void> => {
    const { to, channel, message, subject, sendAt, templateId, variables } = req.body;

    try {
      if (sendAt) {
        // Schedule notification
        const scheduled = await prisma.scheduledNotification.create({
          data: {
            to,
            channel,
            message,
            subject,
            templateId: templateId ? Number(templateId) : null,
            sendAt: new Date(sendAt),
            userId: req.user!.id,
            metadata: { variables }
          },
        });
        res.status(202).json({ 
          status: "scheduled", 
          sendAt,
          scheduledId: scheduled.id 
        });
      } else {
        // Send immediately
        const job = await notificationQueue.add(
          "send",
          { 
            to, 
            channel, 
            message,
            subject,
            templateId: templateId ? Number(templateId) : null,
            userId: req.user!.id,
            variables
          },
          {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 10000,
            },
          }
        );
        res.status(202).json({ 
          status: "queued",
          jobId: job.id 
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get notification status
router.get('/status/:jobId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { jobId } = req.params;
    const job = await notificationQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const status = {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      data: job.data,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason
    };

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
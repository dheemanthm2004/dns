import express from "express";
import { PrismaClient } from "@prisma/client";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { query } from "express-validator";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/", 
  authenticateToken,
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 }),
    query('channel').optional().isIn(['email', 'sms', 'in-app', 'push']),
    query('status').optional().isIn(['success', 'failed', 'pending'])
  ],
  async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const channel = req.query.channel as string;
      const status = req.query.status as string;

      const where: any = {};
      
      // Filter by user's logs only (unless admin)
      if (req.user!.role !== 'ADMIN') {
        where.userId = req.user!.id;
      }

      if (channel) where.channel = channel;
      if (status) where.status = status;

      const [logs, total] = await Promise.all([
        prisma.notificationLog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }),
        prisma.notificationLog.count({ where })
      ]);

      res.json({
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  }
);

// Get single log details
router.get("/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const where: any = { id: parseInt(id) };
    
    // Non-admin users can only see their own logs
    if (req.user!.role !== 'ADMIN') {
      where.userId = req.user!.id;
    }

    const log = await prisma.notificationLog.findFirst({
      where,
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    if (!log) {
      return res.status(404).json({ error: "Log not found" });
    }

    res.json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch log details" });
  }
});

export default router;
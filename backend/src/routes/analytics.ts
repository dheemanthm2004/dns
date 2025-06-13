import express from 'express';
import { AnalyticsService } from '../services/analyticsService';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth';
import { query } from 'express-validator';

const router = express.Router();

// Get dashboard metrics
router.get('/dashboard', 
  authenticateToken,
  [query('days').optional().isInt({ min: 1, max: 365 })],
  async (req: AuthRequest, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const metrics = await AnalyticsService.getDashboardMetrics(req.user!.id, days);
      res.json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get real-time metrics
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    const metrics = await AnalyticsService.getRealTimeMetrics();
    res.json(metrics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get failure analysis
router.get('/failures', 
  authenticateToken,
  requireRole(['ADMIN', 'USER']),
  [query('days').optional().isInt({ min: 1, max: 30 })],
  async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const failures = await AnalyticsService.getTopFailureReasons(days);
      res.json(failures);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Record events (for tracking opens, clicks, etc.)
router.post('/events', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { type, channel, notificationId, metadata } = req.body;
    
    await AnalyticsService.recordEvent({
      type,
      channel,
      userId: req.user!.id,
      notificationId,
      metadata
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
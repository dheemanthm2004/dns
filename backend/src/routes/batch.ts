import express from 'express';
import multer from 'multer';
import { BatchService } from '../services/batchService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Upload CSV for batch notifications
router.post('/upload-csv', 
  authenticateToken, 
  upload.single('csvFile'),
  [
    body('channel').isIn(['email', 'sms', 'in-app', 'push']),
    body('templateId').optional().isInt()
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'CSV file is required' });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      const { channel, templateId } = req.body;

      const result = await BatchService.processBatchFromCSV(
        csvContent,
        channel,
        templateId ? Number(templateId) : undefined,
        req.user!.id
      );

      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Create batch job
router.post('/', 
  authenticateToken,
  [
    body('name').isString().notEmpty(),
    body('channel').isIn(['email', 'sms', 'in-app', 'push']),
    body('recipients').isArray().isLength({ min: 1, max: 1000 }),
    body('message').isString().notEmpty(),
    body('subject').optional().isString(),
    body('templateId').optional().isInt(),
    body('sendAt').optional().isISO8601()
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await BatchService.createBatchJob({
        ...req.body,
        userId: req.user!.id,
        sendAt: req.body.sendAt ? new Date(req.body.sendAt) : undefined
      });

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Get batch status
router.get('/:batchId/status', authenticateToken, async (req, res) => {
  try {
    const { batchId } = req.params;
    const status = await BatchService.getBatchStatus(batchId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Basic XSS prevention
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+="[^"]*"/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitize(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  // Skip query sanitization as it's read-only in Express 5
  next();
};

// Validation rules
export const notificationValidation = [
  body('to').isString().notEmpty().isLength({ max: 255 }),
  body('channel').isIn(['email', 'sms', 'in-app', 'push']),
  body('message').isString().notEmpty().isLength({ max: 5000 }),
  body('subject').optional().isString().isLength({ max: 255 }),
  body('sendAt').optional().isISO8601(),
  body('templateId').optional().isInt({ min: 1 })
];

export const templateValidation = [
  body('name').isString().notEmpty().isLength({ max: 100 }),
  body('subject').optional().isString().isLength({ max: 255 }),
  body('body').isString().notEmpty().isLength({ max: 10000 }),
  body('channel').isIn(['email', 'sms', 'in-app', 'push']),
  body('variables').optional().isArray()
];

export const authValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').optional().isString().trim().isLength({ max: 100 })
];
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    orgId?: number;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'] as string;

    // Check API Key first
    if (apiKey) {
      const user = await AuthService.validateApiKey(apiKey);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          orgId: user.organizationMemberships[0]?.organization?.id
        };
        return next();
      }
    }

    // Check JWT Token
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const rateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  const requests = new Map();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key).filter((time: number) => time > windowStart);
    
    if (userRequests.length >= max) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        resetTime: new Date(userRequests[0] + windowMs).toISOString() 
      });
    }

    userRequests.push(now);
    requests.set(key, userRequests);
    next();
  };
};
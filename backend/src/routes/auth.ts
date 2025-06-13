import express from 'express';
import { AuthService } from '../services/authService';
import { authValidation, validateRequest, sanitizeInput } from '../middleware/validation';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', sanitizeInput, authValidation, validateRequest, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const result = await AuthService.register(email, password, name, role);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', sanitizeInput, authValidation.slice(0, 2), validateRequest, async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Refresh API key
router.post('/refresh-api-key', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const newApiKey = AuthService.generateApiKey();
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { apiKey: newApiKey }
    });
    res.json({ apiKey: newApiKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        apiKey: true,
        createdAt: true,
        organizationMemberships: {
          include: { organization: true }
        }
      }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRES = '24h';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  orgId?: number;
}

export class AuthService {
  static async register(email: string, password: string, name: string, role: string = 'USER') {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role as any,
        apiKey: this.generateApiKey(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        apiKey: true,
        createdAt: true,
      }
    });

    const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
    return { user, token };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ 
      where: { email, isActive: true },
      include: { organizationMemberships: { include: { organization: true } } }
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      orgId: user.organizationMemberships[0]?.organization?.id 
    });

    return { 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        apiKey: user.apiKey,
        organizations: user.organizationMemberships.map(m => m.organization)
      }, 
      token 
    };
  }

  static generateToken(payload: AuthUser): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  }

  static verifyToken(token: string): AuthUser {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  }

  static generateApiKey(): string {
    return 'dhee_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  static async validateApiKey(apiKey: string) {
    return await prisma.user.findUnique({
      where: { apiKey, isActive: true },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        organizationMemberships: { include: { organization: true } }
      }
    });
  }
}
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TemplateService {
  static async createTemplate(data: {
    name: string;
    subject?: string;
    body: string;
    channel: string;
    variables: string[];
    createdBy: number;
    orgId?: number;
  }) {
    return await prisma.notificationTemplate.create({
      data: {
        ...data,
        variables: data.variables || []
      }
    });
  }

  static async getTemplates(userId: number, orgId?: number) {
    return await prisma.notificationTemplate.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { orgId: orgId || undefined }
        ],
        isActive: true
      },
      include: {
        creator: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getTemplate(id: number, userId: number) {
    return await prisma.notificationTemplate.findFirst({
      where: {
        id,
        OR: [
          { createdBy: userId },
          { organization: { members: { some: { userId } } } }
        ],
        isActive: true
      }
    });
  }

  static async renderTemplate(templateId: number, variables: Record<string, any>) {
    const template = await prisma.notificationTemplate.findUnique({
      where: { id: templateId, isActive: true }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    let renderedBody = template.body;
    let renderedSubject = template.subject || '';

    // Simple variable replacement with {{variable}} syntax
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      renderedBody = renderedBody.replace(regex, String(value));
      renderedSubject = renderedSubject.replace(regex, String(value));
    }

    return {
      subject: renderedSubject,
      body: renderedBody,
      channel: template.channel
    };
  }

  static async updateTemplate(id: number, userId: number, data: Partial<{
    name: string;
    subject: string;
    body: string;
    variables: string[];
    isActive: boolean;
  }>) {
    return await prisma.notificationTemplate.updateMany({
      where: {
        id,
        createdBy: userId
      },
      data
    });
  }

  static async deleteTemplate(id: number, userId: number) {
    return await prisma.notificationTemplate.updateMany({
      where: {
        id,
        createdBy: userId
      },
      data: { isActive: false }
    });
  }
}
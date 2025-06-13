import express from 'express';
import { TemplateService } from '../services/templateService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { templateValidation, validateRequest, sanitizeInput } from '../middleware/validation';

const router = express.Router();

// Create template
router.post('/', authenticateToken, sanitizeInput, templateValidation, validateRequest, async (req: AuthRequest, res) => {
  try {
    const template = await TemplateService.createTemplate({
      ...req.body,
      createdBy: req.user!.id,
      orgId: req.user!.orgId
    });
    res.status(201).json(template);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get templates
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const templates = await TemplateService.getTemplates(req.user!.id, req.user!.orgId);
    res.json(templates);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single template
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const template = await TemplateService.getTemplate(Number(id), req.user!.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(template);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update template
router.put('/:id', authenticateToken, sanitizeInput, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await TemplateService.updateTemplate(Number(id), req.user!.id, req.body);
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'Template not found or unauthorized' });
    }
    
    res.json({ message: 'Template updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete template
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const result = await TemplateService.deleteTemplate(Number(id), req.user!.id);
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'Template not found or unauthorized' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Preview template
router.post('/:id/preview', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { variables } = req.body;
    const rendered = await TemplateService.renderTemplate(Number(id), variables || {});
    res.json(rendered);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
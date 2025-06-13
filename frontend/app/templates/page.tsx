'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/components/DashboardLayout';

interface Template {
  id: number;
  name: string;
  subject?: string;
  body: string;
  channel: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  creator: {
    name: string;
    email: string;
  };
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://work-1-gxnyunxxvadenmxk.prod-runtime.all-hands.dev/api';

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      // For demo purposes, using mock data since auth isn't implemented yet
      const mockTemplates: Template[] = [
        {
          id: 1,
          name: 'Welcome Email',
          subject: 'Welcome to DheeNotifications!',
          body: 'Hello {{name}}, welcome to our platform! Your account is now active.',
          channel: 'email',
          variables: ['name'],
          isActive: true,
          createdAt: new Date().toISOString(),
          creator: { name: 'Admin', email: 'admin@dheenotifications.com' }
        },
        {
          id: 2,
          name: 'SMS Alert',
          body: 'Alert: {{message}} - {{timestamp}}',
          channel: 'sms',
          variables: ['message', 'timestamp'],
          isActive: true,
          createdAt: new Date().toISOString(),
          creator: { name: 'System', email: 'system@dheenotifications.com' }
        }
      ];
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📝 Notification Templates</h1>
          <p className="text-gray-600">Create and manage reusable notification templates</p>
        </div>
        <button
          onClick={handleCreateTemplate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-6">Create your first notification template to get started</p>
          <button
            onClick={handleCreateTemplate}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.channel === 'email' ? 'bg-blue-100 text-blue-800' :
                      template.channel === 'sms' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {template.channel === 'email' ? '📧' : template.channel === 'sms' ? '📱' : '🔔'} {template.channel}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    ✏️
                  </button>
                </div>
              </div>

              {template.subject && (
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-500 mb-1">SUBJECT</div>
                  <div className="text-sm text-gray-700 truncate">{template.subject}</div>
                </div>
              )}

              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-1">BODY PREVIEW</div>
                <div className="text-sm text-gray-700 line-clamp-3">{template.body}</div>
              </div>

              {template.variables.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-500 mb-2">VARIABLES</div>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 border-t pt-3">
                Created by {template.creator.name} • {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TemplateModal
          template={editingTemplate}
          onClose={() => setShowCreateModal(false)}
          onSave={fetchTemplates}
        />
      )}
      </div>
    </DashboardLayout>
  );
}

// Template Modal Component
function TemplateModal({
  template,
  onClose,
  onSave
}: {
  template: Template | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    body: template?.body || '',
    channel: template?.channel || 'email',
    variables: template?.variables || []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(template ? 'Template updated successfully!' : 'Template created successfully!');
      onSave();
      onClose();
    } catch (error: any) {
      alert('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {template ? 'Edit Template' : 'Create New Template'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Channel
            </label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({...formData, channel: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email">📧 Email</option>
              <option value="sms">📱 SMS</option>
              <option value="in-app">🔔 In-App</option>
            </select>
          </div>

          {formData.channel === 'email' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email subject line"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message Body
            </label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your message content. Use {{variable}} for dynamic content."
              required
            />
            <div className="text-sm text-gray-500 mt-1">
              Use double curly braces for variables: {`{{name}}, {{email}}, {{date}}`}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : template ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
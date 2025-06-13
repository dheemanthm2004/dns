'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';

const CHANNELS = ['email', 'sms', 'in-app', 'push'];

interface Template {
  id: number;
  name: string;
  channel: string;
  variables: string[];
}

export default function SendNotificationPage() {
  const [to, setTo] = useState('');
  const [channel, setChannel] = useState('email');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sendAt, setSendAt] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (user) {
      fetchTemplates();
    }
  }, [user]);

  useEffect(() => {
    if (templateId) {
      const template = templates.find(t => t.id === Number(templateId));
      setSelectedTemplate(template || null);
      if (template) {
        setChannel(template.channel);
        // Initialize variables
        const newVariables: Record<string, string> = {};
        template.variables.forEach(variable => {
          newVariables[variable] = '';
        });
        setVariables(newVariables);
      }
    } else {
      setSelectedTemplate(null);
      setVariables({});
    }
  }, [templateId, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/templates`);
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to send notifications', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { 
        to, 
        channel, 
        message: selectedTemplate ? undefined : message,
        subject: channel === 'email' ? subject : undefined,
        templateId: templateId ? Number(templateId) : undefined,
        variables: Object.keys(variables).length > 0 ? variables : undefined
      };
      
      if (sendAt) payload.sendAt = sendAt;

      const response = await axios.post(`${API_BASE}/notify`, payload);
      
      addToast(
        sendAt 
          ? `Notification scheduled for ${new Date(sendAt).toLocaleString()}`
          : 'Notification sent successfully! 🚀',
        'success'
      );

      // Reset form
      setTo('');
      setMessage('');
      setSubject('');
      setSendAt('');
      setTemplateId('');
      setVariables({});
    } catch (error: any) {
      addToast(
        error.response?.data?.error || 'Failed to send notification',
        'error'
      );
    }
    setLoading(false);
  };

  const availableTemplates = templates.filter(t => t.channel === channel);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Notification</h1>
          <p className="text-gray-600">Send instant or scheduled notifications through multiple channels</p>
        </div>

        <form onSubmit={handleSend} className="space-y-6">
          {/* Recipient and Channel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient
              </label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                placeholder={
                  channel === 'email' ? 'user@example.com' :
                  channel === 'sms' ? '+1234567890' :
                  'user_id_123'
                }
              />
              {channel === 'email' && (
                <p className="text-xs text-gray-500 mt-1">Use your email: {user?.email}</p>
              )}
              {channel === 'sms' && (
                <p className="text-xs text-gray-500 mt-1">Use test number: +919686490654</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              >
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>
                    {c === 'email' ? '📧' : c === 'sms' ? '📱' : c === 'in-app' ? '🔔' : '📱'} {c.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template (Optional)
            </label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="">Write custom message</option>
              {availableTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Template Variables */}
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Template Variables</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      {variable}
                    </label>
                    <input
                      type="text"
                      value={variables[variable] || ''}
                      onChange={(e) => setVariables({
                        ...variables,
                        [variable]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-blue-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter ${variable}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Message (when no template selected) */}
          {!selectedTemplate && (
            <>
              {channel === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject line"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required={!selectedTemplate}
                  rows={6}
                  placeholder="Enter your message content..."
                />
              </div>
            </>
          )}

          {/* Schedule Option */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Schedule (Optional)
            </label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="datetime-local"
              value={sendAt}
              onChange={(e) => setSendAt(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              Leave empty to send immediately
            </p>
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                <>
                  <span className="mr-2">🚀</span>
                  {sendAt ? 'Schedule Notification' : 'Send Notification'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Test Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setTo(user?.email || 'test@example.com');
                setChannel('email');
                setSubject('Test Email from DheeNotifications');
                setMessage('Hello! This is a test notification from DheeNotifications Enterprise Platform. 🚀');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-lg mb-2">📧</div>
              <div className="font-medium">Test Email</div>
              <div className="text-sm text-gray-600">Send a test email notification</div>
            </button>
            
            <button
              onClick={() => {
                setTo('+919686490654');
                setChannel('sms');
                setMessage('Hello! Test SMS from DheeNotifications! 📱');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-lg mb-2">📱</div>
              <div className="font-medium">Test SMS</div>
              <div className="text-sm text-gray-600">Send a test SMS notification</div>
            </button>

            <button
              onClick={() => {
                setTo('user_123');
                setChannel('in-app');
                setMessage('Hello! Test in-app notification from DheeNotifications! 🔔');
              }}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="text-lg mb-2">🔔</div>
              <div className="font-medium">Test In-App</div>
              <div className="text-sm text-gray-600">Send a test in-app notification</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
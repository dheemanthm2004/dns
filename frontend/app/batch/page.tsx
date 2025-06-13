'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function BatchPage() {
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [formData, setFormData] = useState({
    name: '',
    channel: 'email',
    message: '',
    subject: '',
    recipients: '',
    sendAt: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recipients = formData.recipients
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Batch job created! ${recipients.length} notifications queued.`);
      
      // Reset form
      setFormData({
        name: '',
        channel: 'email',
        message: '',
        subject: '',
        recipients: '',
        sendAt: ''
      });
    } catch (error: any) {
      alert('Failed to create batch job');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    setLoading(true);
    try {
      // Simulate CSV processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('CSV processed successfully! Notifications queued.');
      setCsvFile(null);
    } catch (error: any) {
      alert('Failed to process CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📋 Batch Notifications</h1>
        <p className="text-gray-600">Send notifications to multiple recipients at once</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'csv'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📄 CSV Upload
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'manual' ? (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Welcome Email Campaign"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.sendAt}
                    onChange={(e) => setFormData({...formData, sendAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your message content"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipients (one per line)
                </label>
                <textarea
                  value={formData.recipients}
                  onChange={(e) => setFormData({...formData, recipients: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={
                    formData.channel === 'email' 
                      ? 'user1@example.com\nuser2@example.com\nuser3@example.com'
                      : formData.channel === 'sms'
                      ? '+1234567890\n+0987654321'
                      : 'user_id_1\nuser_id_2\nuser_id_3'
                  }
                  required
                />
                <div className="text-sm text-gray-500 mt-1">
                  Enter one recipient per line. Total recipients: {formData.recipients.split('\n').filter(Boolean).length}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creating Batch Job...' : 'Send Batch Notifications'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCSVSubmit} className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📄</div>
                <div className="mb-4">
                  <label htmlFor="csvFile" className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Click to upload CSV file
                    </span>
                    <input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                </div>
                {csvFile && (
                  <div className="text-sm text-gray-600">
                    Selected: {csvFile.name} ({Math.round(csvFile.size / 1024)} KB)
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-4">
                  CSV should have columns: to, message, subject (for email), and any custom variables
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">CSV Format Example:</h4>
                <pre className="text-sm text-blue-700">
{`to,subject,message,name
user1@example.com,Welcome!,Hello {{name}},John
user2@example.com,Welcome!,Hello {{name}},Jane`}
                </pre>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !csvFile}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing CSV...' : 'Upload and Send'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Recent Batch Jobs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Batch Jobs</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Mock batch job */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Welcome Email Campaign</h4>
                  <div className="text-sm text-gray-600 mt-1">
                    150 recipients • Created today
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  completed
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Sent</div>
                  <div className="font-medium text-green-600">145</div>
                </div>
                <div>
                  <div className="text-gray-500">Failed</div>
                  <div className="font-medium text-red-600">5</div>
                </div>
                <div>
                  <div className="text-gray-500">Success Rate</div>
                  <div className="font-medium">96.7%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
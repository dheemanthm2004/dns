'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setMetrics({
        summary: {
          totalSent: 1247,
          totalDelivered: 1189,
          totalFailed: 58,
          totalOpened: 456,
          deliveryRate: 95.3,
          openRate: 38.4,
          failureRate: 4.7
        },
        channelStats: {
          email: { sent: 847, delivered: 812, failed: 35, opened: 312 },
          sms: { sent: 300, delivered: 287, failed: 13, opened: 144 },
          'in-app': { sent: 100, delivered: 90, failed: 10, opened: 0 }
        }
      });
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor your notification performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Real-time Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg text-white p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
          Live Activity Today
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">247</div>
            <div className="text-sm opacity-90">Email Sent</div>
            <div className="text-xs opacity-75 mt-1">234 delivered • 13 failed</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm opacity-90">SMS Sent</div>
            <div className="text-xs opacity-75 mt-1">87 delivered • 2 failed</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">34</div>
            <div className="text-sm opacity-90">In-App Sent</div>
            <div className="text-xs opacity-75 mt-1">32 delivered • 2 failed</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">94.6%</div>
            <div className="text-sm opacity-90">Success Rate</div>
            <div className="text-xs opacity-75 mt-1">↗ +2.3% from yesterday</div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sent</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.summary.totalSent.toLocaleString()}</p>
                <p className="text-sm text-blue-600">📤 All channels</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl">📤</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-3xl font-bold text-green-600">{metrics.summary.deliveryRate}%</p>
                <p className="text-sm text-green-600">✅ Successfully delivered</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.summary.openRate}%</p>
                <p className="text-sm text-purple-600">👀 User engagement</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <span className="text-2xl">👀</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failure Rate</p>
                <p className="text-3xl font-bold text-red-600">{metrics.summary.failureRate}%</p>
                <p className="text-sm text-red-600">❌ Need attention</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Channel Performance</h3>
          <div className="space-y-4">
            {metrics && Object.entries(metrics.channelStats).map(([channel, stats]: [string, any]) => (
              <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-lg mr-3">
                    {channel === 'email' ? '📧' : channel === 'sms' ? '📱' : '🔔'}
                  </span>
                  <div>
                    <div className="font-medium capitalize">{channel}</div>
                    <div className="text-sm text-gray-600">
                      {stats.sent} sent, {stats.delivered} delivered
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {stats.sent > 0 ? Math.round((stats.delivered / stats.sent) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Daily Trends</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-600">Chart visualization would go here</p>
              <p className="text-sm text-gray-500">Integration with Chart.js or Recharts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">📥 Export Data</h3>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            📊 Export to Excel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            📄 Export to PDF
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            📋 Copy to Clipboard
          </button>
        </div>
      </div>
      </div>
    </DashboardLayout>
  );
}
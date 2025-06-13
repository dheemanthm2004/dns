'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalSent: 0,
    totalSuccess: 0,
    totalFailed: 0,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [logsResponse] = await Promise.all([
        axios.get(`${API_BASE}/logs?limit=10`)
      ]);

      const logs = logsResponse.data.logs || [];
      setStats({
        totalSent: logs.length,
        totalSuccess: logs.filter((log: any) => log.status === 'success').length,
        totalFailed: logs.filter((log: any) => log.status === 'failed').length,
        recentLogs: logs.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE}/../test-db`);
      addToast('✅ Database connection successful!', 'success');
    } catch (error) {
      addToast('❌ Database connection failed', 'error');
    }
  };

  const testQueue = async () => {
    try {
      const response = await axios.post(`${API_BASE}/../test-queue`);
      addToast('✅ Queue test successful!', 'success');
    } catch (error) {
      addToast('❌ Queue test failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your notification command center</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📤</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-3xl font-bold text-green-600">{stats.totalSuccess}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.totalFailed}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/send'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📤</div>
            <div className="font-medium">Send Notification</div>
          </button>
          
          <button
            onClick={testConnection}
            className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🗄️</div>
            <div className="font-medium">Test Database</div>
          </button>

          <button
            onClick={testQueue}
            className="p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-medium">Test Queue</div>
          </button>

          <button
            onClick={() => window.location.href = '/logs'}
            className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 transition-colors text-center"
          >
            <div className="text-2xl mb-2">📜</div>
            <div className="font-medium">View Logs</div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        {stats.recentLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No recent activity</p>
            <p className="text-sm">Send your first notification to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentLogs.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {log.channel === 'email' ? '📧' : log.channel === 'sms' ? '📱' : '🔔'}
                  </span>
                  <div>
                    <div className="font-medium">{log.to}</div>
                    <div className="text-sm text-gray-600 truncate max-w-xs">{log.message}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {log.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm">API Server Online</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm">Database Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm">Queue Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
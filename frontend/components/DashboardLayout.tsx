'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    description: 'Overview & Analytics'
  },
  {
    name: 'Send Notification',
    href: '/send',
    icon: '📤',
    description: 'Send instant notifications'
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: '📝',
    description: 'Manage templates'
  },
  {
    name: 'Batch Send',
    href: '/batch',
    icon: '📋',
    description: 'Bulk notifications'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: '📈',
    description: 'Detailed insights'
  },
  {
    name: 'Logs',
    href: '/logs',
    icon: '📜',
    description: 'Notification history'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: '⚙️',
    description: 'Account settings'
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className={`flex items-center space-x-2 ${isCollapsed ? 'hidden' : ''}`}>
            <div className="text-2xl">🔔</div>
            <div>
              <h1 className="text-lg font-bold">DheeNotifications</h1>
              <p className="text-xs text-gray-400">Enterprise Platform</p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 mb-1 text-sm rounded-lg transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className={`ml-3 ${isCollapsed ? 'hidden' : ''}`}>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className={`p-4 border-t border-gray-700 ${isCollapsed ? 'hidden' : ''}`}>
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-400 truncate">{user?.email || 'user@example.com'}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                user?.role === 'ADMIN' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {user?.role || 'USER'}
              </span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                🚪 Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Welcome back, {user.name}! 👋
              </h2>
              <p className="text-gray-600">Manage your notifications efficiently</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Real-time Status */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>System Online</span>
              </div>

              {/* Notifications Bell */}
              <button className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-gray-700 hidden sm:block">{user?.name || 'User'}</span>
                  <span className="text-gray-500">▼</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="font-medium text-gray-800">{user?.name || 'User'}</div>
                      <div className="text-sm text-gray-500">{user?.email || 'user@example.com'}</div>
                    </div>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      ⚙️ Settings
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      🔑 API Keys
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
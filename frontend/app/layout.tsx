import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

export const metadata: Metadata = {
  title: 'DheeNotifications - Enterprise Notification Platform',
  description: 'Professional notification management system with multi-channel support, templates, analytics, and batch processing.',
  keywords: 'notifications, email, sms, enterprise, api, templates, analytics',
  authors: [{ name: 'Dheemanth M', email: 'dheemanthmadaiah@gmail.com' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🔔</text></svg>" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
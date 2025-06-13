import { Server } from 'socket.io';

let io: Server | null = null;

export function setSocketServer(server: Server) {
  io = server;
  console.log('✅ Socket.IO server configured for in-app notifications');
}

export function sendInApp(to: string, message: string) {
  if (io) {
    io.to(to).emit('notification', { 
      message,
      timestamp: new Date().toISOString(),
      type: 'info'
    });
    console.log(`🔔 In-app notification sent to ${to}`);
    return { success: true };
  } else {
    console.warn('⚠️ Socket.IO server not configured');
    throw new Error('Socket.IO server not configured');
  }
}
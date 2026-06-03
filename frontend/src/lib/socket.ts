import { io, Socket } from 'socket.io-client';
import { getToken } from './api';

const API_URL = import.meta.env.VITE_API_URL || '';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;
let notificationHandler: ((notification: any) => void) | null = null;

export const onNewNotification = (handler: (notification: any) => void) => {
  notificationHandler = handler;
};

export const connectSocket = () => {
  const token = getToken();
  if (!token || socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('new_notification', (notification: any) => {
    console.log('New notification:', notification);
    notificationHandler?.(notification);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    notificationHandler = null;
  }
};

export const getSocket = () => socket;

import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    // In Vite dev & prod behind proxy, connects to same origin
    socketInstance = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('⚡ Connected to Number Clash Multiplayer Server, socket ID:', socketInstance?.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from socket server:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.warn('⚠️ Socket connection warning:', error.message);
    });
  }

  return socketInstance;
}

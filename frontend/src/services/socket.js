import { io } from 'socket.io-client';

// Determine backend URL with explicit fallback hierarchy
const rawBaseUrl = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'https://exptn-backend.onrender.com'
).trim().replace(/\/+$/, '');

const cleanBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl.slice(0, -4) : rawBaseUrl;
const SOCKET_ENDPOINT = cleanBaseUrl || 'https://exptn-backend.onrender.com';

// 1. Shared Socket.IO singleton instance
let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_ENDPOINT, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: false
    });

    // Lifecycle event loggers (safe, no tokens exposed)
    socketInstance.on('connect', () => {
      console.log('⚡ [SOCKET CONNECTED] Real-time live dashboard sync active');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`🔌 [SOCKET DISCONNECTED] Reason: ${reason}`);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`🔄 [SOCKET RECONNECTED] Successful after attempt ${attemptNumber}`);
    });

    socketInstance.on('connect_error', (error) => {
      // Log connection error without exposing sensitive internals
      console.warn('⚠️ [SOCKET NOTICE] Connection negotiation in progress:', error.message || 'Connecting...');
    });

    // 2. Handle browser Back-Forward Cache (bfcache) events
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => {
        // Page entered Back-Forward Cache or was navigated away
        if (socketInstance && socketInstance.connected) {
          // Gracefully disconnect on pagehide to prevent broken transport in cache
          socketInstance.disconnect();
        }
      });

      window.addEventListener('pageshow', (event) => {
        // Page restored from Back-Forward Cache (persisted = true) or loaded fresh
        if (event.persisted && socketInstance && !socketInstance.connected) {
          console.log('🔄 [BFCache RESTORE] Restoring Socket.IO connection...');
          socketInstance.connect();
        }
      });
    }
  }

  return socketInstance;
}

/**
 * Connect the shared socket instance if not already connected
 */
export function connectSocket() {
  const socket = getSocket();
  if (socket && !socket.connected) {
    socket.connect();
  }
  return socket;
}

/**
 * Disconnect the shared socket instance
 */
export function disconnectSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
}

export const socket = getSocket();
export default socket;

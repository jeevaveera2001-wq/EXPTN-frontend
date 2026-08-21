import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { BACKEND_URL, SOCKET_URL } from '../config/api';

const SocketContext = createContext({ socket: null, isConnected: false });

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let s = null;
    try {
      s = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      s.on('connect', () => {
        console.log('⚡ [SOCKET CONNECTED] Real-time live dashboard sync active:', s.id);
        setIsConnected(true);
      });

      s.on('disconnect', () => {
        setIsConnected(false);
      });

      setSocket(s);
    } catch (err) {
      console.warn('Socket connection note:', err.message);
    }

    return () => {
      if (s) s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

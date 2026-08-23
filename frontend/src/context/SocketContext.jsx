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
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 5000,
        autoConnect: true
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

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socket as sharedSocket, getSocket, connectSocket, disconnectSocket } from '../services/socket';

const SocketContext = createContext({
  socket: sharedSocket,
  isConnected: false,
  connectSocket,
  disconnectSocket
});

export function SocketProvider({ children }) {
  const [isConnected, setIsConnected] = useState(sharedSocket.connected);

  useEffect(() => {
    const s = getSocket();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);

    // Initial state sync
    if (s.connected !== isConnected) {
      setIsConnected(s.connected);
    }

    return () => {
      s.off('connect', handleConnect);
      s.off('disconnect', handleDisconnect);
      // Note: Do NOT disconnect the shared singleton during React component unmount/re-render
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: sharedSocket, isConnected, connectSocket, disconnectSocket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);

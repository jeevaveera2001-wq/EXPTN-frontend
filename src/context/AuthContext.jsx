import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ETN_USER');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userObj) => {
    setCurrentUser(userObj);
    localStorage.setItem('ETN_USER', JSON.stringify(userObj));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ETN_USER');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

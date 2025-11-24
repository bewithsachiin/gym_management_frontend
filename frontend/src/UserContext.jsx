import React, { createContext, useContext, useState, useEffect } from 'react';

// Create User Context
const UserContext = createContext();

// 🎨 Debug Helper
const debugUser = {
  info: (msg, data) => console.log(`%c👤 USER INFO → ${msg}`, "color: #2196F3; font-weight: bold;", data || ""),
  success: (msg, data) => console.log(`%c✅ USER SUCCESS → ${msg}`, "color: #4CAF50; font-weight: bold;", data || ""),
  warn: (msg, data) => console.warn(`%c⚠️ USER WARNING → ${msg}`, "color: #FFC107; font-weight: bold;", data || ""),
  error: (msg, data) => console.error(`%c❌ USER ERROR → ${msg}`, "color: #F44336; font-weight: bold;", data || "")
};

// User Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDetails = localStorage.getItem('userDetails');

    debugUser.info('Checking localStorage for saved user');

    if (token && userDetails) {
      try {
        const parsedUser = JSON.parse(userDetails);
        setUser(parsedUser);
        debugUser.success('User loaded from localStorage', parsedUser);
      } catch (error) {
        debugUser.error('Failed to parse saved userDetails', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');
      }
    } else {
      debugUser.warn('No user found in localStorage');
    }

    setLoading(false);
  }, []);

  // Login function to set user
  const login = (userData) => {
    setUser(userData);

    localStorage.setItem('userDetails', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userName', userData.name);
    localStorage.setItem('userEmail', userData.email);
    localStorage.setItem('userRole', userData.role.toLowerCase());
    localStorage.setItem('branchId', userData.branchId);

    debugUser.success('User logged in', userData);
  };

  // Logout function to clear user
  const logout = () => {
    setUser(null);

    localStorage.removeItem('token');
    localStorage.removeItem('userDetails');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('branchId');

    debugUser.warn('User logged out and localStorage cleared');
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use User Context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    debugUser.error('useUser must be used within a UserProvider');
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

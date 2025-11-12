import React, { createContext, useContext, useState, useEffect } from 'react';

// Create User Context
const UserContext = createContext();

// User Provider Component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userDetails = localStorage.getItem('userDetails');

    if (token && userDetails) {
      try {
        const parsedUser = JSON.parse(userDetails);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user details from localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');
      }
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
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

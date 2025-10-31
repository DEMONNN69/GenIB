import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logout as logoutApi } from '../utils/authApi';

interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user');
      
      console.log('Checking auth - Token exists:', !!token);
      console.log('Checking auth - User data:', userData);
      
      if (token && userData && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user data:', parsedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          // Clear invalid data
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } else {
        console.log('No valid auth data found');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    console.log('AuthContext - Login called with userData:', userData);
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('AuthContext - User data stored in localStorage');
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('user');
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

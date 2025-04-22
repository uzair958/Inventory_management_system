import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../utils/api';

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const loadUser = async () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authService.getCurrentUser();

        if (response.data && response.data.user) {
          setUser(response.data.user);
          // Store user data in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(response.data.user));
        } else {
          // If response format is invalid, clear localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // If 401 error, user is simply not authenticated yet - this is not an error
        if (error.response && error.response.status === 401) {
          console.log('User not authenticated yet');
          // Clear localStorage on auth failure
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } else {
          console.error('Failed to load user:', error);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Try to load user from localStorage first for immediate UI update
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('user');
      }
    }

    loadUser();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.data && response.data.user) {
        // Store token and user in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setUser(response.data.user);
        setError(null);
        return true;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('Registering with data:', userData); // Debug log
      const response = await authService.register(userData);
      console.log('Registration response:', response.data); // Debug log

      // Auto-login after successful registration
      if (response.data && response.data.user) {
        // Store token and user in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set user directly from registration response
        setUser(response.data.user);
        return true;
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear state
    setUser(null);

    // Call logout endpoint
    authService.logout();
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    hasRole,
    updateUser,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
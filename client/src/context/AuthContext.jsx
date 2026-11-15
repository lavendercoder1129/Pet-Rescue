import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  registerUser,
  loginUser,
  getMeUser,
  logoutUser,
} from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and check current session on mount
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMeUser();
      if (data && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('pet_rescue_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('pet_rescue_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Register user (Donor or Rescuer)
   */
  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await registerUser(userData);
      if (data.token) {
        localStorage.setItem('pet_rescue_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Log in user
   */
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await loginUser(credentials);
      if (data.token) {
        localStorage.setItem('pet_rescue_token', data.token);
      }
      setUser(data.user);
      return { success: true, user: data.user, message: data.message };
    } catch (err) {
      const msg = err.message || 'Invalid email or password.';
      setAuthError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Log out user
   */
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      localStorage.removeItem('pet_rescue_token');
      setUser(null);
      setAuthError(null);
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    role: user?.role || null,
    register,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

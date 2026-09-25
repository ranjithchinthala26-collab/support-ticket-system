import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('support_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('support_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Verify token validity on load if token present
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('support_user', JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('support_token', jwtToken);
    localStorage.setItem('support_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'customer') => {
    const res = await authApi.register({ name, email, password, role });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('support_token', jwtToken);
    localStorage.setItem('support_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('support_token');
    localStorage.removeItem('support_user');
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    isCustomer: user?.role === 'customer',
    isAgent: user?.role === 'agent',
    login,
    register,
    logout,
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

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/me`);
        setUser(res.data.data);
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        setToken(null);
        delete axios.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      const { token, ...userDataWithoutToken } = res.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userDataWithoutToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, ...userDataWithoutToken } = res.data.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userDataWithoutToken);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    setUser,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user
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
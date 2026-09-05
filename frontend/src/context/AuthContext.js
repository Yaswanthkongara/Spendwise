import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('sw_token');
    if (!token) { setLoading(false); return; }
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Auth request timed out')), 7000)
      );
      const res = await Promise.race([authAPI.me(), timeoutPromise]);
      setUser(res.data.user);
    } catch (err) {
      console.warn('Auth check failed or timed out:', err);
      localStorage.removeItem('sw_token');
      localStorage.removeItem('sw_user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('sw_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('sw_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('sw_token');
    localStorage.removeItem('sw_user');
    setUser(null);
  };

  const updateUser = (updated) => setUser((prev) => ({ ...prev, ...updated }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

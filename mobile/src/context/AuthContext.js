import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../utils/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const savedUser = await SecureStore.getItemAsync('sw_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user', e);
    } finally {
      setLoading(false);
    }
  }

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { token, user: userData } = res.data;
      await SecureStore.setItemAsync('sw_token', token);
      await SecureStore.setItemAsync('sw_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      const { token, user: userData } = res.data;
      await SecureStore.setItemAsync('sw_token', token);
      await SecureStore.setItemAsync('sw_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('sw_token');
    await SecureStore.deleteItemAsync('sw_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API = axios.create({
  baseURL: 'https://spendwise-y484.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('sw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('sw_token');
      await SecureStore.deleteItemAsync('sw_user');
      // Navigation handling will be done in the AuthContext/Navigation layer
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
};

// Expenses
export const expensesAPI = {
  getAll: (params) => API.get('/expenses', { params }),
  create: (data) => API.post('/expenses', data),
  update: (id, data) => API.put(`/expenses/${id}`, data),
  delete: (id) => API.delete(`/expenses/${id}`),
  getAnalytics: () => API.get('/expenses/analytics/summary'),
};

// Budget
export const budgetAPI = {
  get: () => API.get('/budget'),
  set: (data) => API.post('/budget', data),
};

// Users
export const usersAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  updateCurrency: (data) => API.put('/users/currency', data),
  changePassword: (data) => API.put('/users/password', data),
  resetData: () => API.delete('/users/reset'),
};

export default API;

import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('sw_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sw_token');
      localStorage.removeItem('sw_user');
      window.location.href = '/login';
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

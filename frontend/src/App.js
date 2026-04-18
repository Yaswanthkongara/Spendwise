import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import BudgetPage from './pages/BudgetPage';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
      <div className="loading-text">Loading SpendWise...</div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );
  return user ? <Navigate to="/" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e2130', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.07)' },
            success: { iconTheme: { primary: '#34d399', secondary: '#1e2130' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#1e2130' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

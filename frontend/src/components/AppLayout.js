import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/constants';
import ExpenseModal from './ExpenseModal';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '🏠', exact: true },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/budget', label: 'Budget', icon: '🎯' },
  { path: '/transactions', label: 'Transactions', icon: '📋' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
];

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/analytics': 'Analytics & Insights',
  '/budget': 'Budget Manager',
  '/transactions': 'Transaction History',
  '/settings': 'Settings',
};

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  
  // Notification States
  const [showNotifs, setShowNotifs] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const openAdd = () => { setEditExpense(null); setModalOpen(true); };
  const openEdit = (expense) => { setEditExpense(expense); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditExpense(null); };

  const title = PAGE_TITLES[location.pathname] || 'SpendWise';

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">💰</div>
          SpendWise
        </div>
        <nav className="nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-card" onClick={() => navigate('/settings')}>
            <div className="avatar">{getInitials(user?.name)}</div>
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">Student</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        <header className="topbar">
          <div className="page-title">{title}</div>
          <div className="topbar-right">
            <button className="btn btn-ghost" onClick={() => navigate('/transactions')}>
              🔍 Search
            </button>
            <button className="btn btn-primary" onClick={openAdd}>
              + Add Expense
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                className="notif-btn" 
                title="Notifications"
                onClick={() => {
                  setShowNotifs(!showNotifs);
                  setHasUnread(false);
                }}
              >
                🔔
                {hasUnread && <span className="notif-dot" />}
              </button>
              
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <h4>Notifications</h4>
                    <button className="btn-close" onClick={() => setShowNotifs(false)}>✖</button>
                  </div>
                  <div className="notif-list">
                    <div className="notif-item">
                      <div className="notif-icon">🎉</div>
                      <div className="notif-content">
                        <div className="notif-title">Welcome to SpendWise!</div>
                        <div className="notif-time">Just now</div>
                      </div>
                    </div>
                    <div className="notif-item">
                      <div className="notif-icon">💡</div>
                      <div className="notif-content">
                        <div className="notif-title">Set up your first budget to start tracking wisely.</div>
                        <div className="notif-time">2 mins ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <Outlet context={{ openEdit, refreshKey: modalOpen }} />
        </main>
      </div>

      {/* Expense Modal */}
      {modalOpen && (
        <ExpenseModal
          expense={editExpense}
          onClose={closeModal}
          currency={user?.currency || '₹'}
        />
      )}
    </div>
  );
}

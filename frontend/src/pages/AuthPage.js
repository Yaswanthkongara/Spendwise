import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) { toast.error('Fill in all fields'); return; }
    if (signupForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(signupForm.name, signupForm.email, signupForm.password);
      toast.success('Account created! Welcome to SpendWise 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">💰</div>
          SpendWise
        </div>
        <div className="auth-sub">Smart expense tracking for students</div>

        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Login</button>
          <button className={`auth-tab${tab === 'signup' ? ' active' : ''}`} onClick={() => setTab('signup')}>Sign up</button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@university.edu"
                value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" type="text" placeholder="Alex Johnson"
                value={signupForm.name} onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@university.edu"
                value={signupForm.email} onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="At least 6 characters"
                value={signupForm.password} onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
        )}

        <div className="auth-divider">or</div>
        <button className="btn btn-ghost btn-block" onClick={() => {
          setTab('login');
          setLoginForm({ email: 'demo@university.edu', password: 'demo123' });
          toast('Demo credentials filled in — click Sign in!', { icon: '⚡' });
        }}>
          ⚡ Use demo credentials
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
          Your data is stored securely with bcrypt password hashing & JWT auth
        </div>
      </div>
    </div>
  );
}

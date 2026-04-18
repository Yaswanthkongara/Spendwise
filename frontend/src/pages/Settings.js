import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { usersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES, getInitials } from '../utils/constants';

const Toggle = ({ checked, onChange }) => (
  <label className="toggle-wrap">
    <input type="checkbox" className="toggle-input" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="toggle-slider" />
  </label>
);

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);

  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);

  const [prefs, setPrefs] = useState({ budgetAlerts: true, weeklyReport: true, smartInsights: true });
  const [resetting, setResetting] = useState(false);

  const saveProfile = async () => {
    if (!name.trim()) { toast.error('Name cannot be empty'); return; }
    setProfileSaving(true);
    try {
      const res = await usersAPI.updateProfile({ name, email });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setProfileSaving(false); }
  };

  const changePassword = async () => {
    if (!currPassword || !newPassword) { toast.error('Fill in both password fields'); return; }
    if (newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    setPassSaving(true);
    try {
      await usersAPI.changePassword({ currentPassword: currPassword, newPassword });
      setCurrPassword(''); setNewPassword('');
      toast.success('Password changed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPassSaving(false); }
  };

  const setCurrency = async (sym, code) => {
    try {
      const res = await usersAPI.updateCurrency({ currency: sym, currencyCode: code });
      updateUser(res.data.user);
      toast.success(`Currency set to ${code}`);
    } catch { toast.error('Failed to update currency'); }
  };

  const resetData = async () => {
    if (!window.confirm('This will permanently delete ALL your expenses. Are you sure?')) return;
    setResetting(true);
    try {
      await usersAPI.resetData();
      toast.success('All data reset successfully');
      window.dispatchEvent(new Event('expense-updated'));
    } catch { toast.error('Failed to reset data'); }
    finally { setResetting(false); }
  };

  return (
    <div className="grid-2">
      {/* LEFT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Profile */}
        <div className="card">
          <div className="settings-section-title">Profile</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>{getInitials(user?.name)}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{user?.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>{user?.email}</div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="settings-section-title">Change Password</div>
          <div className="form-group">
            <label className="form-label">Current password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={currPassword} onChange={e => setCurrPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">New password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={changePassword} disabled={passSaving}>
            {passSaving ? 'Updating...' : 'Change password'}
          </button>
        </div>

        {/* Currency */}
        <div className="card">
          <div className="settings-section-title">Currency</div>
          <div className="currency-grid">
            {CURRENCIES.map(c => (
              <button
                key={c.code}
                className={`currency-btn${user?.currency === c.symbol ? ' active' : ''}`}
                onClick={() => setCurrency(c.symbol, c.code)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Preferences */}
        <div className="card">
          <div className="settings-section-title">Preferences</div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Budget alerts</div>
              <div className="settings-desc">Notify when budget thresholds are hit</div>
            </div>
            <Toggle checked={prefs.budgetAlerts} onChange={v => setPrefs(p => ({ ...p, budgetAlerts: v }))} />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Weekly report</div>
              <div className="settings-desc">Spending summary every Monday</div>
            </div>
            <Toggle checked={prefs.weeklyReport} onChange={v => setPrefs(p => ({ ...p, weeklyReport: v }))} />
          </div>
          <div className="settings-row">
            <div>
              <div className="settings-label">Smart insights</div>
              <div className="settings-desc">AI-powered spending analysis</div>
            </div>
            <Toggle checked={prefs.smartInsights} onChange={v => setPrefs(p => ({ ...p, smartInsights: v }))} />
          </div>
        </div>

        {/* Account info */}
        <div className="card">
          <div className="settings-section-title">Account Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Member since', new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })],
              ['Account type', 'Student'],
              ['Auth method', 'Email / Password'],
              ['Security', 'bcrypt + JWT'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: 'var(--text3)' }}>{label}</span>
                <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card">
          <div className="settings-section-title">Danger Zone</div>
          <div className="danger-zone">
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--red)', marginBottom: 6 }}>Reset all data</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
              Permanently deletes all expenses. Budget settings will be reset to defaults. This cannot be undone.
            </div>
            <button className="btn btn-danger" onClick={resetData} disabled={resetting}>
              {resetting ? 'Resetting...' : '🗑 Reset all data'}
            </button>
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }} onClick={logout}>
              Log out
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

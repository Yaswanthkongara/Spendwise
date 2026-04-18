import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import toast from 'react-hot-toast';
import { budgetAPI, expensesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { fmt, CAT_ICONS, CAT_COLORS, CATEGORIES } from '../utils/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function BudgetPage() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [budget, setBudget] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [monthlyInput, setMonthlyInput] = useState('');
  const [catInputs, setCatInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [bRes, aRes] = await Promise.all([budgetAPI.get(), expensesAPI.getAnalytics()]);
      setBudget(bRes.data.data);
      setAnalytics(aRes.data.data);
      setMonthlyInput(bRes.data.data.monthlyBudget || '');
      setCatInputs(bRes.data.data.categoryBudgets || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('expense-updated', load);
    return () => window.removeEventListener('expense-updated', load);
  }, [load]);

  const catSpend = {};
  (analytics?.categoryBreakdown || []).forEach(c => { catSpend[c._id] = c.total; });
  const totalSpent = analytics?.thisMonthTotal || 0;
  const monthlyBudget = budget?.monthlyBudget || 0;
  const budgetPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;
  const barColor = budgetPct >= 100 ? '#ef4444' : budgetPct >= 80 ? '#f59e0b' : '#34d399';

  const saveMonthly = async () => {
    if (!monthlyInput || Number(monthlyInput) <= 0) { toast.error('Enter a valid budget'); return; }
    setSaving(true);
    try {
      const res = await budgetAPI.set({ monthlyBudget: parseFloat(monthlyInput) });
      setBudget(res.data.data);
      toast.success('Budget updated!');
    } catch { toast.error('Failed to save budget'); }
    finally { setSaving(false); }
  };

  const saveCatBudget = async (cat) => {
    try {
      const res = await budgetAPI.set({ categoryBudgets: { [cat]: parseFloat(catInputs[cat]) || 0 } });
      setBudget(res.data.data);
      toast.success(`${cat} budget updated`);
    } catch { toast.error('Failed to save'); }
  };

  // Projection chart
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const dailyRate = totalSpent / (today || 1);
  const projLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  const actualArr = projLabels.map((_, i) => i < today ? Math.round(totalSpent * (i + 1) / today) : null);
  const projArr = projLabels.map((_, i) => Math.round(dailyRate * (i + 1)));

  const projData = {
    labels: projLabels,
    datasets: [
      { label: 'Actual', data: actualArr, borderColor: '#6c63ff', backgroundColor: 'rgba(108,99,255,0.08)', fill: true, tension: 0.3, pointRadius: 0, spanGaps: false },
      { label: 'Projected', data: projArr, borderColor: '#f87171', borderDash: [5, 5], tension: 0.3, fill: false, pointRadius: 0 },
      { label: 'Budget', data: projLabels.map(() => monthlyBudget), borderColor: 'rgba(52,211,153,0.5)', borderDash: [2, 4], fill: false, pointRadius: 0 },
    ],
  };
  const projOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, position: 'top',
        labels: { color: '#94a3b8', usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } },
      },
      tooltip: { backgroundColor: '#1e2130', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8' },
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', maxTicksLimit: 10 } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', callback: v => currency + v.toLocaleString('en-IN') } },
    },
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  return (
    <>
      <div className="grid-2">
        {/* Monthly Budget Card */}
        <div className="card">
          <div className="card-header"><div className="card-title">Monthly Budget</div></div>

          {budgetPct >= 100 && <div className="alert alert-danger">🚨 Budget exceeded! You've spent {fmt(totalSpent, currency)}</div>}
          {budgetPct >= 80 && budgetPct < 100 && <div className="alert alert-warn">⚠ {budgetPct}% of budget used. Be careful!</div>}
          {budgetPct >= 50 && budgetPct < 80 && <div className="alert alert-success">✓ Halfway through budget. You're on track.</div>}

          <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
            <input className="form-input" type="number" placeholder={`Set monthly budget (${currency})`}
              value={monthlyInput} onChange={e => setMonthlyInput(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={saveMonthly} disabled={saving}>
              {saving ? '...' : 'Set'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 38, fontWeight: 600, fontFamily: 'DM Mono', color: 'var(--text)' }}>{fmt(monthlyBudget, currency)}</div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>Monthly budget · {budgetPct}% used</div>
          </div>

          <div className="progress-track" style={{ height: 12, marginBottom: 10 }}>
            <div className="progress-bar" style={{ width: budgetPct + '%', background: barColor }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)' }}>
            <span>{fmt(totalSpent, currency)} spent</span>
            <span>{fmt(Math.max(0, monthlyBudget - totalSpent), currency)} remaining</span>
          </div>
        </div>

        {/* Category Budgets */}
        <div className="card">
          <div className="card-header"><div className="card-title">Category Budgets</div></div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {CATEGORIES.map(cat => {
              const limit = catInputs[cat] || 0;
              const spent = catSpend[cat] || 0;
              const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
              const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : CAT_COLORS[cat];
              return (
                <div className="budget-item" key={cat}>
                  <div className="budget-row">
                    <div className="budget-cat">{CAT_ICONS[cat]} {cat}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input
                        type="number" min="0"
                        style={{ width: 80, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', color: 'var(--text)', fontSize: 12, outline: 'none', fontFamily: 'DM Mono' }}
                        value={catInputs[cat] || ''}
                        onChange={e => setCatInputs(p => ({ ...p, [cat]: e.target.value }))}
                        onBlur={() => saveCatBudget(cat)}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="progress-track" style={{ flex: 1 }}>
                      <div className="progress-bar" style={{ width: pct + '%', background: color }} />
                    </div>
                    <span className="budget-nums">{fmt(spent, currency)}/{fmt(limit, currency)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projection Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Spending Projection</div>
            <div className="card-sub">Actual vs projected for this month</div>
          </div>
        </div>
        <div className="chart-wrap-lg">
          <Line data={projData} options={projOptions} />
        </div>
      </div>
    </>
  );
}

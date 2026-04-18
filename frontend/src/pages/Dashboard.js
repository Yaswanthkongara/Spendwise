import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { expensesAPI, budgetAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { fmt, CAT_ICONS, CAT_CLASSES, getLast7Days, formatDate } from '../utils/constants';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [aRes, eRes, bRes] = await Promise.all([
        expensesAPI.getAnalytics(),
        expensesAPI.getAll({ limit: 5, sort: 'latest' }),
        budgetAPI.get(),
      ]);
      setAnalytics(aRes.data.data);
      setRecent(eRes.data.data);
      setBudget(bRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('expense-updated', load);
    return () => window.removeEventListener('expense-updated', load);
  }, [load]);

  const totalMonthly = analytics?.thisMonthTotal || 0;
  const monthlyBudget = budget?.monthlyBudget || 0;
  const budgetPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalMonthly / monthlyBudget) * 100)) : 0;
  const topCat = analytics?.categoryBreakdown?.[0];

  // Trend chart data
  const days7 = getLast7Days();
  const dailyMap = {};
  (analytics?.dailyTotals || []).forEach(d => { dailyMap[d._id] = d.total; });
  const trendData = days7.map(d => dailyMap[d] || 0);
  const trendLabels = days7.map(d => new Date(d).toLocaleDateString('en', { weekday: 'short' }));

  const chartData = {
    labels: trendLabels,
    datasets: [{
      label: 'Spending',
      data: trendData,
      borderColor: '#6c63ff',
      backgroundColor: 'rgba(108,99,255,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6c63ff',
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e2130', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8' } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 }, callback: v => currency + v.toLocaleString('en-IN') } },
    },
  };

  // Smart insights
  const insights = [];
  if (topCat) insights.push({ icon: CAT_ICONS[topCat._id] || '📊', bg: 'rgba(251,191,36,0.15)', text: <><strong>{topCat._id}</strong> is your biggest expense at <strong>{fmt(topCat.total, currency)}</strong> this month</> });
  const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
  if (totalMonthly > 0 && daysLeft > 0) {
    const rate = totalMonthly / (30 - daysLeft || 1);
    const proj = Math.round(rate * 30);
    insights.push({ icon: '📈', bg: 'rgba(248,113,113,0.15)', text: <>At current rate, you'll spend <strong>{fmt(proj, currency)}</strong> this month</> });
  }
  if (monthlyBudget > totalMonthly && daysLeft > 0) {
    const daily = Math.round((monthlyBudget - totalMonthly) / daysLeft);
    insights.push({ icon: '💡', bg: 'rgba(52,211,153,0.15)', text: <>You can spend <strong>{fmt(daily, currency)}/day</strong> for the next {daysLeft} days to stay on budget</> });
  }
  if (budgetPct >= 80) insights.push({ icon: '⚠️', bg: 'rgba(248,113,113,0.12)', text: <><strong>Warning:</strong> You've used {budgetPct}% of your budget this month</> });
  if (!insights.length) insights.push({ icon: '✨', bg: 'rgba(108,99,255,0.12)', text: 'Add more expenses to get personalized spending insights' });

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
      {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
    </div>
  );

  return (
    <>
      {budgetPct >= 80 && (
        <div className={`alert ${budgetPct >= 100 ? 'alert-danger' : 'alert-warn'}`} style={{ marginBottom: 20 }}>
          {budgetPct >= 100 ? '🚨 You have exceeded your monthly budget!' : `⚠ You've used ${budgetPct}% of your budget. Slow down!`}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">💼</div>
          <div className="stat-label">Balance (est.)</div>
          <div className="stat-value">{fmt(Math.max(0, monthlyBudget - totalMonthly), currency)}</div>
          <div className="stat-badge badge-info">remaining</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Monthly Spend</div>
          <div className="stat-value">{fmt(totalMonthly, currency)}</div>
          <div className="stat-badge badge-up">↑ this month</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">🎯</div>
          <div className="stat-label">Budget Used</div>
          <div className="stat-value">{budgetPct}%</div>
          {budgetPct >= 80 && <div className="stat-badge badge-down">⚠ Near limit</div>}
        </div>
        <div className="stat-card red">
          <div className="stat-icon">💸</div>
          <div className="stat-label">Top Category</div>
          <div className="stat-value" style={{ fontSize: 18 }}>
            {topCat ? `${CAT_ICONS[topCat._id]} ${topCat._id}` : '—'}
          </div>
          <div className="stat-badge badge-info">{topCat ? fmt(topCat.total, currency) + ' spent' : 'No data'}</div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="grid-2">
        <div className="card col-span-2">
          <div className="card-header">
            <div>
              <div className="card-title">Spending Trend</div>
              <div className="card-sub">Last 7 days</div>
            </div>
          </div>
          <div className="chart-wrap">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent + Insights */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            <a href="/transactions" className="btn btn-ghost btn-sm">View all →</a>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💸</div>
              <div className="empty-state-text">No transactions yet</div>
              <div className="empty-state-sub">Click "+ Add Expense" to get started</div>
            </div>
          ) : (
            <div className="tx-list">
              {recent.map(e => (
                <div className="tx-item" key={e._id}>
                  <div className={`tx-icon ${CAT_CLASSES[e.category]}`}>{CAT_ICONS[e.category]}</div>
                  <div className="tx-info">
                    <div className="tx-name">{e.notes || e.category}</div>
                    <div className="tx-meta">{e.category} · {formatDate(e.date)}</div>
                  </div>
                  <div className="tx-amount neg">-{fmt(e.amount, currency)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Smart Insights</div>
            <span style={{ fontSize: 11, background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)', padding: '3px 8px', borderRadius: 20 }}>AI powered</span>
          </div>
          {insights.map((ins, i) => (
            <div className="insight-card" key={i}>
              <div className="insight-icon" style={{ background: ins.bg }}>{ins.icon}</div>
              <div className="insight-text">{ins.text}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

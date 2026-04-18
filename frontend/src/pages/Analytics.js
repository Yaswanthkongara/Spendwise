import React, { useState, useEffect, useCallback } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { expensesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { fmt, CAT_COLORS, CAT_ICONS, getLast7Days } from '../utils/constants';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const tooltipStyle = { backgroundColor: '#1e2130', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, titleColor: '#e2e8f0', bodyColor: '#94a3b8' };

export default function Analytics() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await expensesAPI.getAnalytics();
      setAnalytics(res.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('expense-updated', load);
    return () => window.removeEventListener('expense-updated', load);
  }, [load]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;

  const cats = analytics?.categoryBreakdown || [];
  const total = cats.reduce((s, c) => s + c.total, 0);

  // Pie chart
  const pieData = {
    labels: cats.map(c => c._id),
    datasets: [{
      data: cats.map(c => c.total),
      backgroundColor: cats.map(c => CAT_COLORS[c._id] || '#888'),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };
  const pieOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%',
    plugins: { legend: { display: false }, tooltip: { ...tooltipStyle, callbacks: { label: ctx => ` ${fmt(ctx.raw, currency)} (${total > 0 ? Math.round(ctx.raw / total * 100) : 0}%)` } } },
  };

  // Monthly bar
  const barData = {
    labels: ['Last Month', 'This Month'],
    datasets: [{
      data: [analytics?.lastMonthTotal || 0, analytics?.thisMonthTotal || 0],
      backgroundColor: ['rgba(96,165,250,0.7)', 'rgba(108,99,255,0.8)'],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', callback: v => currency + v.toLocaleString('en-IN') } },
    },
  };

  // Weekly line
  const days7 = getLast7Days();
  const weekMap = {};
  (analytics?.dailyTotals || []).forEach(d => { weekMap[d._id] = d.total; });
  const weeklyData = {
    labels: days7.map(d => new Date(d).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Daily Spend',
      data: days7.map(d => weekMap[d] || 0),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52,211,153,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#34d399',
      pointRadius: 4,
    }],
  };
  const weeklyOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { ...tooltipStyle } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', callback: v => currency + v.toLocaleString('en-IN') } },
    },
  };

  return (
    <>
      <div className="grid-2">
        {/* Pie Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Category Breakdown</div>
              <div className="card-sub">{fmt(total, currency)} total this month</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {cats.map(c => (
              <span key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: CAT_COLORS[c._id], display: 'inline-block' }} />
                {c._id} ({total > 0 ? Math.round(c.total / total * 100) : 0}%)
              </span>
            ))}
          </div>
          <div className="chart-wrap-lg">
            {cats.length > 0 ? <Doughnut data={pieData} options={pieOptions} /> : (
              <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-text">No data this month</div></div>
            )}
          </div>
        </div>

        {/* Monthly Bar */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Monthly Comparison</div>
              <div className="card-sub">This month vs last month</div>
            </div>
          </div>
          <div className="chart-wrap-lg">
            <Bar data={barData} options={barOptions} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Last Month</div>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'DM Mono', color: 'var(--blue)' }}>{fmt(analytics?.lastMonthTotal || 0, currency)}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>This Month</div>
              <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'DM Mono', color: 'var(--accent2)' }}>{fmt(analytics?.thisMonthTotal || 0, currency)}</div>
            </div>
            {analytics?.lastMonthTotal > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>Change</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: analytics.thisMonthTotal > analytics.lastMonthTotal ? 'var(--red)' : 'var(--green)' }}>
                  {analytics.thisMonthTotal > analytics.lastMonthTotal ? '↑' : '↓'}
                  {Math.abs(Math.round(((analytics.thisMonthTotal - analytics.lastMonthTotal) / analytics.lastMonthTotal) * 100))}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">Weekly Breakdown</div>
          <div className="card-sub">Daily spending — last 7 days</div>
        </div>
        <div className="chart-wrap">
          <Line data={weeklyData} options={weeklyOptions} />
        </div>
      </div>

      {/* Category Table */}
      <div className="card">
        <div className="card-header"><div className="card-title">Category Summary</div></div>
        {cats.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No data this month</div></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Category</th><th>Transactions</th><th>Amount</th><th>% of Total</th></tr>
            </thead>
            <tbody>
              {cats.map(c => {
                const pct = total > 0 ? Math.round(c.total / total * 100) : 0;
                return (
                  <tr key={c._id}>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{CAT_ICONS[c._id]}</span>{c._id}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{c.count}</td>
                    <td style={{ fontFamily: 'DM Mono', fontWeight: 500 }}>{fmt(c.total, currency)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2 }}>
                          <div style={{ width: pct + '%', height: '100%', background: CAT_COLORS[c._id], borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text2)', minWidth: 30 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { expensesAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { fmt, CAT_ICONS, CAT_CLASSES, CAT_COLORS, CATEGORIES, formatDate } from '../utils/constants';
import ExpenseModal from '../components/ExpenseModal';

export default function Transactions() {
  const { user } = useAuth();
  const currency = user?.currency || '₹';
  const [expenses, setExpenses] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [editExpense, setEditExpense] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await expensesAPI.getAll(params);
      setExpenses(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, sort, search, category, startDate, endDate]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    window.addEventListener('expense-updated', load);
    return () => window.removeEventListener('expense-updated', load);
  }, [load]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, category, sort, startDate, endDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expensesAPI.delete(id);
      toast.success('Expense deleted');
      load();
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (expense) => { setEditExpense(expense); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditExpense(null); };

  return (
    <>
      {/* Filters */}
      <div className="filter-bar">
        <input
          className="search-box"
          placeholder="🔍  Search by description or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="filter-select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
          <option value="highest">Highest amount</option>
          <option value="lowest">Lowest amount</option>
        </select>
        <input className="filter-select" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} title="From date" />
        <input className="filter-select" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} title="To date" />
        <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCategory(''); setSort('latest'); setStartDate(''); setEndDate(''); }}>
          Clear
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No transactions found</div>
            <div className="empty-state-sub">Try adjusting your filters or add a new expense</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Amount</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={`tx-icon ${CAT_CLASSES[e.category]}`} style={{ width: 28, height: 28, fontSize: 13, borderRadius: 7 }}>
                          {CAT_ICONS[e.category]}
                        </span>
                        <span style={{ fontWeight: 500 }}>{e.notes || e.category}</span>
                        {e.isRecurring && (
                          <span style={{ fontSize: 10, background: 'rgba(108,99,255,0.15)', color: 'var(--accent2)', padding: '1px 6px', borderRadius: 10 }}>
                            🔄 {e.recurringFrequency}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="cat-badge" style={{ background: CAT_COLORS[e.category] + '26', color: CAT_COLORS[e.category] }}>
                        {e.category}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', whiteSpace: 'nowrap' }}>{formatDate(e.date)}</td>
                    <td style={{ color: 'var(--text3)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.notes || '—'}
                    </td>
                    <td style={{ fontFamily: 'DM Mono', color: 'var(--red)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      -{fmt(e.amount, currency)}
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)} style={{ marginRight: 4 }}>Edit</button>
                      <button className="btn btn-sm" style={{ background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: 'none', borderRadius: 6, cursor: 'pointer', padding: '5px 10px', fontFamily: 'DM Sans', fontSize: 12 }} onClick={() => handleDelete(e._id)}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? <span key={i} style={{ color: 'var(--text3)', padding: '0 4px' }}>...</span> :
                  <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              )}
            <button className="page-btn" onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages}>→</button>
          </div>
        )}

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 12 }}>
          Showing {expenses.length} of {pagination.total} transactions
        </div>
      </div>

      {modalOpen && (
        <ExpenseModal expense={editExpense} onClose={closeModal} currency={currency} />
      )}
    </>
  );
}

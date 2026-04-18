import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { expensesAPI } from '../utils/api';
import { CATEGORIES } from '../utils/constants';

export default function ExpenseModal({ expense, onClose, currency }) {
  const isEdit = !!expense;
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (expense) {
      setForm({
        amount: expense.amount,
        category: expense.category,
        date: expense.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        notes: expense.notes || '',
        isRecurring: expense.isRecurring || false,
        recurringFrequency: expense.recurringFrequency || '',
      });
    }
  }, [expense]);

  const validate = () => {
    const errs = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(form.amount),
        category: form.category,
        date: form.date,
        notes: form.notes,
        isRecurring: form.isRecurring,
        recurringFrequency: form.isRecurring ? form.recurringFrequency : null,
      };
      if (isEdit) {
        await expensesAPI.update(expense._id, payload);
        toast.success('Expense updated!');
      } else {
        await expensesAPI.create(payload);
        toast.success('Expense added!');
      }
      onClose();
      // Trigger page refresh via custom event
      window.dispatchEvent(new Event('expense-updated'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isEdit ? 'Edit Expense' : 'Add Expense'}</div>

        <div className="form-group">
          <label className="form-label">Amount ({currency})</label>
          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={e => set('amount', e.target.value)}
            autoFocus
          />
          {errors.amount && <div className="form-error">{errors.amount}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={form.date}
            onChange={e => set('date', e.target.value)}
          />
          {errors.date && <div className="form-error">{errors.date}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. Lunch at canteen"
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label className="toggle-wrap">
            <input
              type="checkbox"
              className="toggle-input"
              checked={form.isRecurring}
              onChange={e => set('isRecurring', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Recurring expense</span>
        </div>

        {form.isRecurring && (
          <div className="form-group">
            <label className="form-label">Frequency</label>
            <select className="form-input" value={form.recurringFrequency} onChange={e => set('recurringFrequency', e.target.value)}>
              <option value="">Select frequency</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

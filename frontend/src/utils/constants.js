export const CATEGORIES = ['Food', 'Transport', 'Health', 'Study', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

export const CAT_ICONS = {
  Food: '🍔', Transport: '🚌', Health: '💊', Study: '📚',
  Entertainment: '🎮', Shopping: '🛍️', Utilities: '💡', Other: '📦',
};

export const CAT_COLORS = {
  Food: '#fbbf24', Transport: '#60a5fa', Health: '#f87171',
  Study: '#a78bfa', Entertainment: '#f472b6', Shopping: '#34d399',
  Utilities: '#94a3b8', Other: '#64748b',
};

export const CAT_CLASSES = {
  Food: 'ic-food', Transport: 'ic-transport', Health: 'ic-health',
  Study: 'ic-study', Entertainment: 'ic-entertainment', Shopping: 'ic-shopping',
  Utilities: 'ic-utilities', Other: 'ic-other',
};

export const CURRENCIES = [
  { symbol: '₹', code: 'INR', label: '₹ INR' },
  { symbol: '$', code: 'USD', label: '$ USD' },
  { symbol: '€', code: 'EUR', label: '€ EUR' },
  { symbol: '£', code: 'GBP', label: '£ GBP' },
  { symbol: '¥', code: 'JPY', label: '¥ JPY' },
  { symbol: 'A$', code: 'AUD', label: 'A$ AUD' },
];

export const fmt = (amount, currency = '₹') =>
  currency + Math.abs(Number(amount)).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// @route  GET /api/expenses/analytics/summary
// @desc   Get analytics summary for current user
// @access Private
router.get('/analytics/summary', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month expenses by category
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Last 7 days daily totals
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyTotals = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // This month vs last month
    const thisMonthTotal = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const lastMonthTotal = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Weekly breakdown (current week)
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyBreakdown = await Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfWeek } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        categoryBreakdown,
        dailyTotals,
        thisMonthTotal: thisMonthTotal[0]?.total || 0,
        lastMonthTotal: lastMonthTotal[0]?.total || 0,
        weeklyBreakdown,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  GET /api/expenses
// @desc   Get all expenses with filters, sort, pagination
// @access Private
router.get('/', async (req, res) => {
  try {
    const { category, search, startDate, endDate, sort = 'latest', page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };

    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const sortOptions = {
      latest: { date: -1 },
      oldest: { date: 1 },
      highest: { amount: -1 },
      lowest: { amount: 1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Expense.countDocuments(query);

    const expenses = await Expense.find(query)
      .sort(sortOptions[sort] || { date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  POST /api/expenses
// @desc   Add a new expense
// @access Private
router.post(
  '/',
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('category').isIn(['Food', 'Transport', 'Health', 'Study', 'Entertainment', 'Shopping', 'Utilities', 'Other']).withMessage('Invalid category'),
    body('date').notEmpty().withMessage('Date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const expense = await Expense.create({
        user: req.user._id,
        amount: req.body.amount,
        category: req.body.category,
        date: new Date(req.body.date),
        notes: req.body.notes || '',
        tags: req.body.tags || [],
        isRecurring: req.body.isRecurring || false,
        recurringFrequency: req.body.recurringFrequency || null,
      });

      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route  PUT /api/expenses/:id
// @desc   Update an expense
// @access Private
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    const { amount, category, date, notes, tags, isRecurring, recurringFrequency } = req.body;

    if (amount !== undefined) expense.amount = amount;
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;
    if (tags) expense.tags = tags;
    if (isRecurring !== undefined) expense.isRecurring = isRecurring;
    if (recurringFrequency !== undefined) expense.recurringFrequency = recurringFrequency;

    await expense.save();
    res.json({ success: true, data: expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  DELETE /api/expenses/:id
// @desc   Delete an expense
// @access Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

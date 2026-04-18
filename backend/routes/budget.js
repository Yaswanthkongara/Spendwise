const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route  GET /api/budget
// @desc   Get budget for current user
// @access Private
router.get('/', async (req, res) => {
  try {
    let budget = await Budget.findOne({ user: req.user._id });
    if (!budget) {
      budget = await Budget.create({
        user: req.user._id,
        monthlyBudget: 15000,
        categoryBudgets: {
          Food: 4000, Transport: 2000, Health: 1500, Study: 2500,
          Entertainment: 1500, Shopping: 2000, Utilities: 1000, Other: 500,
        },
      });
    }
    res.json({ success: true, data: budget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  POST /api/budget
// @desc   Set or update budget
// @access Private
router.post('/', async (req, res) => {
  try {
    const { monthlyBudget, categoryBudgets, alertThresholds } = req.body;

    let budget = await Budget.findOne({ user: req.user._id });

    if (budget) {
      if (monthlyBudget !== undefined) budget.monthlyBudget = monthlyBudget;
      if (categoryBudgets) {
        Object.keys(categoryBudgets).forEach((cat) => {
          if (budget.categoryBudgets[cat] !== undefined) {
            budget.categoryBudgets[cat] = categoryBudgets[cat];
          }
        });
      }
      if (alertThresholds) budget.alertThresholds = alertThresholds;
      budget.markModified('categoryBudgets');
      await budget.save();
    } else {
      budget = await Budget.create({ user: req.user._id, monthlyBudget, categoryBudgets, alertThresholds });
    }

    res.json({ success: true, data: budget });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route  PUT /api/users/profile
// @desc   Update profile (name, email)
// @access Private
router.put('/profile', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: 'Email already in use' });
      user.email = email;
    }

    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, currency: user.currency, currencyCode: user.currencyCode } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  PUT /api/users/currency
// @desc   Update currency preference
// @access Private
router.put('/currency', async (req, res) => {
  try {
    const { currency, currencyCode } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { currency, currencyCode },
      { new: true, select: '-password' }
    );
    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  PUT /api/users/password
// @desc   Change password
// @access Private
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route  DELETE /api/users/reset
// @desc   Reset all expense data for user
// @access Private
router.delete('/reset', async (req, res) => {
  try {
    await Expense.deleteMany({ user: req.user._id });
    await Budget.findOneAndUpdate(
      { user: req.user._id },
      {
        monthlyBudget: 15000,
        categoryBudgets: {
          Food: 4000, Transport: 2000, Health: 1500, Study: 2500,
          Entertainment: 1500, Shopping: 2000, Utilities: 1000, Other: 500,
        },
      }
    );
    res.json({ success: true, message: 'All data reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Budget = require('../models/Budget');
const { protect, generateToken } = require('../middleware/auth');

// @route  POST /api/auth/register
// @desc   Register a new user
// @access Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({ name, email, password });

      // Create default budget for user
      await Budget.create({
        user: user._id,
        monthlyBudget: 15000,
        categoryBudgets: {
          Food: 4000, Transport: 2000, Health: 1500, Study: 2500,
          Entertainment: 1500, Shopping: 2000, Utilities: 1000, Other: 500,
        },
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, currency: user.currency, currencyCode: user.currencyCode },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route  POST /api/auth/login
// @desc   Login user
// @access Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, currency: user.currency, currencyCode: user.currencyCode },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route  GET /api/auth/me
// @desc   Get current logged-in user
// @access Private
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;

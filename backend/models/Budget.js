const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    monthlyBudget: {
      type: Number,
      default: 0,
      min: 0,
    },
    categoryBudgets: {
      Food: { type: Number, default: 0 },
      Transport: { type: Number, default: 0 },
      Health: { type: Number, default: 0 },
      Study: { type: Number, default: 0 },
      Entertainment: { type: Number, default: 0 },
      Shopping: { type: Number, default: 0 },
      Utilities: { type: Number, default: 0 },
      Other: { type: Number, default: 0 },
    },
    alertThresholds: {
      fifty: { type: Boolean, default: true },
      eighty: { type: Boolean, default: true },
      hundred: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Budget', budgetSchema);

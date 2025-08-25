const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { sendSMS } = require("../utils/sendSMS");
// Create or update budget
exports.saveOrUpdateBudget = async (req, res) => {
  try {
    const { category, limit, duration } = req.body;
    const userId = req.user._id;

    let budget = await Budget.findOne({ user: userId, category });

    if (budget) {
      budget.limit = limit;
      budget.duration = duration;
      budget.startDate = new Date();
      await budget.save();
    } else {
      budget = await Budget.create({ user: userId, category, limit, duration });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all budgets with spent, remaining days & saved amount
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const budgets = await Budget.find({ user: userId });

    const budgetsWithDetails = await Promise.all(
      budgets.map(async (budget) => {
        const totalSpentAgg = await Transaction.aggregate([
          { $match: { sender: userId, category: budget.category, status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        const spent = totalSpentAgg.length > 0 ? totalSpentAgg[0].total : 0;

        const daysPassed = Math.floor((Date.now() - budget.startDate) / (1000 * 60 * 60 * 24));
        let remainingDays = Math.max(budget.duration - daysPassed, 0);
        let isFrozen = budget.isFrozen || remainingDays === 0;

        // If budget just expired, store savedAmount
        let savedAmount = budget.savedAmount;
        if (isFrozen && remainingDays === 0 && savedAmount === 0) {
          savedAmount = Math.max(budget.limit - spent, 0);
          budget.savedAmount = savedAmount;
          budget.isFrozen = true;
          await budget.save();
        }

        return {
          _id: budget._id,
          category: budget.category,
          limit: budget.limit,
          duration: budget.duration,
          startDate: budget.startDate,
          spent,
          remainingDays,
          isFrozen,
          savedAmount,
        };
      })
    );

    res.json(budgetsWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a budget by _id
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params; // use budget _id

    // Ensure the budget belongs to the logged-in user
    const deleted = await Budget.findOneAndDelete({ _id: id, user: userId });

    if (!deleted) return res.status(404).json({ message: "Budget not found" });

    res.json({ message: `Budget '${deleted.category}' deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const Razorpay = require("razorpay");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { sendTransactionEmail } = require("../utils/email");
const Budget = require("../models/Budget");
const sendSMS = require("../utils/sendSMS");


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Search users
exports.searchUsersController = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ users: [] });

  try {
    const users = await User.find({ email: { $regex: q, $options: "i" } }).limit(5);
    const result = users.map(u => ({ email: u.email, name: u.name, _id: u._id }));
    res.json({ users: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create Razorpay order & pending transaction
exports.createOrder = async (req, res) => {
  try {
    const { senderId, receiverId, amount, category } = req.body;

    if (!senderId || !receiverId || !amount)
      return res.status(400).json({ error: "Missing required fields" });

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!sender || !receiver) return res.status(404).json({ error: "Sender or Receiver not found" });

    if (sender.walletBalance < amount)
      return res.status(400).json({ error: "Insufficient balance" });

    const options = { amount: amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` };
    const order = await razorpay.orders.create(options);

    const transaction = await Transaction.create({
      sender: senderId,
      receiver: receiverId,
      amount: Number(amount),
      razorpayOrderId: order.id,
      status: "pending",
      balanceAfter: sender.walletBalance,
      category: category || "personal",
      budget: { limit: 0, duration: "monthly" },
    });

    res.status(201).json({ order, transactionId: transaction._id });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Capture successful payment
exports.success = async (req, res) => {
  try {
    const { transactionId, razorpayPaymentId } = req.body;
    const transaction = await Transaction.findById(transactionId).populate("sender receiver");
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const sender = transaction.sender;
    const receiver = transaction.receiver;

    if (sender.walletBalance < transaction.amount)
      return res.status(400).json({ message: "Insufficient balance" });

    // Update balances
    sender.walletBalance -= transaction.amount;
    receiver.walletBalance += transaction.amount;
    await sender.save();
    await receiver.save();

    // Update transaction
    transaction.razorpayPaymentId = razorpayPaymentId;
    transaction.status = "success";
    transaction.balanceAfter = sender.walletBalance;
    await transaction.save();

    // --- Send emails ---
    const subject = "Transaction Notification";
    await sendTransactionEmail(
      sender.email,
      subject,
      `You sent ₹${transaction.amount} to ${receiver.name}. Updated balance: ₹${sender.walletBalance}`
    );
    await sendTransactionEmail(
      receiver.email,
      subject,
      `You received ₹${transaction.amount} from ${sender.name}. Updated balance: ₹${receiver.walletBalance}`
    );

    // --- NEW: Budget check with 75% threshold ---
    const budget = await Budget.findOne({ user: sender._id, category: transaction.category });
    if (budget) {
      // Calculate total spent in this category
      const totalSpentAgg = await Transaction.aggregate([
        { $match: { sender: sender._id, category: transaction.category, status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const spent = totalSpentAgg.length > 0 ? totalSpentAgg[0].total : 0;

      // Update budget spent
      budget.spent = spent;
      await budget.save();

      // Calculate 75% threshold
      const thresholdAmount = budget.limit * 0.75;

      // --- Send notifications ---
      const phoneNumber = sender.phone ? `91${sender.phone}` : null;
      if (phoneNumber) {
        // 75% threshold alert
        if (spent >= thresholdAmount && (!budget.notifiedAt || budget.notifiedAt < thresholdAmount)) {
          const message = `⚠️ Notice: You have spent 75% of your budget for "${transaction.category}". Limit: ₹${budget.limit}, Spent: ₹${spent}`;
          await sendSMS(phoneNumber, message);
          console.log("Budget 75% threshold SMS sent:", message);
          budget.notifiedAt = thresholdAmount; // store as threshold sent
          await budget.save();
        }

        // 100% limit alert
        if (spent >= budget.limit && (!budget.notifiedAt || budget.notifiedAt < budget.limit)) {
          const message = `⚠️ Alert! Your budget for "${transaction.category}" has been reached/exceeded. Limit: ₹${budget.limit}, Spent: ₹${spent}`;
          await sendSMS(phoneNumber, message);
          console.log("Budget limit SMS sent:", message);
          budget.notifiedAt = budget.limit; // store as limit sent
          await budget.save();
        }
      }
    }

    res.json({ message: "Payment successful", transaction });
  } catch (err) {
    console.error("Payment capture error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Get transaction history
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update transaction category
exports.updateTransactionCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.body;
    if (!category) return res.status(400).json({ message: "Category required" });

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    transaction.category = category;
    await transaction.save();

    res.json({ message: "Category updated successfully", transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get available category list
exports.getCategories = async (req, res) => {
  try {
    const predefined = ["personal", "gift", "payment", "groceries", "shopping"];
    const transactions = await Transaction.find({}).distinct("category");
    const allCategories = Array.from(new Set([...predefined, ...transactions]));
    res.json(allCategories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Update budget inside a transaction
exports.updateBudgetInTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit, duration, category } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    if (!transaction.budget) {
      return res.status(400).json({ message: "No budget found in this transaction" });
    }

    // update fields
    if (limit) transaction.budget.limit = limit;
    if (duration) transaction.budget.duration = duration;
    if (category) transaction.budget.category = category;

    await transaction.save();
    res.json({ success: true, budget: transaction.budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all transactions with budget
exports.getTransactionsWithBudget = async (req, res) => {
  try {
    const transactions = await Transaction.find({ sender: req.user._id }).populate("sender receiver");
    res.json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
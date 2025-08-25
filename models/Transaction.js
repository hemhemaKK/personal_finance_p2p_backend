const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  category: { type: String, enum: ["personal", "gift", "payment", "groceries", "shopping"], default: "personal" },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  status: { type: String, default: "pending" },
  balanceAfter: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);

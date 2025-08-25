const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
      type: String,
      enum: ["personal", "gift", "payment", "groceries", "shopping"],
      required: true,
    },
    limit: { type: Number, required: true },
    duration: { type: Number, default: 30 }, // in days
    spent: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now },
    isFrozen: { type: Boolean, default: false },
    savedAmount: { type: Number, default: 0 },

    // --- New fields for notifications ---
    thresholdNotified: { type: Boolean, default: false }, // 75% spent alert
    limitNotified: { type: Boolean, default: false },     // 100% spent alert
  },
  { timestamps: true }
);

module.exports = mongoose.model("Budget", budgetSchema);

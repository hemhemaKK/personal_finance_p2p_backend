const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const {
  searchUsersController,
  createOrder,
  success,
  getTransactions,
  updateTransactionCategory,
  getCategories
} = require("../controllers/paymentController");

// Search users
router.get("/search-users", searchUsersController);

// Create order
router.post("/create-order", requireAuth, createOrder);

// Capture payment
router.post("/success", requireAuth, success);

// Get transactions
router.get("/transactions", requireAuth, getTransactions);

// Update category
router.put("/update-category/:id", requireAuth, updateTransactionCategory);

// Get category list
router.get("/categories", requireAuth, getCategories);

// Update budget

module.exports = router;

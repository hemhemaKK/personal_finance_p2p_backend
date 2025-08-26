const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const {
  getAllUsers,
  getAllTransactions,
  getAllTickets,
  getAllContacts,
} = require("../controllers/adminController"); // CommonJS style

const router = express.Router();

// Admin routes
router.get("/users", requireAuth, getAllUsers);
router.get("/transactions", requireAuth, getAllTransactions);
router.get("/tickets", requireAuth, getAllTickets);
router.get("/contacts", requireAuth, getAllContacts);

module.exports = router;

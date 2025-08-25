const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { saveOrUpdateBudget, getBudgets, deleteBudget } = require("../controllers/budgetController");

router.post("/budget", requireAuth, saveOrUpdateBudget);
router.get("/budgets", requireAuth, getBudgets);
router.delete("/budget/:id", requireAuth, deleteBudget);


module.exports = router;

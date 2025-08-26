const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const { getAllUsers } = require("../controllers/adminController");

// Admin route to get all users
router.get("/", requireAuth, getAllUsers);

module.exports = router;

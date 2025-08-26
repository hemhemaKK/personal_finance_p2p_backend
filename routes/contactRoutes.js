const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { requireAuth } = require("../middleware/authMiddleware"); // optional for admin routes

// Public route to submit query
router.post("/", contactController.createContact);

// Admin routes
router.get("/", requireAuth, contactController.getAllContacts);
router.delete("/:id", requireAuth, contactController.deleteContact);

module.exports = router;

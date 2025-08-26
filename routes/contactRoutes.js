const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");
const { verifyAdmin } = require("../middleware/auth"); // optional for admin routes

// Public route to submit query
router.post("/", contactController.createContact);

// Admin routes
router.get("/", verifyAdmin, contactController.getAllContacts);
router.delete("/:id", verifyAdmin, contactController.deleteContact);

module.exports = router;

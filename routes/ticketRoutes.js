const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

// Routes
router.post("/create", verifyToken, ticketController.createTicket);
router.put("/reply/:userId/:ticketId", verifyToken, verifyAdmin, ticketController.replyTicket);
router.delete("/:userId/:ticketId", verifyToken, ticketController.deleteTicket);
router.get("/:userId", verifyToken, ticketController.getTickets);

module.exports = router;

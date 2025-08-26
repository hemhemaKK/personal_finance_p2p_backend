import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getAllTransactions,
  getAllTickets,
  getAllContacts,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin routes
router.get("/users", requireAuth, getAllUsers);
router.get("/transactions", requireAuth, getAllTransactions);
router.get("/tickets", requireAuth, getAllTickets);
router.get("/contacts", requireAuth, getAllContacts);

export default router;

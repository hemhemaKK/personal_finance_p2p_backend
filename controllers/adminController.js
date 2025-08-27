import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Contact from "../models/Contact.js";

const ADMIN_EMAIL = "mcaprojecttestemail@gmail.com";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const users = await User.find().select("-password -otp");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const transactions = await Transaction.find().populate("sender receiver", "name email");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all tickets
export const getAllTickets = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const users = await User.find().select("name email tickets");

    const tickets = users.flatMap(user =>
      (user.tickets || []).map(ticket => ({
        ...ticket.toObject(),
        user: { name: user.name, email: user.email },  // ✅ send user object
      }))
    );

    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Get all contacts
export const getAllContacts = async (req, res) => {
  try {
    if (req.user.email !== ADMIN_EMAIL)
      return res.status(403).json({ message: "Access denied: not admin" });

    const contacts = await Contact.find();
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

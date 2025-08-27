const User = require("../models/User");


// Get tickets of a specific user (Admin or self)
exports.getTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId) {
      // Admin or self access
      if (req.user.role !== "admin" && req.user._id.toString() !== userId)
        return res.status(403).json({ message: "Forbidden" });

      const user = await User.findById(userId);
      return res.json(user.supportTickets);
    } else {
      // Current logged-in user
      const user = await User.findById(req.user._id);
      res.json(user.supportTickets);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) return res.status(400).json({ message: "Subject and message are required" });

    const user = await User.findById(req.user._id);
    const ticket = { subject, message, status: "open" };

    user.supportTickets.push(ticket);
    await user.save();

    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Reply to ticket (Admin)
exports.replyTicket = async (req, res) => {
  try {
    const { userId, ticketId } = req.params;
    const { reply } = req.body;

    if (!reply) return res.status(400).json({ message: "Reply is required" });

    const user = await User.findById(userId);
    const ticket = user.supportTickets.id(ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.reply = reply;
    ticket.replyAt = new Date();
    ticket.status = "closed";
    ticket.updatedAt = new Date();

    await user.save();
    res.json({ message: "Replied successfully", ticket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { userId, ticketId } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById(userId);
    const ticket = user.supportTickets.id(ticketId);

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.remove();
    await user.save();

    res.json({ message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get tickets for a user
exports.getTickets = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role !== "admin" && req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Forbidden" });

    const user = await User.findById(userId);
    res.json(user.supportTickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



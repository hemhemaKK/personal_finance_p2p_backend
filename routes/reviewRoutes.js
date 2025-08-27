const express = require("express");
const router = express.Router();
const User = require("../models/User");

// POST /api/review
router.post("/", async (req, res) => {
  try {
    const { userId, title, comment, rating } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If already reviewed, stop
    if (user.hasReviewed) {
      return res.status(400).json({ message: "You have already reviewed" });
    }

    user.reviews.push({ title, comment, rating });
    user.hasReviewed = true; // ✅ prevent future popups
    await user.save();

    res.json({ message: "Review submitted successfully", reviews: user.reviews });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

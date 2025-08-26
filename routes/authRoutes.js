const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController"); // match file name exactly

// Normal Auth
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify-otp", AuthController.verifyOtp);

// Google OAuth
const passport = require("passport");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // Successful login
    res.json({ user: req.user, msg: "Google login successful" });
  }
);

// ====== REVIEWS ======
router.post("/reviews", AuthController.addReview);             // Create review
router.delete("/reviews/:userId/:reviewId", AuthController.deleteReview); // Delete review

// ====== SUPPORT TICKETS ======
router.post("/tickets", AuthController.createTicket);             // Create ticket
router.delete("/tickets/:userId/:ticketId", AuthController.deleteTicket); // Delete ticket

module.exports = router;

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

dotenv.config();
require("./config/passport"); // Passport strategies

// Import routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const paymentRoutes = require("./routes/paymentRoutes"); 
const budgetRoutes = require("./routes/budgetRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const contactRoutes = require("./routes/contactRoutes");


const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/payment", paymentRoutes); 
app.use("/api/budget", budgetRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/contact", contactRoutes);


// Connect to MongoDB and start server
app.get("/", (req, res) => {
  res.send("✅ Personal Finance P2P Backend is running!");
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch((err) => {
  console.error("❌ DB connection failed:", err.message);
});

// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  otp: Number,
  isVerified: { type: Boolean, default: false },
  googleId: String,
  role: { type: String, default: "user" },
  profilePic: { type: String, default: "" }, // URL or path
  phone: { type: String, default: "" },
  isPhoneVerified: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 1000 },
});

module.exports = mongoose.model("User", userSchema);

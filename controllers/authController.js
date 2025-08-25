// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// helper: generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// helper: send OTP email
const sendOTP = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false, // bypass self-signed certificate error for testing
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // Auth App <no-reply@yourapp.com>
      to: email,
      subject: "Verify your Email - OTP",
      text: `Your OTP is: ${otp}`,
    });

    console.log("OTP sent to:", email);
  } catch (err) {
    console.error("Error sending OTP:", err.message);
    throw err;
  }
};


// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
    });

    await user.save();

    await sendOTP(email, otp);

    res.status(201).json({ msg: "User registered, OTP sent to email" });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }

};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otp !== parseInt(otp)) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    await user.save();

    // Generate JWT after successful verification
    const token = generateToken(user);

    res.json({
      msg: "Email verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error("Error in verifyOtp:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Email not verified" });
    }

    const token = generateToken(user);

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};


const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp"); // remove sensitive info
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

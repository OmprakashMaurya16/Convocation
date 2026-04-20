const Staff = require("../models/staff.model.js");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const staff = await Staff.findOne({ email });

    if (!staff || !(await staff.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: staff._id,
        email: staff.email,
        role: staff.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      name: staff.name,
      role: staff.role,
    });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ success: false, message: "Error occurred while logging in" });
  }
};

module.exports = {
  login,
};

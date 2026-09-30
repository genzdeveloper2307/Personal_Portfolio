const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../middleware/errorMiddleware");
const generateToken = require("../utils/generateToken");

/**
 * @route   POST /api/auth/login
 * @desc    Admin login — returns a JWT on success
 * @access  Public
 *
 * Admin credentials are never hardcoded. The email is compared against
 * ADMIN_EMAIL and the password is checked against ADMIN_PASSWORD_HASH
 * (a bcrypt hash) from environment variables. See scripts/generateAdminHash.js
 * for how to create that hash.
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !adminPasswordHash) {
    console.error(
      "❌ ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set in environment variables"
    );
    return res.status(500).json({
      success: false,
      message: "Admin account is not configured on the server",
    });
  }

  const emailMatches = email.trim().toLowerCase() === adminEmail.trim().toLowerCase();
  const passwordMatches = emailMatches
    ? await bcrypt.compare(password, adminPasswordHash)
    : false;

  if (!emailMatches || !passwordMatches) {
    // Same error message for both cases so we don't reveal which part was wrong
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = generateToken({ email: adminEmail, role: "admin" });

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
  });
});

module.exports = { loginAdmin };

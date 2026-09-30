const jwt = require("jsonwebtoken");

/**
 * Generates a signed JWT for an admin session.
 * @param {{ email: string }} payload
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

module.exports = generateToken;

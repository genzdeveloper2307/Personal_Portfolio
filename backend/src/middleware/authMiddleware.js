const jwt = require("jsonwebtoken");

/**
 * Protects routes by requiring a valid JWT in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success, attaches the decoded payload to req.admin and calls next().
 * On failure, responds with 401 Unauthorized.
 */
const protect = (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    // Let the centralized error handler format JsonWebTokenError /
    // TokenExpiredError consistently.
    next(err);
  }
};

module.exports = { protect };

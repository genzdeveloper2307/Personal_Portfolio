const mongoose = require("mongoose");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @route   GET /api/health
 * @desc    Basic health check for uptime monitoring
 * @access  Public
 */
const getHealth = asyncHandler(async (req, res) => {
  const dbStateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const dbState = dbStateMap[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    success: true,
    status: "OK",
    database: dbState,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

module.exports = { getHealth };

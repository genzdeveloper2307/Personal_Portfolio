const express = require("express");
const { trackVisitor, getVisitorStats } = require("../controllers/visitorController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/visitors/track
router.post("/track", trackVisitor);

// GET /api/visitors/stats  (admin only)
router.get("/stats", protect, getVisitorStats);

module.exports = router;

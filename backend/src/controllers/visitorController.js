const Visitor = require("../models/Visitor");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @route   POST /api/visitors/track
 * @desc    Record a page visit (no personal/sensitive data stored)
 * @access  Public
 */
const trackVisitor = asyncHandler(async (req, res) => {
  const { page, referrer } = req.body;

  const visitor = await Visitor.create({
    page: page && typeof page === "string" ? page.trim().slice(0, 300) : "/",
    referrer:
      referrer && typeof referrer === "string"
        ? referrer.trim().slice(0, 300)
        : "direct",
    userAgent: (req.headers["user-agent"] || "unknown").slice(0, 500),
  });

  res.status(201).json({
    success: true,
    message: "Visit recorded",
    data: {
      id: visitor._id,
      page: visitor.page,
      createdAt: visitor.createdAt,
    },
  });
});

/**
 * @route   GET /api/visitors/stats
 * @desc    Get visitor statistics (admin only)
 * @access  Private
 */
const getVisitorStats = asyncHandler(async (req, res) => {
  const totalVisitors = await Visitor.countDocuments();

  const visitsByPage = await Visitor.aggregate([
    { $group: { _id: "$page", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, page: "$_id", count: 1 } },
  ]);

  const visitsByReferrer = await Visitor.aggregate([
    { $group: { _id: "$referrer", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { _id: 0, referrer: "$_id", count: 1 } },
  ]);

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const visitorsLast7Days = await Visitor.countDocuments({
    createdAt: { $gte: last7Days },
  });

  res.status(200).json({
    success: true,
    data: {
      totalVisitors,
      visitorsLast7Days,
      visitsByPage,
      topReferrers: visitsByReferrer,
    },
  });
});

module.exports = { trackVisitor, getVisitorStats };

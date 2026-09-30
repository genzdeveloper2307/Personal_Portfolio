require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const healthRoutes = require("./src/routes/healthRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const visitorRoutes = require("./src/routes/visitorRoutes");
const authRoutes = require("./src/routes/authRoutes");

const PORT = process.env.PORT || 5000;

const app = express();

// ---------------------------------------------------------------------
// Security & core middleware
// ---------------------------------------------------------------------
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Limit request body size to prevent abuse
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Request logging: concise in production, verbose ("dev") otherwise
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting — applies to all /api routes
const apiLimiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
app.use("/api", apiLimiter);

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Portfolio backend API is running. See /api/health for status.",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/auth", authRoutes);

// 404 handler for unknown routes
app.use(notFound);

// Centralized error handler (must be registered last)
app.use(errorHandler);

// ---------------------------------------------------------------------
// Start server — only after a successful MongoDB connection.
// If the database configuration is missing or the connection fails,
// the process exits instead of starting the server in a broken state.
// ---------------------------------------------------------------------
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

// Handle unexpected promise rejections gracefully
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled rejection: ${err.message}`);
});

module.exports = app;

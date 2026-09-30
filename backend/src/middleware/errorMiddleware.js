/**
 * Handles requests to routes that don't exist.
 * This should be registered AFTER all valid routes.
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
};

/**
 * Centralized error handler. Any error passed to next(err) anywhere
 * in the app (or thrown inside an async controller wrapped with
 * asyncHandler) ends up here.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`❌ ${err.name || "Error"}: ${err.message}`);

  let statusCode = err.statusCode && err.statusCode >= 400 ? err.statusCode : 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for field "${err.path}"`;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `Duplicate value for field "${field}"`
      : "Duplicate field value";
  }

  // Invalid/expired JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? "Internal server error" : message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

/**
 * Wraps an async controller so thrown errors / rejected promises are
 * automatically forwarded to the error handler instead of needing a
 * try/catch in every single controller function.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { notFound, errorHandler, asyncHandler };

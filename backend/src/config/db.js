const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * The server is designed to refuse to start if this connection fails,
 * so we let errors bubble up to the caller (server.js) instead of
 * swallowing them here.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGO_URI is not defined. Please set it in your .env file before starting the server."
    );
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(mongoUri);

  console.log(`✅ MongoDB connected: ${conn.connection.host}`);

  mongoose.connection.on("error", (err) => {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
  });

  return conn;
};

module.exports = connectDB;

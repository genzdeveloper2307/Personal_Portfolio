const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: [true, "Page is required"],
      trim: true,
      maxlength: [300, "Page value is too long"],
      default: "/",
    },
    referrer: {
      type: String,
      trim: true,
      maxlength: [300, "Referrer value is too long"],
      default: "direct",
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, "User agent value is too long"],
    },
    // NOTE: We intentionally do NOT store IP addresses, names, emails,
    // or any other personally identifiable information here.
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

visitorSchema.index({ page: 1 });
visitorSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Visitor", visitorSchema);

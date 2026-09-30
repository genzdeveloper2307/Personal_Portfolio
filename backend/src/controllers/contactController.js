const Contact = require("../models/Contact");
const { asyncHandler } = require("../middleware/errorMiddleware");
const { sendContactNotification } = require("../utils/sendEmail");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @route   POST /api/contact
 * @desc    Receive a message from the portfolio contact form
 * @access  Public
 */
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // --- Manual validation (in addition to Mongoose schema validation) ---
  const errors = [];

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Name is required");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.push("A valid email is required");
  }

  if (!message || typeof message !== "string" || !message.trim()) {
    errors.push("Message is required");
  } else if (message.trim().length > 2000) {
    errors.push("Message cannot exceed 2000 characters");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(". "),
    });
  }

  const contact = await Contact.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject ? subject.trim() : undefined,
    message: message.trim(),
  });

  // Best-effort email notification. The contact message is already
  // safely stored in MongoDB regardless of whether this succeeds.
  sendContactNotification(contact).catch(() => {
    /* errors are already logged inside sendContactNotification */
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: {
      id: contact._id,
      status: contact.status,
      createdAt: contact.createdAt,
    },
  });
});

module.exports = { createContactMessage };

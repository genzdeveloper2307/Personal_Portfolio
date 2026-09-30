const nodemailer = require("nodemailer");

/**
 * Returns true if enough SMTP configuration is present in .env to
 * attempt sending an email.
 */
const isSmtpConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.CONTACT_RECEIVER
  );

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

/**
 * Sends a notification email when a new contact message arrives.
 * This is intentionally "best effort": if SMTP isn't configured or the
 * send fails, we log the issue but never throw — the contact message
 * has already been saved to MongoDB by the time this is called, and
 * that save should never be undone by an email problem.
 *
 * @param {{ name: string, email: string, subject: string, message: string }} contact
 */
const sendContactNotification = async (contact) => {
  if (!isSmtpConfigured()) {
    console.log(
      "ℹ️  SMTP is not configured — skipping email notification (contact message was still saved)."
    );
    return { sent: false, reason: "SMTP not configured" };
  }

  try {
    const mailer = getTransporter();

    await mailer.sendMail({
      from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER,
      replyTo: contact.email,
      subject: `New portfolio message: ${contact.subject || "No subject"}`,
      text: `You received a new message from your portfolio contact form.

Name: ${contact.name}
Email: ${contact.email}
Subject: ${contact.subject || "No subject"}

Message:
${contact.message}`,
      html: `
        <h2>New portfolio contact message</h2>
        <p><strong>Name:</strong> ${escapeHtml(contact.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(contact.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(contact.subject || "No subject")}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(contact.message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    console.log("✅ Contact notification email sent");
    return { sent: true };
  } catch (err) {
    console.error(`❌ Failed to send contact notification email: ${err.message}`);
    return { sent: false, reason: err.message };
  }
};

// Minimal HTML escaping to keep user-submitted content safe inside the email body
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = { sendContactNotification, isSmtpConfigured };

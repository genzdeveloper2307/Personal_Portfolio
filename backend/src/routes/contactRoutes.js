const express = require("express");
const { createContactMessage } = require("../controllers/contactController");

const router = express.Router();

// POST /api/contact
router.post("/", createContactMessage);

module.exports = router;

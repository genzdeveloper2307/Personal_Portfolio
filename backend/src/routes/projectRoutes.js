const express = require("express");
const { getProjects, getProjectById } = require("../controllers/projectController");

const router = express.Router();

// GET /api/projects
router.get("/", getProjects);

// GET /api/projects/:id
router.get("/:id", getProjectById);

module.exports = router;

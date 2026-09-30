const mongoose = require("mongoose");
const Project = require("../models/Project");
const { asyncHandler } = require("../middleware/errorMiddleware");

/**
 * @route   GET /api/projects
 * @desc    Get all active projects (featured first, then by order)
 * @access  Public
 */
const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ active: true }).sort({
    featured: -1, // featured: true (1) sorts before false (0) when descending
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Public
 */
const getProjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID",
    });
  }

  const project = await Project.findOne({ _id: id, active: true });

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.status(200).json({
    success: true,
    data: project,
  });
});

module.exports = { getProjects, getProjectById };

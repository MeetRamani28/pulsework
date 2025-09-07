const express = require("express");
const router = express.Router();
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/AuthMidddlewares");
const {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/ProjectController");

/**
 * @route   POST /projects/create
 * @desc    Create a new project
 * @access  Private (Any authenticated user → becomes manager by default)
 */
router.post("/create", authMiddleware, createProject);

/**
 * @route   GET /projects/my
 * @desc    Get projects where the logged-in user is a manager or member
 * @access  Private
 */
router.get("/my", authMiddleware, getMyProjects);

/**
 * @route   GET /projects/all
 * @desc    Get all projects (Admin/Manager only)
 * @access  Private (Admin, Manager, employee)
 */
router.get(
  "/all",
  authMiddleware,
  roleMiddleware(["admin", "manager", "employee"]),
  getAllProjects
);

/**
 * @route   GET /projects/:id
 * @desc    Get a project by ID
 * @access  Private (Project members, manager, or admin)
 */
router.get("/:id", authMiddleware, getProjectById);

/**
 * @route   PUT /projects/update/:id
 * @desc    Update project details
 * @access  Private (Manager or Admin)
 */
router.put("/update/:id", authMiddleware, updateProject);

/**
 * @route   DELETE /projects/delete/:id
 * @desc    Delete a project
 * @access  Private (Manager or Admin)
 */
router.delete("/delete/:id", authMiddleware, deleteProject);

module.exports = router;

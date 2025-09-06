const express = require("express");
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTasks,
} = require("../controllers/TaskController");
const { authMiddleware } = require("../middlewares/AuthMidddlewares");

/**
 * @route   POST /tasks/create
 * @desc    Create a new task
 * @access  Private (Any logged-in user)
 */
router.post("/create", authMiddleware, createTask);

/**
 * @route   GET /tasks/all
 * @desc    Get all tasks (Admin/Manager only)
 * @access  Private
 */
router.get("/all", authMiddleware, getAllTasks);

/**
 * @route   GET /tasks/project/:projectId
 * @desc    Get all tasks for a specific project
 * @access  Private (Project members, managers, admin)
 */
router.get("/project/:projectId", authMiddleware, getTasksByProject);

/**
 * @route   GET /tasks/:id
 * @desc    Get a single task by ID
 * @access  Private (Project members, managers, admin)
 */
router.get("/:id", authMiddleware, getTaskById);

/**
 * @route   PUT /tasks/update/:id
 * @desc    Update a task
 * @access  Private (Creator, assignee, manager, admin)
 */
router.put("/update/:id", authMiddleware, updateTask);

/**
 * @route   DELETE /tasks/delete/:id
 * @desc    Delete a task
 * @access  Private (Creator, assignee, manager, admin)
 */
router.delete("/delete/:id", authMiddleware, deleteTask);

module.exports = router;

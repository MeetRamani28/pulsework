const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsForTask,
  getCommentsForProject,
  updateComment,
  deleteComment,
} = require("../controllers/CommentController");
const { authMiddleware } = require("../middlewares/AuthMidddlewares");

/**
 * @route   POST /comments/task/:taskId
 * @desc    Add a comment to a specific task
 * @access  Private (Logged-in users)
 */
router.post("/task/:taskId", authMiddleware, addComment);

/**
 * @route   POST /comments/project/:projectId
 * @desc    Add a comment to a specific project
 * @access  Private (Logged-in users)
 */
router.post("/project/:projectId", authMiddleware, addComment);

/**
 * @route   GET /comments/task/:taskId
 * @desc    Get all comments for a specific task
 * @access  Private (Task members, project manager, or admin)
 */
router.get("/task/:taskId", authMiddleware, getCommentsForTask);

/**
 * @route   GET /comments/project/:projectId
 * @desc    Get all comments for a specific project
 * @access  Private (Project members, manager, or admin)
 */
router.get("/project/:projectId", authMiddleware, getCommentsForProject);

/**
 * @route   PUT /comments/update/:id
 * @desc    Update a comment (author or admin only)
 * @access  Private
 */
router.put("/update/:id", authMiddleware, updateComment);

/**
 * @route   DELETE /comments/delete/:id
 * @desc    Delete a comment (author or admin only)
 * @access  Private
 */
router.delete("/delete/:id", authMiddleware, deleteComment);

module.exports = router;

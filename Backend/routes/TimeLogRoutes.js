const express = require("express");
const router = express.Router();
const {
  startLog,
  pauseLog,
  resumeLog,
  stopLog,
  getMyLogs,
  getLogsByTask,
  getLogById,
  deleteLog,
  getAllLogs,
  getDailySummary,
  getAllSummaries,
} = require("../controllers/TimeLogController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/AuthMidddlewares");

/**
 * @route   POST /timelogs/start/:taskId
 * @desc    Start tracking time for a task
 * @access  Private
 */
router.post("/start/:taskId", authMiddleware, startLog);

/**
 * @route   PUT /timelogs/pause/:id
 * @desc    Pause a running task log
 * @access  Private
 */
router.put("/pause/:id", authMiddleware, pauseLog);

/**
 * @route   PUT /timelogs/resume/:id
 * @desc    Resume a paused task log
 * @access  Private
 */
router.put("/resume/:id", authMiddleware, resumeLog);

/**
 * @route   PUT /timelogs/stop/:id
 * @desc    Stop a running task log and finalize duration
 * @access  Private
 */
router.put("/stop/:id", authMiddleware, stopLog);

/**
 * @route   GET /timelogs/me
 * @desc    Get current user's logs
 * @access  Private
 */
router.get("/me", authMiddleware, getMyLogs);

/**
 * @route   GET /timelogs/summaries
 * @desc    Get all daily summaries for current user
 * @access  Private
 */
router.get("/summaries", authMiddleware, getAllSummaries);

/**
 * @route   GET /timelogs/summary?date=YYYY-MM-DD
 * @desc    Get daily summary (total hours + task count) for current user
 * @access  Private
 */
router.get("/summary", authMiddleware, getDailySummary);

/**
 * @route   GET /timelogs/getAllLogs
 * @desc    Get current user's logs (Admin/Manager only)
 * @access  Private
 */
router.get(
  "/getAllLogs",
  authMiddleware,
  roleMiddleware(["admin", "manager", "employee"]),
  getAllLogs
);

/**
 * @route   GET /timelogs/task/:taskId
 * @desc    Get all logs for a specific task
 * @access  Private
 */
router.get("/task/:taskId", authMiddleware, getLogsByTask);

/**
 * @route   GET /timelogs/:id
 * @desc    Get single log by ID
 * @access  Private
 */
router.get("/:id", authMiddleware, getLogById);

/**
 * @route   DELETE /timelogs/delete/:id
 * @desc    Delete a log (only owner or admin)
 * @access  Private
 */
router.delete("/delete/:id", authMiddleware, deleteLog);


module.exports = router;

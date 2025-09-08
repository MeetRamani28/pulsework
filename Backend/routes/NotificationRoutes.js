const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/AuthMidddlewares");
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/NotificationController");

/**
 * @route   POST /notifications/create
 * @desc    Create a new notification (system-triggered)
 * @access  Private
 */
router.post("/create", authMiddleware, createNotification);

/**
 * @route   GET /notifications/user/:userId
 * @desc    Get all notifications for a specific user
 * @access  Private
 */
router.get("/user/:userId", authMiddleware, getUserNotifications);

/**
 * @route   PATCH /notifications/:notificationId/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
router.patch("/:notificationId/read", authMiddleware, markAsRead);

/**
 * @route   PATCH /notifications/user/:userId/read
 * @desc    Mark all notifications as read for a user
 * @access  Private
 */
router.patch("/user/:userId/read", authMiddleware, markAllAsRead);

/**
 * @route   DELETE /notifications/delete/:notificationId
 * @desc    Delete a single notification
 * @access  Private
 */
router.delete("/delete/:notificationId", authMiddleware, deleteNotification);

module.exports = router;

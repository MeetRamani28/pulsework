const Notification = require("../models/Notification");
const User = require("../models/User");

// Create a notification and attach to user
const createNotification = async (req, res, next) => {
  try {
    const { userId, event, projectId, taskId, message } = req.body;

    if (!userId || !event || !message) {
      return res
        .status(400)
        .json({ error: "userId, event, and message are required" });
    }

    const notification = await Notification.create({
      user: userId,
      event,
      project: projectId || null,
      task: taskId || null,
      message,
    });

    // push notification reference into user
    await User.findByIdAndUpdate(userId, {
      $push: { notifications: notification._id },
    });

    res.status(201).json(notification);
  } catch (error) {
    next(error);
  }
};

// Get all notifications for a user
const getUserNotifications = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ user: userId, read: false })
      .populate("project", "name status")
      .populate("task", "title status")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

// Delete a single notification
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // remove reference from user
    await User.findByIdAndUpdate(notification.user, {
      $pull: { notifications: notification._id },
    });

    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

const mongoose = require("mongoose");
const TaskLog = require("../models/TaskLog");
const Task = require("../models/Task");

// Helper: Check valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ==================== Controllers ==================== //

// Start a new log for a task
const startLog = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!isValidObjectId(taskId))
      return res.status(400).json({ message: "Invalid task ID" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Pause any running task for this user today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const runningLogs = await TaskLog.find({
      user: req.user.id,
      isRunning: true,
      startTime: { $gte: todayStart, $lte: todayEnd },
    });

    for (const log of runningLogs) {
      const lastSession = log.sessions[log.sessions.length - 1];
      if (lastSession && lastSession.startedAt) {
        lastSession.endedAt = new Date();
        lastSession.duration =
          (lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 1000;
        log.isRunning = false;
        log.status = "paused";
        await log.save();
      }
    }

    // Start new log for requested task
    const log = new TaskLog({
      task: taskId,
      project: task.project,
      user: req.user.id,
      startTime: new Date(),
      isRunning: true,
      status: "running",
      sessions: [{ startedAt: new Date() }],
    });

    await log.save();

    const populatedLog = await TaskLog.findById(log._id)
      .populate("task", "title")
      .populate("project", "name")
      .populate("user", "name email");

    res.status(201).json(populatedLog);
  } catch (error) {
    next(error);
  }
};

// Pause a running log
const pauseLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    if (log.status !== "running")
      return res.status(400).json({ message: "Log is not running" });

    const lastSession = log.sessions[log.sessions.length - 1];
    if (!lastSession?.startedAt)
      return res.status(400).json({ message: "Session not started properly" });

    lastSession.endedAt = new Date();
    lastSession.duration =
      (lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 1000;

    log.isRunning = false;
    log.status = "paused";
    await log.save();

    const populatedLog = await TaskLog.findById(log._id)
      .populate("task", "title")
      .populate("project", "name")
      .populate("user", "name email");

    res.status(200).json(populatedLog);
  } catch (error) {
    next(error);
  }
};

// Resume a paused log
const resumeLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    if (log.status === "running")
      return res.status(400).json({ message: "Log is already running" });

    // Pause any other running task for this user today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const runningLogs = await TaskLog.find({
      user: req.user.id,
      isRunning: true,
      startTime: { $gte: todayStart, $lte: todayEnd },
    });

    for (const rlog of runningLogs) {
      const lastSession = rlog.sessions[rlog.sessions.length - 1];
      if (lastSession && lastSession.startedAt) {
        lastSession.endedAt = new Date();
        lastSession.duration =
          (lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 1000;
        rlog.isRunning = false;
        rlog.status = "paused";
        await rlog.save();
      }
    }

    // Resume the requested log
    log.sessions.push({ startedAt: new Date() });
    log.isRunning = true;
    log.status = "running";
    await log.save();

    const populatedLog = await TaskLog.findById(log._id)
      .populate("task", "title")
      .populate("project", "name")
      .populate("user", "name email");

    res.status(200).json(populatedLog);
  } catch (error) {
    next(error);
  }
};

// Stop a log (finalize)
const stopLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    if (log.status === "stopped")
      return res.status(400).json({ message: "Log is already stopped" });

    const lastSession = log.sessions[log.sessions.length - 1];
    if (!lastSession?.startedAt)
      return res.status(400).json({ message: "Session not started properly" });

    lastSession.endedAt = new Date();
    lastSession.duration =
      (lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 1000;

    log.isRunning = false;
    log.status = "stopped";
    log.endTime = new Date();
    await log.save();

    const populatedLog = await TaskLog.findById(log._id)
      .populate("task", "title")
      .populate("project", "name")
      .populate("user", "name email");

    res.status(200).json(populatedLog);
  } catch (error) {
    next(error);
  }
};

// Get all logs for current user
const getMyLogs = async (req, res, next) => {
  try {
    const logs = await TaskLog.find({ user: req.user.id })
      .populate("task", "title")
      .populate("project", "name");

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// Get logs for a specific task
const getLogsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!isValidObjectId(taskId))
      return res.status(400).json({ message: "Invalid task ID" });

    const logs = await TaskLog.find({ task: taskId })
      .populate("user", "name email")
      .populate("project", "name");

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// Get single log by ID
const getLogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id)
      .populate("task", "title")
      .populate("user", "name email")
      .populate("project", "name");

    if (!log) return res.status(404).json({ message: "Log not found" });

    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Delete a log
const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    if (log.user.toString() !== req.user.id && req.user.roles !== "admin") {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this log" });
    }

    await log.deleteOne();
    res.status(200).json({ message: "Log deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Get all logs (Admin only)
const getAllLogs = async (req, res, next) => {
  try {
    if (!req.user || req.user.roles !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    const logs = await TaskLog.find()
      .populate("task", "title")
      .populate("project", "name")
      .populate("user", "name email");

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startLog,
  pauseLog,
  resumeLog,
  stopLog,
  getMyLogs,
  getLogsByTask,
  getLogById,
  deleteLog,
  getAllLogs,
};

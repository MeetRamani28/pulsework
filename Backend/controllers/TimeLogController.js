const TaskLog = require("../models/TaskLog");
const Task = require("../models/Task");

// Start a new log for a task
const startLog = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    // check if task exists
    const task = await Task.findById(taskId);
    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    // create new log
    const log = new TaskLog({
      task: taskId,
      project: task.project,
      user: req.user.id,
      startTime: new Date(),
      isRunning: true,
      sessions: [{ startedAt: new Date() }],
    });

    await log.save();
    res.status(201).json(log);
  } catch (error) {
    next(error);
  }
};

// Pause a running log
const pauseLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await TaskLog.findById(id);

    if (!log) {
      const error = new Error("Log not found");
      error.statusCode = 404;
      return next(error);
    }
    if (!log.isRunning) {
      const error = new Error("Log is not running");
      error.statusCode = 400;
      return next(error);
    }

    // find last running session
    const lastSession = log.sessions[log.sessions.length - 1];
    if (!lastSession.startedAt) {
      const error = new Error("Session has not been started properly");
      error.statusCode = 400;
      return next(error);
    }

    lastSession.endedAt = new Date();
    lastSession.duration =
      (lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 1000; // seconds

    log.isRunning = false;
    await log.save();

    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Resume a paused log
const resumeLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await TaskLog.findById(id);

    if (!log) {
      const error = new Error("Log not found");
      error.statusCode = 404;
      return next(error);
    }
    if (log.isRunning) {
      const error = new Error("Log is already running");
      error.statusCode = 400;
      return next(error);
    }

    log.sessions.push({ startedAt: new Date() });
    log.isRunning = true;

    await log.save();
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Stop a running log (finalize)
const stopLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await TaskLog.findById(id);

    if (!log) {
      const error = new Error("Log not found");
      error.statusCode = 404;
      return next(error);
    }
    if (!log.isRunning) {
      const error = new Error("Log is already stopped");
      error.statusCode = 400;
      return next(error);
    }

    const lastSession = log.sessions[log.sessions.length - 1];
    lastSession.endedAt = new Date();
    lastSession.duration =
      (lastSession.endedAt.getTime() - lastSession.startedAt.getTime()) / 1000;

    log.endTime = new Date();
    log.isRunning = false;

    await log.save();
    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Get current user's logs
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

// Get all logs for a specific task
const getLogsByTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
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
    const log = await TaskLog.findById(id)
      .populate("task", "title")
      .populate("user", "name email")
      .populate("project", "name");

    if (!log) {
      const error = new Error("Log not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(log);
  } catch (error) {
    next(error);
  }
};

// Delete a log
const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const log = await TaskLog.findById(id);

    if (!log) {
      const error = new Error("Log not found");
      error.statusCode = 404;
      return next(error);
    }

    if (log.user.toString() !== req.user.id && req.user.roles !== "admin") {
      const error = new Error("Not authorized to delete this log");
      error.statusCode = 403;
      return next(error);
    }

    await log.deleteOne();
    res.status(200).json({ message: "Log deleted successfully" });
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
};

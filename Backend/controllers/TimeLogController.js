const mongoose = require("mongoose");
const TaskLog = require("../models/TaskLog");
const Task = require("../models/Task");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// -------------------- Start a new log --------------------
const startLog = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    if (!isValidObjectId(taskId))
      return res.status(400).json({ message: "Invalid task ID" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Ensure no other running logs for this user
    const runningLog = await TaskLog.findOne({
      user: req.user.id,
      isRunning: true,
    });
    if (runningLog) {
      return res.status(400).json({
        message: "Stop or pause your current log before starting a new one",
      });
    }

    // Find or create log for this task
    let log = await TaskLog.findOne({ task: taskId, user: req.user.id });
    if (!log) {
      log = new TaskLog({
        task: taskId,
        project: task.project,
        user: req.user.id,
        startTime: new Date(),
        isRunning: true,
        status: "running",
        sessions: [{ startedAt: new Date() }],
      });
    } else {
      // Resume new session on existing log
      log.sessions.push({ startedAt: new Date() });
      log.isRunning = true;
      log.status = "running";
      if (!log.startTime) log.startTime = new Date();
    }

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

// -------------------- Pause a log --------------------
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
    lastSession.duration = (lastSession.endedAt - lastSession.startedAt) / 1000;

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

// -------------------- Resume a paused log --------------------
const resumeLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    if (log.status === "running")
      return res.status(400).json({ message: "Log is already running" });

    // Close any other running logs
    const otherRunning = await TaskLog.findOne({
      user: req.user.id,
      isRunning: true,
    });
    if (otherRunning) {
      const lastSession =
        otherRunning.sessions[otherRunning.sessions.length - 1];
      if (lastSession && !lastSession.endedAt) {
        lastSession.endedAt = new Date();
        lastSession.duration =
          (lastSession.endedAt - lastSession.startedAt) / 1000;
      }
      otherRunning.isRunning = false;
      otherRunning.status = "paused";
      await otherRunning.save();
    }

    // Resume requested log
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

// -------------------- Stop a log --------------------
const stopLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    // End the last session if running
    const lastSession = log.sessions[log.sessions.length - 1];
    if (lastSession && !lastSession.endedAt) {
      lastSession.endedAt = new Date();
      lastSession.duration =
        (lastSession.endedAt - lastSession.startedAt) / 1000;
    }

    log.isRunning = false;
    log.status = "stopped"; // explicitly stop
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

// -------------------- Fetch logs --------------------
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

const deleteLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id))
      return res.status(400).json({ message: "Invalid log ID" });

    const log = await TaskLog.findById(id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    if (
      log.user.toString() !== req.user.id &&
      !req.user.roles.includes("admin")
    ) {
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

const getAllLogs = async (req, res, next) => {
  try {
    if (
      !req.user ||
      (!req.user.roles.includes("admin") &&
        !req.user.roles.includes("manager") &&
        !req.user.roles.includes("employee"))
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const logs = await TaskLog.find()
      .populate("task", "title")
      .populate("project", "name")
      .populate("user", "name email");

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// -------------------- Get daily summary --------------------
const getDailySummary = async (req, res, next) => {
  try {
    const { date } = req.query; // expect yyyy-mm-dd
    if (!date) {
      return res.status(400).json({ message: "Date is required (yyyy-mm-dd)" });
    }

    const userId = req.user.id;

    // fetch logs of this user
    const logs = await TaskLog.find({ user: userId }).populate("task", "title");

    let totalSeconds = 0;
    let taskCount = 0;

    logs.forEach((log) => {
      if (typeof log.getDailyDuration === "function") {
        const dailySeconds = log.getDailyDuration(date);
        if (dailySeconds > 0) {
          totalSeconds += dailySeconds;
          taskCount += 1;
        }
      }
    });

    // Convert to hours (decimal)
    const totalHours = parseFloat((totalSeconds / 3600).toFixed(2));

    // Format HH:mm
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const formatted = `${hours}h ${minutes}m`;

    res.status(200).json({
      date,
      totalHours, // decimal, e.g. 0.5
      formatted, // readable, e.g. "0h 30m"
      taskCount,
    });
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
  getDailySummary,
};

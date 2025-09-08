const Task = require("../models/Task");
const Project = require("../models/Project");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ✅ Create a Task
const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      deadline,
      project,
      assignedTo,
    } = req.body;

    if (!title || !project) {
      const error = new Error("Title and Project are required");
      error.statusCode = 400;
      return next(error);
    }

    // Check if project exists
    const projectExists = await Project.findById(project);
    if (!projectExists) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      deadline,
      project,
      assignedTo,
      createdBy: req.user.id, // from authMiddleware
    });

    if (assignedTo) {
      const notif = await Notification.create({
        user: assignedTo,
        task: task._id,
        project: projectExists._id,
        event: "TASK_ASSIGNED",
        message: `You have been assigned task "${task.title}" in project "${projectExists.name}"`,
      });

      await User.findByIdAndUpdate(assignedTo, {
        $push: { notifications: notif._id },
      });
    }

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    next(error);
  }
};

// ✅ Get all tasks (admin only)
const getAllTasks = async (req, res, next) => {
  try {
    // Only admin or manager can view all tasks
    if (!["admin", "manager", "employee"].includes(req.user.roles)) {
      const error = new Error("Not authorized to view all tasks");
      error.statusCode = 403;
      return next(error);
    }

    const tasks = await Task.find()
      .populate("project", "name") // show project name
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// ✅ Get all tasks for a project
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// ✅ Get a single task
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

// ✅ Update a task (creator, assignedTo, admin, or manager)
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    // Authorization check
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id &&
      !["admin", "manager"].includes(req.user.roles)
    ) {
      const error = new Error("Not authorized to update this task");
      error.statusCode = 403;
      return next(error);
    }

    const wasCompleted = task.status === "completed";

    // Update the task
    Object.assign(task, req.body);
    await task.save();

    // 🔔 Notify project manager when completed
    if (!wasCompleted && task.status === "completed") {
      const project = await Project.findById(task.project).populate("manager");
      if (project?.manager) {
        const notif = await Notification.create({
          user: project.manager._id,
          task: task._id,
          project: project._id,
          event: "TASK_COMPLETED",
          message: `Task "${task.title}" has been completed`,
        });

        await User.findByIdAndUpdate(project.manager._id, {
          $push: { notifications: notif._id },
        });
      }
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", updatedTask: task });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete a task (creator, assignedTo, admin, or manager)
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      const error = new Error("Task not found");
      error.statusCode = 404;
      return next(error);
    }

    // Authorization check
    if (
      task.createdBy.toString() !== req.user.id &&
      task.assignedTo?.toString() !== req.user.id &&
      !["admin", "manager"].includes(req.user.roles)
    ) {
      const error = new Error("Not authorized to delete this task");
      error.statusCode = 403;
      return next(error);
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
};

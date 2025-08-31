const Task = require("../models/Task");
const Project = require("../models/Project");

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

    res.status(201).json({ message: "Task created successfully", task });
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

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json({ message: "Task updated successfully", updatedTask });
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
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
};

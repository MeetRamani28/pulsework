const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");

// ✅ Add a new comment (to task or project)
const addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { taskId, projectId } = req.params;

    if (!content) {
      const error = new Error("Comment content is required");
      error.statusCode = 400;
      return next(error);
    }

    // validate task or project existence
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) {
        const error = new Error("Task not found");
        error.statusCode = 404;
        return next(error);
      }
    }
    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        const error = new Error("Project not found");
        error.statusCode = 404;
        return next(error);
      }
    }

    const comment = new Comment({
      content,
      task: taskId || null,
      project: projectId || null,
      user: req.user.id,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// ✅ Get comments for a specific task
const getCommentsForTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.find({ task: taskId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// ✅ Get comments for a specific project
const getCommentsForProject = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const comments = await Comment.find({ project: projectId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

// ✅ Update a comment (only author or admin)
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      return next(error);
    }

    if (comment.user.toString() !== req.user.id && req.user.roles !== "admin") {
      const error = new Error("Not authorized to edit this comment");
      error.statusCode = 403;
      return next(error);
    }

    comment.content = content || comment.content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(error);
  }
};

// ✅ Delete a comment (only author or admin)
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      const error = new Error("Comment not found");
      error.statusCode = 404;
      return next(error);
    }

    if (comment.user.toString() !== req.user.id && req.user.roles !== "admin") {
      const error = new Error("Not authorized to delete this comment");
      error.statusCode = 403;
      return next(error);
    }

    await comment.deleteOne();
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addComment,
  getCommentsForTask,
  getCommentsForProject,
  updateComment,
  deleteComment,
};

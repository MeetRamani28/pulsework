const Project = require("../models/Project");

// Create Project
const createProject = async (req, res, next) => {
  try {
    const { name, description, manager, members, deadline } = req.body;

    if (!name) {
      const error = new Error("Project name is required");
      error.statusCode = 400;
      return next(error);
    }

    const newProject = await Project.create({
      name,
      description,
      manager: manager || req.user.id, // fallback: creator becomes manager
      members: members || [],
      deadline,
    });

    res.status(201).json({ message: "Project created", project: newProject });
  } catch (error) {
    next(error);
  }
};

// Get all projects (admin/manager only)
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

// Get my projects (where I am manager or member)
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ manager: req.user.id }, { members: req.user.id }],
    })
      .populate("manager", "name email")
      .populate("members", "name email");

    res.status(200).json({ projects });
  } catch (error) {
    next(error);
  }
};

// Get project by ID
const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("manager", "name email")
      .populate("members", "name email");

    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ project });
  } catch (error) {
    next(error);
  }
};

// Update Project
const updateProject = async (req, res, next) => {
  try {
    const { name, description, manager, members, status, deadline } = req.body;

    let project = await Project.findById(req.params.id).populate("manager");
    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    // Only manager or admin can update
    if (
      project.manager._id.toString() !== req.user.id &&
      req.user.roles !== "admin"
    ) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      return next(error);
    }

    const wasCompleted = project.status === "completed";

    // Update fields
    project.name = name || project.name;
    project.description = description || project.description;
    project.manager = manager || project.manager;
    project.members = members || project.members;
    project.status = status || project.status;
    project.deadline = deadline || project.deadline;

    await project.save();

    // Notify manager if newly completed
    if (!wasCompleted && project.status === "completed" && project.manager) {
      console.log(
        `Notify manager ${project.manager.name}: Project "${project.name}" completed`
      );
      // TODO: Replace console.log with real notification system
    }

    res.status(200).json({ message: "Project updated", project });
  } catch (error) {
    next(error);
  }
};

// Delete Project
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      const error = new Error("Project not found");
      error.statusCode = 404;
      return next(error);
    }

    // Only manager or admin can delete
    if (
      project.manager.toString() !== req.user.id &&
      req.user.roles !== "admin"
    ) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      return next(error);
    }

    await project.deleteOne();
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
};

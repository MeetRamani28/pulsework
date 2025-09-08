const Project = require("../models/Project");
const Notification = require("../models/Notification");
const User = require("../models/User");

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

    // 🔔 Notify assigned manager
     if (newProject.manager) {
      const notif = await Notification.create({
        user: newProject.manager,
        project: newProject._id,
        event: "PROJECT_ASSIGNED",
        message: `You have been assigned as manager for project "${newProject.name}"`,
      });
      await User.findByIdAndUpdate(newProject.manager, {
        $push: { notifications: notif._id },
      });
    }

    // 🔔 Notify members
    if (members && members.length > 0) {
      for (const memberId of members) {
        const notif = await Notification.create({
          user: memberId,
          project: newProject._id,
          event: "PROJECT_ASSIGNED",
          message: `You have been assigned to project "${newProject.name}"`,
        });
        await User.findByIdAndUpdate(memberId, {
          $push: { notifications: notif._id },
        });
      }
    }

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
    // Keep track of old members
    const oldMembers = project.members.map((m) =>
      typeof m === "object" ? m._id.toString() : m.toString()
    );

    // Update fields
    project.name = name || project.name;
    project.description = description || project.description;
    project.manager = manager || project.manager;
    project.members = members || project.members;
    project.status = status || project.status;
    project.deadline = deadline || project.deadline;

    await project.save();

    const newMembers = members || [];
    const addedMembers = newMembers.filter(
      (m) => !oldMembers.includes(m.toString())
    );

     for (const memberId of addedMembers) {
      const notif = await Notification.create({
        user: memberId,
        project: project._id,
        event: "PROJECT_ASSIGNED",
        message: `You have been added to project "${project.name}"`,
      });
      await User.findByIdAndUpdate(memberId, {
        $push: { notifications: notif._id },
      });
    }

    if (!wasCompleted && project.status === "completed") {
      const admins = await User.find({ roles: "admin" });
      for (const admin of admins) {
        const notif = await Notification.create({
          user: admin._id,
          project: project._id,
          event: "PROJECT_COMPLETED",
          message: `Project "${project.name}" has been completed`,
        });
        await User.findByIdAndUpdate(admin._id, {
          $push: { notifications: notif._id },
        });
      }
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

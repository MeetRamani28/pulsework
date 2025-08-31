const userModel = require("../models/User");

// ✅ Get all users (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await userModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    next(error); // 👈 Pass to error middleware
  }
};

// ✅ Get single user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// ✅ Update user profile (self or admin/manager)
const updateUser = async (req, res, next) => {
  try {
    const { name, email, roles, bio, phone, jobTitle, department, location } = req.body;
    const updateData = { name, email, bio, phone, jobTitle, department, location };

    if (req.file) {
      updateData.profilePicture = `uploads/profile/${req.file.filename}`;
    }

    // Only admin can update roles
    if (roles && req.user.roles === "admin") {
      updateData.roles = roles;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.params.id, updateData, { new: true })
      .select("-password");

    if (!updatedUser) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// ✅ Update my own profile
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, bio, phone, jobTitle, department, location } = req.body;
    const updateData = { name, email, bio, phone, jobTitle, department, location };

    if (req.file) {
      updateData.profilePicture = `uploads/profile/${req.file.filename}`;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(req.user.id, updateData, { new: true })
      .select("-password");

    if (!updatedUser) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// ✅ Delete user (admin only)
const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// ✅ Get logged-in user profile (/me)
const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id).select("-password");
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateMyProfile
};

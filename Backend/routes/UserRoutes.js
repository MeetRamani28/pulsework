const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getCurrentUser,
  updateMyProfile,
} = require("../controllers/UserController");
const {
  authMiddleware,
  roleMiddleware,
} = require("../middlewares/AuthMidddlewares");
const upload = require("../config/multer-config");

/**
 * @route   GET /users/me
 * @desc    Get profile of logged-in user
 * @access  Private
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * @route   PUT /users/me/update
 * @desc    Update my own profile (Employee/Admin/Manager)
 * @access  Private
 */
router.put(
  "/me/update",
  authMiddleware,
  upload.single("profilePicture"),
  updateMyProfile
);

/**
 * @route   GET /users/all
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get("/all", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID (Admin/Manager)
 * @access  Private
 */
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  getUserById
);

/**
 * @route   PUT /users/update/:id
 * @desc    Update user details (Admin/Manager)
 * @access  Private
 */
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["admin", "manager"]),
  upload.single("profilePicture"),
  updateUser
);

/**
 * @route   DELETE /users/delete/:id
 * @desc    Delete a user (Admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteUser
);

module.exports = router;

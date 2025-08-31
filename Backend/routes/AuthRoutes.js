const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
} = require("../controllers/AuthController");
const { authMiddleware } = require("../middlewares/AuthMidddlewares");

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerUser);

/**
 * @route   POST /auth/login
 * @desc    Login user & return token
 * @access  Public
 */
router.post("/login", loginUser);

/**
 * @route   GET /auth/me
 * @desc    Get logged-in user profile
 * @access  Private
 */
router.get("/me", authMiddleware, getCurrentUser);

/**
 * @route   GET /auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post("/logout", authMiddleware, logoutUser);

module.exports = router;

const usermodel = require("../models/User");
const { hashPass } = require("../utils/EncryptPass");
const { generateToken } = require("../utils/GenrateToken");
const { comparePass } = require("../utils/DecryptPass");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email Already Exists, Please Logged In" });
    }
    const hashedPassword = await hashPass(password);
    const newUser = await usermodel.create({
      name,
      email,
      password: hashedPassword,
      roles: roles || "employee",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        roles: newUser.roles,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All Fields Are Required" });
    }

    const user = await usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await comparePass(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = generateToken({ id: user._id, roles: user.roles });

    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = { registerUser, loginUser };

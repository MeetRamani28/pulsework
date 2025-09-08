const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    roles: {
      type: String,
      enum: ["admin", "manager", "employee"],
      default: "employee",
    },
    profilePicture: {
      type: String, // e.g., "uploads/profile/user123.jpg"
      default: "uploads/profile/default.png",
    },
    bio: { type: String, maxlength: 300 },
    phone: { type: String },
    jobTitle: { type: String },
    department: { type: String },
    location: { type: String },
    notifications: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Notification" }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

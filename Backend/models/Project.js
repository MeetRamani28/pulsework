const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // project manager
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // team members
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed"],
      default: "planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Make sure a comment is linked to at least a task or project
commentSchema.pre("save", function (next) {
  if (!this.task && !this.project) {
    return next(new Error("Comment must be linked to a task or project"));
  }
  next();
});

module.exports = mongoose.model("Comment", commentSchema);

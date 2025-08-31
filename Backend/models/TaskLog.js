const mongoose = require("mongoose");

const taskLogSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // shortcut for querying

    startTime: { type: Date }, // when tracking started
    endTime: { type: Date },   // when stopped (final)

    // store multiple play/pause sessions
    sessions: [
      {
        startedAt: { type: Date },
        endedAt: { type: Date },
        duration: { type: Number, default: 0 }, // in seconds
      },
    ],

    totalDuration: { type: Number, default: 0 }, // total time (seconds)

    isRunning: { type: Boolean, default: false }, // currently tracking?

    notes: { type: String },
  },
  { timestamps: true }
);

// ✅ Calculate duration before saving
taskLogSchema.pre("save", function (next) {
  if (this.sessions && this.sessions.length > 0) {
    this.totalDuration = this.sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
  }
  next();
});

module.exports = mongoose.model("TaskLog", taskLogSchema);

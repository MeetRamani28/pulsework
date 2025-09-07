const mongoose = require("mongoose");

// Each work session (between start & pause/stop)
const sessionSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
});

// Main log per task-user
const taskLogSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // redundant but faster queries

    sessions: [sessionSchema], // all play/pause sessions
    totalDuration: { type: Number, default: 0 }, // total in seconds

    isRunning: { type: Boolean, default: false }, // if timer is active
    status: {
      type: String,
      enum: ["running", "paused", "stopped"],
      default: "stopped",
    },

    startTime: { type: Date }, // first ever start
    endTime: { type: Date }, // last stop time

    notes: { type: String }, // optional user notes/comments
  },
  { timestamps: true }
);

// Middleware: update totalDuration when saving
taskLogSchema.pre("save", function (next) {
  if (this.sessions && this.sessions.length > 0) {
    this.totalDuration = this.sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
  }
  next();
});

// ✅ Utility method: Get daily duration for employee
taskLogSchema.methods.getDailyDuration = function (date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  let total = 0;
  this.sessions.forEach((s) => {
    const sessionStart = new Date(s.startedAt);
    const sessionEnd = s.endedAt ? new Date(s.endedAt) : new Date();

    if (sessionEnd >= startOfDay && sessionStart <= endOfDay) {
      // Clip session inside the day
      const start = sessionStart < startOfDay ? startOfDay : sessionStart;
      const end = sessionEnd > endOfDay ? endOfDay : sessionEnd;
      total += (end - start) / 1000; // seconds
    }
  });

  return total;
};

module.exports = mongoose.model("TaskLog", taskLogSchema);

const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 }, // in seconds
});

const taskLogSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // shortcut for querying

    startTime: { type: Date, required: true }, // first session start
    endTime: { type: Date }, // last session end (final)

    sessions: [sessionSchema], // track all play/pause sessions
    totalDuration: { type: Number, default: 0 }, // total time (seconds)

    isRunning: { type: Boolean, default: false }, // currently tracking
    status: {
      type: String,
      enum: ["running", "paused", "stopped"],
      default: "running",
    },

    notes: { type: String },
  },
  { timestamps: true }
);

// ✅ Calculate total duration before saving
taskLogSchema.pre("save", function (next) {
  if (this.sessions && this.sessions.length > 0) {
    this.totalDuration = this.sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
  }
  next();
});

// Optional: Helper method to get daily summary for this log
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
      // Clip session to day boundaries
      const start = sessionStart < startOfDay ? startOfDay : sessionStart;
      const end = sessionEnd > endOfDay ? endOfDay : sessionEnd;
      total += (end - start) / 1000;
    }
  });
  return total; // in seconds
};

module.exports = mongoose.model("TaskLog", taskLogSchema);

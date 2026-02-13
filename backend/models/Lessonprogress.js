const mongoose = require("mongoose");

const LessonProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed"],
      default: "not_started",
      index: true,
    },

    timeSpentSec: {
      type: Number,
      default: 0,
      min: 0,
      max: 60 * 60 * 50, // sanity cap
    },

    lastOpenedAt: { type: Date, default: null, index: true },
    completedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

LessonProgressSchema.index(
  { userId: 1, lessonId: 1 },
  { unique: true }
);

module.exports = mongoose.model("LessonProgress", LessonProgressSchema);

const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
      index: true,
      unique: true, // one quiz per lesson (simple)
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    passPercent: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },

    timeLimitSec: {
      type: Number,
      default: 0, // 0 = no limit
      min: 0,
      max: 7200,
    },

    version: { type: Number, default: 1, min: 1 },
    updatedReason: { type: String, default: "" }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);

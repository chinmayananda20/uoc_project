const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema(
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
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    quizVersion: { type: Number, required: true, min: 1 },


    

    scorePercent: { type: Number, default: 0, min: 0, max: 100 },
    totalQuestions: { type: Number, required: true, min: 1 },
    correctCount: { type: Number, default: 0, min: 0 },

    totalTimeSec: { type: Number, default: 0, min: 0 },

    // Derived fields for adaptivity
    weakTopics: { type: [String], default: [], index: true },

    masteryLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: null, // set after ML prediction
      index: true,
    },

    startedAt: { type: Date, default: Date.now, index: true },
    submittedAt: { type: Date, default: null, index: true },

  },
  
  { timestamps: true }
);

QuizAttemptSchema.index({ userId: 1, quizId: 1, startedAt: -1 });

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);

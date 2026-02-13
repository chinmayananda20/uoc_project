const mongoose = require("mongoose");

const PracticeAnswerSchema = new mongoose.Schema(
  {
    questionKey: { type: String, required: true, trim: true, maxlength: 64 },

    selectedAnswer: { type: mongoose.Schema.Types.Mixed, default: null },

    isCorrect: { type: Boolean, required: true },

    timeSpentMs: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const PracticeAttemptSchema = new mongoose.Schema(
  {
    practiceSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PracticeSet",
      required: true,
      index: true,
    },

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

    answers: { type: [PracticeAnswerSchema], default: [] },

    totalQuestions: { type: Number, required: true, min: 1 },
    correctCount: { type: Number, default: 0, min: 0 },

    scorePercent: { type: Number, default: 0, min: 0, max: 100 },

    masteryAfter: {
      type: String,
      enum: ["low", "medium", "high"],
      default: null,
      index: true,
    },

    startedAt: { type: Date, default: Date.now, index: true },
    submittedAt: { type: Date, default: null, index: true },

    durationSeconds: { type: Number, default: null, min: 0 },

    // Optional: store the chatbot feedback summary that was shown
    feedbackSummary: { type: String, default: "", trim: true, maxlength: 8000 },
  },
  { timestamps: true }
);

PracticeAttemptSchema.index({ userId: 1, practiceSetId: 1, startedAt: -1 });

module.exports = mongoose.model("PracticeAttempt", PracticeAttemptSchema);

const mongoose = require("mongoose");

const QuestionAttemptSchema = new mongoose.Schema(
  {
    quizAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      required: true,
      index: true,
    },

    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },

    topicTag: { type: String, required: true, trim: true, index: true },
    difficulty: { type: Number, required: true, min: 1, max: 5, index: true },

    isCorrect: { type: Boolean, required: true, index: true },
    selectedAnswer: { type: mongoose.Schema.Types.Mixed, default: null },

    timeSpentMs: { type: Number, default: 0, min: 0 },
    attemptNo: { type: Number, default: 1, min: 1 },

    hintUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

 // Allow multiple tries per question, but prevent duplicate attempt numbers
QuestionAttemptSchema.index(
  { quizAttemptId: 1, questionId: 1, attemptNo: 1 },
  { unique: true }
);

// Optional: speed up "latest attempt" queries
QuestionAttemptSchema.index(
  { quizAttemptId: 1, questionId: 1, createdAt: -1 }
);


module.exports = mongoose.model("QuestionAttempt", QuestionAttemptSchema);

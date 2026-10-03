const mongoose = require("mongoose");

const PracticeAnswerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: mongoose.Schema.Types.Mixed },
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    isCorrect: { type: Boolean, required: true }
  },
  { _id: false }
);

const PracticeAttemptSchema = new mongoose.Schema(
  {
    practiceSetId: { type: mongoose.Schema.Types.ObjectId, ref: "PracticeSet", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    answers: { type: [PracticeAnswerSchema], default: [] },
    scorePercent: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    feedbackSummary: { type: String, default: "" },
    completedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeAttempt", PracticeAttemptSchema);

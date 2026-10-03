const mongoose = require("mongoose");

const PracticeQuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [
      {
        key: { type: String, required: true },
        text: { type: String, required: true }
      }
    ],
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
    explanation: { type: String, default: "" },
    topicTag: { type: String, default: "" },
    difficultyLevel: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    sourceQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", default: null }
  },
  { _id: true }
);

const PracticeSetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson", required: true, index: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    quizAttemptId: { type: mongoose.Schema.Types.ObjectId, ref: "QuizAttempt", required: true, index: true },
    masteryLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    weakTopics: { type: [String], default: [] },
    practiceType: { type: String, enum: ["remedial", "reinforcement", "challenge"], required: true },
    questions: { type: [PracticeQuestionSchema], required: true },
    generationMethod: { type: String, enum: ["gemini", "rule_based_fallback"], default: "rule_based_fallback" },
    rejectedSimilarCount: { type: Number, default: 0 },
    generationNotes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "completed"], default: "pending", index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PracticeSet", PracticeSetSchema);

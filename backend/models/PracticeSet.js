const mongoose = require("mongoose");

const PracticeQuestionSchema = new mongoose.Schema(
  {
    // Stable id inside this set (not a Mongo ObjectId)
    questionKey: { type: String, required: true, trim: true, maxlength: 64 },

    type: {
      type: String,
      enum: ["mcq", "multi", "truefalse"],
      default: "mcq",
      index: true,
    },

    prompt: { type: String, required: true, trim: true, maxlength: 5000 },

    options: {
      type: [
        {
          key: { type: String, required: true, trim: true, maxlength: 10 }, // "A","B","C","D"
          text: { type: String, required: true, trim: true, maxlength: 1000 },
        },
      ],
      default: [],
    },

    // Same idea as your Question model: "A" or ["A","C"] etc.
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },

    explanation: { type: String, default: "", trim: true, maxlength: 5000 },

    topicTag: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
      index: true,
    },

    difficulty: { type: Number, default: 3, min: 1, max: 5, index: true },

    order: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const PracticeSetSchema = new mongoose.Schema(
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

    // Why this practice set was generated
    trigger: {
      type: String,
      enum: [
        "post_quiz_low",
        "post_quiz_medium",
        "challenge_high",
        "manual_request",
      ],
      required: true,
      index: true,
    },

    // Targeting signals (from rules or later ML)
    weakTopics: { type: [String], default: [], index: true },

    difficultyTarget: {
      type: String,
      enum: ["low", "medium", "high"],
      required: true,
      index: true,
    },
    sourceQuizAttemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuizAttempt",
      default: null,
      index: true,
    },

    // The generated questions live here (keeps admin Question bank clean)
    questions: {
      type: [PracticeQuestionSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "PracticeSet must contain at least one question.",
      },
    },

    // Optional: store model/provenance for reproducibility
    aiMeta: {
      model: { type: String, default: null },
      promptVersion: { type: String, default: null },
      inputHash: { type: String, default: null },
    },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
      index: true,
    },

    expiresAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
);

// Ensure unique question order within a set (in code you should generate order 1..n)
PracticeSetSchema.index({ userId: 1, lessonId: 1, createdAt: -1 });

module.exports = mongoose.model("PracticeSet", PracticeSetSchema);

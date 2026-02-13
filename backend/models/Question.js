const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, maxlength: 10 }, // "A","B","C","D"
    text: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["mcq", "multi", "truefalse", "code_trace"],
      default: "mcq",
      index: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    options: {
      type: [OptionSchema],
      default: [],
      // For non-MCQ types, you can keep it empty.
    },

    // For mcq/truefalse: single key like "A"
    // For multi: array of keys like ["A","C"]
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    topicTag: {
      type: String,
      required: true,
      trim: true,
      index: true,
      maxlength: 80,
    },

    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    published: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// unique order per quiz
QuestionSchema.index({ quizId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Question", QuestionSchema);

const mongoose = require("mongoose");

const LessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Micro-lesson content
    content: {
      type: String, // markdown for now (simple + flexible)
      required: true,
    },

    order: {
      type: Number,
      required: true,
      min: 1,
    },

    estimatedTime: {
      type: Number, // minutes
      required: true,
      min: 1,
      max: 30,
    },

    // hasQuiz: {
    //   type: Boolean,
    //   default: false,
    // },

    // quizId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Quiz", // optional, can be null
    //   default: null,
    // },

    // published: {
    //   type: Boolean,
    //   default: false,
    //   index: true,
    // },
  },
  { timestamps: true }
);

// Prevent duplicate lesson order inside the same course
LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", LessonSchema);

const mongoose = require("mongoose");

const EnrollmentSchema = new mongoose.Schema(
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

    status: {
      type: String,
      enum: ["enrolled", "completed", "dropped"],
      default: "enrolled",
      index: true,
    },


    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    lastLessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      default: null,
    },

    // completedLessonIds: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Lesson",
    //   },
    // ],

    startedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", EnrollmentSchema);

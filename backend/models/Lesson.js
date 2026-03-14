const mongoose = require("mongoose");

const SlideElementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["heading", "subheading", "text", "image", "bullets"],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  { _id: false }
);

const SlideSchema = new mongoose.Schema(
  {
    elements: {
      type: [SlideElementSchema],
      required: true,
      default: [],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Each slide must have at least one element",
      },
    },
    // optional admin label for their own reference
    label: { type: String, trim: true, maxlength: 80, default: "" },
  },
  { _id: true }
);

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

    // NEW: slide structure
    slides: {
      type: [SlideSchema],
      required: true,
      default: [],
      validate: {
        validator(arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "slides are required and must contain at least one slide",
      },
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
  },
  { timestamps: true }
);

// Prevent duplicate lesson order inside the same course
LessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", LessonSchema);

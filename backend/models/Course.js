const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    tags: { type: [String], default: [], index: true },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    published: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

CourseSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Course", CourseSchema);

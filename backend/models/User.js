const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    student_number: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    resetPasswordTokenHash: { type: String },
  resetPasswordExpires: { type: Date }
  },
  { timestamps: true }
);
mongoose.models = {};

module.exports = mongoose.model("User", UserSchema);
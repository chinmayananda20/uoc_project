const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    student_number: {
      type: String,
      unique: true,
      sparse: true,
      required: function () {
        return this.role === "student";
      },
    },

    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },

    role: { type: String, enum: ["student", "admin", "staff"], default: "student" },

    resetPasswordTokenHash: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);

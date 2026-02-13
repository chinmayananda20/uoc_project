const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const ALLOWED_ROLES = ["student", "admin", "staff"];

// mail transporter (same as forgotpassword.js)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET /api/admin/users
exports.adminListUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("name email student_number role createdAt updatedAt")
      .sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// PATCH /api/admin/users/:id/role
exports.adminUpdateUserRole = async (req, res) => {
  try {
    const targetId = req.params.id;
    const { role } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    if (!ALLOWED_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }

    if (String(req.user?.id) === String(targetId) && role !== "admin") {
      return res.status(400).json({ error: "You cannot remove your own admin role" });
    }

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = role;
    await user.save();

    return res.json({ id: user._id, role: user.role });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

// POST /api/admin/users/admin
// Creates admin with random temp password (unknown to A1), then emails reset link to A2
exports.adminCreateAdminAndSendReset = async (req, res) => {
  try {
    const { name, email } = req.body || {};

    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const normEmail = String(email).toLowerCase().trim();
    const normName = String(name).trim();

    const existing = await User.findOne({ email: normEmail });
    if (existing) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 1) Generate random temp password (not revealed)
    const tempPassword = crypto.randomBytes(24).toString("base64url"); // strong
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(tempPassword, salt);

    // 2) Create admin user
    const user = await User.create({
      name: normName,
      email: normEmail,
      password: hashed,
      role: "admin",
      // student_number not required for admin
    });

    // 3) Generate reset token (same as forgotpassword.js)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // 4) Email reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(
      normEmail
    )}&token=${rawToken}`;

    const mailOptions = {
      from: `"UOC Support" <${process.env.EMAIL_USER}>`,
      to: normEmail,
      subject: "Set your password (Admin account created)",
      html: `
        <p>An admin account has been created for you.</p>
        <p>Set your password using this link:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "Admin created. Password setup link has been sent to their email.",
      id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error("adminCreateAdminAndSendReset error:", err);
    return res.status(500).json({ error: "Something went wrong!" });
  }
};

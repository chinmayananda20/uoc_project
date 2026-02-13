const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const {
  adminListUsers,
  adminUpdateUserRole,
  adminCreateAdminAndSendReset,
} = require("../controllers/adminUserController");

// Admin-only: list users
router.get("/users", auth, requireRole("admin"), adminListUsers);

// Admin-only: update role
router.patch("/users/:id/role", auth, requireRole("admin"), adminUpdateUserRole);

// Admin-only: create admin + send reset link
router.post("/users/admin", auth, requireRole("admin"), adminCreateAdminAndSendReset);

module.exports = router;

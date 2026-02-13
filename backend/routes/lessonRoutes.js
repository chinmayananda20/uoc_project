const express = require("express");
const router = express.Router();
const requireEnrollment = require("../middlewares/requireEnrollment");

const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

// Admin CRUD
router.post("/courses/:courseId/lessons", auth, requireRole("admin"), createLesson);
router.patch("/lessons/:lessonId", auth, requireRole("admin"), updateLesson);
router.delete("/lessons/:lessonId", auth, requireRole("admin"), deleteLesson);

// Public/student views
router.get("/courses/:courseId/lessons", auth,
  requireEnrollment({ courseIdParam: "courseId" }),getLessonsByCourse);

// Needs auth because later you will enforce enrollment
router.get("/lessons/:lessonId", auth,requireEnrollment({ lessonIdParam: "lessonId" }), getLessonById);

module.exports = router;

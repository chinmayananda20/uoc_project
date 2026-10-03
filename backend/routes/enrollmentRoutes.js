const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const {
  enrollInCourse,
  getMyEnrollments,
  dropCourse,
  getAllEnrollments,
  getCourseEnrollments,
  getCourseProgress,
} = require("../controllers/enrollmentController");

// Student/admin enroll
router.post("/courses/:courseId/enroll", auth, enrollInCourse);

// Student/admin view own enrollments
router.get("/me/enrollments", auth, getMyEnrollments);

// Student drop (simple)
router.patch("/courses/:courseId/enrollment/drop", auth, dropCourse);

// Student get course progress
router.get("/courses/:courseId/progress", auth, getCourseProgress);

// Optional: admin view all
router.get("/enrollments", auth, requireRole("admin"), getAllEnrollments);

// Admin/Staff view students in a course
router.get("/courses/:courseId/enrollments", auth, requireRole("admin", "staff"), getCourseEnrollments);

module.exports = router;

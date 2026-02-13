const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const {
  enrollInCourse,
  getMyEnrollments,
  dropCourse,
  getAllEnrollments,
} = require("../controllers/enrollmentController");

// Student/admin enroll
router.post("/courses/:courseId/enroll", auth, enrollInCourse);

// Student/admin view own enrollments
router.get("/me/enrollments", auth, getMyEnrollments);

// Student drop (simple)
router.patch("/courses/:courseId/enrollment/drop", auth, dropCourse);

// Optional: admin view all
router.get("/enrollments", auth, requireRole("admin"), getAllEnrollments);

module.exports = router;

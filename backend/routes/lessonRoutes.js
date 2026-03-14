const express = require("express");
const router = express.Router();

const requireEnrollment = require("../middlewares/requireEnrollment");
const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} = require("../controllers/lessonController");

// Helper: only enforce enrollment for non-admin users
function enrollmentIfNotAdmin(opts) {
  const mw = requireEnrollment(opts);
  return (req, res, next) => {
    if (req.user?.role === "admin") return next();
    return mw(req, res, next);
  };
}

// Admin CRUD
router.post(
  "/courses/:courseId/lessons",
  auth,
  requireRole("admin"),
  createLesson,
);

router.patch("/lessons/:lessonId", auth, requireRole("admin"), updateLesson);

router.delete("/lessons/:lessonId", auth, requireRole("admin"), deleteLesson);

// Student/admin views
router.get(
  "/courses/:courseId/lessons",
  auth,
  enrollmentIfNotAdmin({ courseIdParam: "courseId" }),
  getLessonsByCourse,
);

router.get(
  "/lessons/:lessonId",
  auth,
  enrollmentIfNotAdmin({ lessonIdParam: "lessonId" }),
  getLessonById,
);

module.exports = router;

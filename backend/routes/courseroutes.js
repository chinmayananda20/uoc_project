const express = require("express");
const router = express.Router();

const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  setCoursePublished,
  deleteCourse,
  getAllCoursesAdmin
} = require("../controllers/courseController");

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

// ADMIN routes
router.post("/", auth, requireRole("admin"), createCourse);
router.patch("/:id", auth, requireRole("admin"), updateCourse);
router.patch("/:id/publish", auth, requireRole("admin"), setCoursePublished);
router.delete("/:id", auth, requireRole("admin"), deleteCourse);
router.get(
  "/admin",
  auth,
  requireRole("admin"),
  getAllCoursesAdmin
);
// PUBLIC routes
router.get("/", getCourses);
router.get("/:id", auth, getCourseById); 
// auth is required here so admin can view drafts; students will only see published

module.exports = router;

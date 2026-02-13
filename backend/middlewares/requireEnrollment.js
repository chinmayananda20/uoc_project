const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const Quiz = require("../models/Quiz");

module.exports = ({ courseIdParam, lessonIdParam, quizIdParam }) => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === "admin") return next();

      let courseId = null;

      // 1) Direct courseId from params
      if (courseIdParam) {
        courseId = req.params[courseIdParam];
      }

      // 2) Resolve from lessonId
      if (!courseId && lessonIdParam) {
        const lessonId = req.params[lessonIdParam];
        if (!mongoose.Types.ObjectId.isValid(lessonId)) {
          return res.status(400).json({ message: "Invalid lessonId" });
        }
        const lesson = await Lesson.findById(lessonId).select("courseId");
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });
        courseId = lesson.courseId;
      }

      // 3) Resolve from quizId
      if (!courseId && quizIdParam) {
        const quizId = req.params[quizIdParam];
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
          return res.status(400).json({ message: "Invalid quizId" });
        }
        const quiz = await Quiz.findById(quizId).select("lessonId");
        if (!quiz) return res.status(404).json({ message: "Quiz not found" });

        const lesson = await Lesson.findById(quiz.lessonId).select("courseId");
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });

        courseId = lesson.courseId;
      }

      if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ message: "Invalid courseId" });
      }

      // Course must exist & be published
      const course = await Course.findById(courseId).select("published");
      if (!course || !course.published) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Must be enrolled
      const userId = req.user.id || req.user._id;
      const enrollment = await Enrollment.findOne({
        userId,
        courseId,
        status: "enrolled",
      });

      if (!enrollment) {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }

      req.enrollment = enrollment;
      return next();
    } catch (err) {
      return res.status(500).json({ message: "Enrollment check failed" });
    }
  };
};

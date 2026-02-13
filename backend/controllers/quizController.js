const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// POST /api/lessons/:lessonId/quiz  (admin)
exports.createQuizForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, passPercent, timeLimitSec } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lessonId" });
    }

    if (!title) {
      return res.status(400).json({ message: "title is required" });
    }

    const lesson = await Lesson.findById(lessonId).select("courseId");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const existing = await Quiz.findOne({ lessonId: lesson._id });
    if (existing) {
      return res.status(409).json({ message: "Quiz already exists for this lesson" });
    }

    const quiz = await Quiz.create({
      lessonId: lesson._id,
      title: String(title).trim(),
      passPercent: passPercent ?? 70,
      timeLimitSec: timeLimitSec ?? 0,
      version: 1,
      updatedReason: "",
    });

    return res.status(201).json(quiz);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET /api/lessons/:lessonId/quiz  (auth required)
// Admin can view quiz anytime (draft or not).
// Students can view quiz only if parent course is published.
exports.getQuizByLessonId = async (req, res) => {
  try {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lessonId" });
    }

    const lesson = await Lesson.findById(lessonId).select("courseId");
    if (!lesson) return res.status(404).json({ message: "Quiz not found" });

    const quiz = await Quiz.findOne({ lessonId: lesson._id });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Admin bypass
    if (req.user?.role === "admin") return res.json(quiz);

    // Students: only if course is published (your choice B)
    const course = await Course.findById(lesson.courseId).select("published");
    if (!course || !course.published) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    return res.json(quiz);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// PATCH /api/quizzes/:quizId  (admin)
// Updates quiz config + bumps version
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, passPercent, timeLimitSec, updatedReason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quizId" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Update allowed fields only
    if (title !== undefined) quiz.title = String(title).trim();
    if (passPercent !== undefined) quiz.passPercent = Number(passPercent);
    if (timeLimitSec !== undefined) quiz.timeLimitSec = Number(timeLimitSec);

    // Versioning (important)
    quiz.version += 1;
    quiz.updatedReason = updatedReason || "Admin update";

    await quiz.save();

    return res.json(quiz);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

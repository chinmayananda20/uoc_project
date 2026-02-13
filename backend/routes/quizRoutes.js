const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const {
  createQuizForLesson,
  getQuizByLessonId,
  updateQuiz,
} = require("../controllers/quizController");

// Admin creates quiz for a lesson
router.post("/lessons/:lessonId/quiz", auth, requireRole("admin"), createQuizForLesson);

// Logged-in users can fetch quiz; controller hides it from students if course not published
router.get("/lessons/:lessonId/quiz", auth, getQuizByLessonId);

router.patch("/quizzes/:quizId", auth, requireRole("admin"), updateQuiz);


module.exports = router;

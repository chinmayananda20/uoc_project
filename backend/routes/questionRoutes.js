const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireRole = require("../middlewares/requireRole");

const {
  createQuestion,
  getQuestionsByQuiz,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

// Admin create
router.post("/quizzes/:quizId/questions", auth, requireRole("admin"), createQuestion);

// Auth read (admin or student; controller gates by course published for students)
router.get("/quizzes/:quizId/questions", auth, getQuestionsByQuiz);

// Admin update/delete
router.patch("/questions/:questionId", auth, requireRole("admin"), updateQuestion);
router.delete("/questions/:questionId", auth, requireRole("admin"), deleteQuestion);

module.exports = router;

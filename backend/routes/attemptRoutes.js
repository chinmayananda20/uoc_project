const express = require("express");
const router = express.Router();
const requireEnrollment = require("../middlewares/requireEnrollment");

const auth = require("../middlewares/auth");

const {
  startQuizAttempt,
  answerQuestion,
  submitQuizAttempt,
} = require("../controllers/attemptController");

// start attempt
router.post("/quizzes/:quizId/attempts/start", auth,requireEnrollment({ lessonIdParam: "lessonId" }), startQuizAttempt);

// answer a question (creates a QuestionAttempt; supports attemptNo)
router.post(
  "/quiz-attempts/:attemptId/questions/:questionId/answer",
  auth,
  answerQuestion
);

// submit attempt (server computes score + weakTopics + mastery)
router.post("/quiz-attempts/:attemptId/submit", auth, submitQuizAttempt);

module.exports = router;

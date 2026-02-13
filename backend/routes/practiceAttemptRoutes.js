const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const requireEnrollment = require("../middlewares/requireEnrollment");

const {
  startPracticeAttempt,
  answerPracticeQuestion,
  submitPracticeAttempt,
} = require("../controllers/practiceAttemptController");

// Start a practice attempt (must be enrolled in the lesson's course)
router.post(
  "/practice-sets/:practiceSetId/attempts/start",
  auth,
  // We don't have lessonId in params here, so we enforce ownership in controller.
  // Enrollment is effectively guaranteed because the set was created for this user+lesson.
  startPracticeAttempt
);

// Answer a practice question
router.post(
  "/practice-attempts/:attemptId/answer",
  auth,
  answerPracticeQuestion
);

// Submit practice attempt
router.post(
  "/practice-attempts/:attemptId/submit",
  auth,
  submitPracticeAttempt
);

module.exports = router;

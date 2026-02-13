const mongoose = require("mongoose");

const QuizAttempt = require("../models/QuizAttempt");
const QuestionAttempt = require("../models/QuestionAttempt");

const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const LessonProgress = require("../models/LessonProgress");
const Enrollment = require("../models/Enrollment");

const getUserId = (req) => req.user?.id || req.user?._id;

function normalizeAnswer(val) {
  // supports string or array; sorts arrays for comparison
  if (Array.isArray(val)) return val.map(String).sort();
  if (val === null || val === undefined) return null;
  return String(val);
}

function isAnswerCorrect(correctAnswer, selectedAnswer) {
  const a = normalizeAnswer(correctAnswer);
  const b = normalizeAnswer(selectedAnswer);

  if (a === null || b === null) return false;

  // array compare
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  return a === b;
}

// POST /api/quizzes/:quizId/attempts/start  (student/admin)
exports.startQuizAttempt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quizId" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const lesson = await Lesson.findById(quiz.lessonId).select("courseId");
    if (!lesson) return res.status(404).json({ message: "Quiz not found" });

    const course = await Course.findById(lesson.courseId).select("published");
    if (!course) return res.status(404).json({ message: "Quiz not found" });

    // students can only attempt if course is published
    if (req.user.role !== "admin" && !course.published) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // OPTIONAL (recommended): require enrollment for students
    if (req.user.role !== "admin") {
      const enr = await Enrollment.findOne({ userId, courseId: lesson.courseId });
      if (!enr || enr.status !== "enrolled") {
        return res.status(403).json({ message: "Not enrolled in this course" });
      }
    }

    const totalQuestions = await Question.countDocuments({ quizId: quiz._id });
    if (totalQuestions <= 0) {
      return res.status(400).json({ message: "Quiz has no questions" });
    }

    const attempt = await QuizAttempt.create({
      userId,
      courseId: lesson.courseId,
      lessonId: quiz.lessonId,
      quizId: quiz._id,
      quizVersion: quiz.version,
      totalQuestions,
      startedAt: new Date(),
    });

    return res.status(201).json({
      attemptId: attempt._id,
      quizId: attempt.quizId,
      quizVersion: attempt.quizVersion,
      totalQuestions: attempt.totalQuestions,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST /api/quiz-attempts/:attemptId/questions/:questionId/answer
// Body: { selectedAnswer, timeSpentMs, attemptNo?, hintUsed? }
exports.answerQuestion = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { attemptId, questionId } = req.params;
    const { selectedAnswer, timeSpentMs, attemptNo, hintUsed } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(attemptId) || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid attemptId/questionId" });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    // only owner (or admin) can answer
    if (req.user.role !== "admin" && attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    const question = await Question.findById(questionId).select(
      "quizId correctAnswer topicTag difficulty type"
    );
    if (!question) return res.status(404).json({ message: "Question not found" });

    // ensure question belongs to this quiz attempt
    if (question.quizId.toString() !== attempt.quizId.toString()) {
      return res.status(400).json({ message: "Question does not belong to this quiz" });
    }

    const computedIsCorrect = isAnswerCorrect(question.correctAnswer, selectedAnswer);

    const doc = await QuestionAttempt.create({
      quizAttemptId: attempt._id,
      questionId: question._id,
      topicTag: question.topicTag,
      difficulty: question.difficulty,
      selectedAnswer: selectedAnswer ?? null,
      isCorrect: computedIsCorrect,
      timeSpentMs: Number(timeSpentMs || 0),
      attemptNo: Number(attemptNo || 1),
      hintUsed: Boolean(hintUsed || false),
    });

    return res.status(201).json({
      questionAttemptId: doc._id,
      isCorrect: doc.isCorrect,
    });
  } catch (error) {
    // handles unique constraint (attemptNo duplicate) too
    return res.status(400).json({ message: error.message });
  }
};

// POST /api/quiz-attempts/:attemptId/submit
// Server computes final score using LATEST attemptNo per question
exports.submitQuizAttempt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attemptId" });
    }

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    if (req.user.role !== "admin" && attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: "Attempt already submitted" });
    }

    // pull attempts and compute latest per questionId (by highest attemptNo, then latest createdAt)
    const qAttempts = await QuestionAttempt.find({ quizAttemptId: attempt._id })
      .sort({ questionId: 1, attemptNo: -1, createdAt: -1 });

    const latestByQuestion = new Map(); // key: questionId string -> doc
    for (const qa of qAttempts) {
      const key = qa.questionId.toString();
      if (!latestByQuestion.has(key)) latestByQuestion.set(key, qa);
    }

    const answeredCount = latestByQuestion.size;
    // If they submit without answering everything, you decide policy.
    // MVP: allow submit; unanswered count as incorrect.
    const totalQuestions = attempt.totalQuestions;

    let correctCount = 0;
    const topicStats = new Map(); // topic -> {wrong, total}

    for (const qa of latestByQuestion.values()) {
      if (qa.isCorrect) correctCount += 1;

      const topic = qa.topicTag || "unknown";
      const prev = topicStats.get(topic) || { wrong: 0, total: 0 };
      prev.total += 1;
      if (!qa.isCorrect) prev.wrong += 1;
      topicStats.set(topic, prev);
    }

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    // weak topics = topics with >= 50% wrong in answered questions
    const weakTopics = [];
    for (const [topic, st] of topicStats.entries()) {
      if (st.total > 0 && st.wrong / st.total >= 0.5) weakTopics.push(topic);
    }

    // mastery rule-based (fast + defensible)
    let masteryLevel = "low";
    if (scorePercent >= 80) masteryLevel = "high";
    else if (scorePercent >= 50) masteryLevel = "medium";

    // total time from question attempts (best available)
    const totalTimeSec = Math.round(
      qAttempts.reduce((sum, x) => sum + (x.timeSpentMs || 0), 0) / 1000
    );

    attempt.correctCount = correctCount;
    attempt.scorePercent = scorePercent;
    attempt.weakTopics = weakTopics;
    attempt.masteryLevel = masteryLevel;
    attempt.totalTimeSec = totalTimeSec;
    attempt.submittedAt = new Date();

    await attempt.save();

    // Update lesson progress + enrollment unlock for students
    // Rule: if passed => mark lesson completed (if not already)
    const quiz = await Quiz.findById(attempt.quizId).select("passPercent");
    const passed = scorePercent >= (quiz?.passPercent ?? 70);

    if (req.user.role !== "admin") {
      // mark lesson completed if passed
      if (passed) {
        await LessonProgress.updateOne(
          { userId, lessonId: attempt.lessonId },
          {
            $set: {
              userId,
              courseId: attempt.courseId,
              lessonId: attempt.lessonId,
              status: "completed",
              completedAt: new Date(),
            },
          },
          { upsert: true }
        );
      }

      // update enrollment progressPercent (cached)
      const totalLessons = await Lesson.countDocuments({ courseId: attempt.courseId });
      const completedLessons = await LessonProgress.countDocuments({
        userId,
        courseId: attempt.courseId,
        status: "completed",
      });

      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      await Enrollment.updateOne(
        { userId, courseId: attempt.courseId },
        {
          $set: {
            progressPercent,
            lastLessonId: attempt.lessonId,
          },
        }
      );
    }

    // Practice generation trigger will be in /practice/generate later
    // Here we just return the signals.
    return res.json({
      attemptId: attempt._id,
      scorePercent,
      correctCount,
      totalQuestions,
      answeredCount,
      masteryLevel,
      weakTopics,
      passed,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

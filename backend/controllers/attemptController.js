const mongoose = require("mongoose");
const QuizAttempt = require("../models/Quizattempt");
const QuestionAttempt = require("../models/Questionattempt");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const LessonProgress = require("../models/Lessonprogress");
const Enrollment = require("../models/Enrollment");
// New imports for ML prediction
const mlPredictionService = require("../services/mlPredictionService");
const PerformanceAnalysis = require("../models/PerformanceAnalysis");





const getUserId = (req) => req.user?.id || req.user?._id;

function normalizeAnswer(val) {
  if (Array.isArray(val)) return val.map(String).map(s => s.trim().toLowerCase()).sort();
  if (val === null || val === undefined) return null;
  return String(val).trim().toLowerCase();
}

function isAnswerCorrect(correctAnswer, selectedAnswer) {
  const a = normalizeAnswer(correctAnswer);
  const b = normalizeAnswer(selectedAnswer);

  if (a === null || b === null) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  return a === b;
}

function decideAdaptiveProgression({ scorePercent, weakTopics }) {
  if (scorePercent < 50) {
    return {
      learningState: "very_weak",
      actionType: "revisit_lesson",
      unlockNextLesson: false,
      practiceRequired: false,
      summaryRecommended: true
    };
  } else if (scorePercent >= 80 && weakTopics.length === 0) {
    return {
      learningState: "strong",
      actionType: "optional_challenge",
      unlockNextLesson: true,
      practiceRequired: false,
      summaryRecommended: false
    };
  } else {
    // moderate performance
    return {
      learningState: "moderate",
      actionType: "summary_then_practice",
      unlockNextLesson: false,
      practiceRequired: true,
      summaryRecommended: true
    };
  }
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

    if (req.user.role !== "admin" && !course.published) {
      return res.status(404).json({ message: "Quiz not found" });
    }

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
      quizVersion: quiz.version || 1,
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

    if (question.quizId.toString() !== attempt.quizId.toString()) {
      return res.status(400).json({ message: "Question does not belong to this quiz" });
    }

    const computedIsCorrect = isAnswerCorrect(question.correctAnswer, selectedAnswer);

    const doc = await QuestionAttempt.findOneAndUpdate(
      {
        quizAttemptId: attempt._id,
        questionId: question._id,
        attemptNo: Number(attemptNo || 1),
      },
      {
        $set: {
          topicTag: question.topicTag,
          difficulty: question.difficulty,
          selectedAnswer: selectedAnswer ?? null,
          isCorrect: computedIsCorrect,
          timeSpentMs: Number(timeSpentMs || 0),
          hintUsed: Boolean(hintUsed || false),
        }
      },
      { new: true, upsert: true }
    );

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

    // fetch all questions for this quiz to account for unanswered ones
    const allQuestions = await Question.find({ quizId: attempt.quizId }).select('topicTag');

    let correctCount = 0;
    const topicStats = new Map(); // topic -> { wrong, total }

    for (const q of allQuestions) {
      const qId = q._id.toString();
      const qa = latestByQuestion.get(qId);
      const isCorrect = qa?.isCorrect ?? false; // unanswered counts as incorrect
      if (isCorrect) correctCount += 1;

      const topic = q.topicTag || 'unknown';
      const prev = topicStats.get(topic) || { wrong: 0, total: 0 };
      prev.total += 1;
      if (!isCorrect) prev.wrong += 1;
      topicStats.set(topic, prev);
    }

    const answeredCount = latestByQuestion.size;
    const totalQuestions = attempt.totalQuestions;

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

    // Adaptive progression logic
    const progression = decideAdaptiveProgression({ scorePercent, weakTopics });

    // ---- ML Prediction ----
    let mlResult = null;
    try {
      const easyWrong = qAttempts.filter(qa => qa.difficulty === 'easy' && !qa.isCorrect).length;
      const mediumWrong = qAttempts.filter(qa => qa.difficulty === 'medium' && !qa.isCorrect).length;
      const hardWrong = qAttempts.filter(qa => qa.difficulty === 'hard' && !qa.isCorrect).length;

      const mlFeatures = {
        scorePercent,
        correctCount,
        totalQuestions,
        weakTopicCount: weakTopics.length,
        totalTimeSec,
        practiceRequired: progression.practiceRequired,
        easyWrong,
        mediumWrong,
        hardWrong,
        practiceScorePercent: 0,
        practiceCompleted: false,
        attemptNumber: 1
      };
      mlResult = await mlPredictionService.predictPerformance(mlFeatures);
    } catch (e) {
      console.error("ML prediction failed:", e.message || e);
    }

    // Store analysis record
    try {
      await PerformanceAnalysis.create({
        userId,
        courseId: attempt.courseId,
        lessonId: attempt.lessonId,
        quizId: attempt.quizId,
        quizAttemptId: attempt._id,
        scorePercent,
        weakTopics,
        learningState: progression.learningState,
        ruleBasedAction: progression.actionType,
        mlPredictedMastery: mlResult?.predictedMastery,
        mlRiskLevel: mlResult?.riskLevel,
        mlRecommendedAction: mlResult?.recommendedAction,
        mlConfidence: mlResult?.confidence,
        source: mlResult ? "ml" : "rule_based_fallback"
      });
    } catch (e) {
      console.error("Failed to save PerformanceAnalysis:", e.message || e);
    }

    // Update lesson progress + enrollment unlock for students
    if (req.user.role !== "admin") {
      // mark lesson completed only if unlockNextLesson is true
      if (progression.unlockNextLesson) {
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
      passed: progression.unlockNextLesson, // Map passed to unlockNextLesson for backwards compatibility where needed
      learningState: progression.learningState,
      actionType: progression.actionType,
      unlockNextLesson: progression.unlockNextLesson,
      practiceRequired: progression.practiceRequired,
      summaryRecommended: progression.summaryRecommended,
      mlPrediction: mlResult ? { ...mlResult, source: "ml" } : null
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

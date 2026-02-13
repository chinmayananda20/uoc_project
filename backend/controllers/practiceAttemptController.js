const mongoose = require("mongoose");
const PracticeSet = require("../models/PracticeSet");
const PracticeAttempt = require("../models/PracticeAttempt");

const getUserId = (req) => req.user?.id || req.user?._id;

function normalizeAnswer(val) {
  if (Array.isArray(val)) return val.map(String).sort();
  if (val === null || val === undefined) return null;
  return String(val);
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

function masteryFromScore(scorePercent) {
  if (scorePercent >= 80) return "high";
  if (scorePercent >= 50) return "medium";
  return "low";
}

// POST /api/practice-sets/:practiceSetId/attempts/start
exports.startPracticeAttempt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { practiceSetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(practiceSetId)) {
      return res.status(400).json({ message: "Invalid practiceSetId" });
    }

    const set = await PracticeSet.findById(practiceSetId).select(
      "userId courseId lessonId status questions"
    );
    if (!set) return res.status(404).json({ message: "PracticeSet not found" });

    // Only owner (or admin) can start it
    if (req.user.role !== "admin" && set.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (set.status !== "active") {
      return res.status(400).json({ message: "PracticeSet is not active" });
    }

    const totalQuestions = Array.isArray(set.questions) ? set.questions.length : 0;
    if (totalQuestions <= 0) {
      return res.status(400).json({ message: "PracticeSet has no questions" });
    }

    const attempt = await PracticeAttempt.create({
      practiceSetId: set._id,
      userId,
      courseId: set.courseId,
      lessonId: set.lessonId,
      answers: [],
      totalQuestions,
      correctCount: 0,
      scorePercent: 0,
      masteryAfter: null,
      startedAt: new Date(),
      submittedAt: null,
      durationSeconds: null,
      feedbackSummary: "",
    });

    return res.status(201).json({
      attemptId: attempt._id,
      practiceSetId: set._id,
      totalQuestions: attempt.totalQuestions,
      startedAt: attempt.startedAt,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST /api/practice-attempts/:attemptId/answer
// Body: { questionKey, selectedAnswer, timeSpentMs }
exports.answerPracticeQuestion = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { attemptId } = req.params;
    const { questionKey, selectedAnswer, timeSpentMs } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attemptId" });
    }

    if (!questionKey) {
      return res.status(400).json({ message: "questionKey is required" });
    }

    const attempt = await PracticeAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "PracticeAttempt not found" });

    if (req.user.role !== "admin" && attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: "PracticeAttempt already submitted" });
    }

    const set = await PracticeSet.findById(attempt.practiceSetId).select("questions status");
    if (!set) return res.status(404).json({ message: "PracticeSet not found" });

    if (set.status !== "active") {
      return res.status(400).json({ message: "PracticeSet is not active" });
    }

    const q = (set.questions || []).find((x) => x.questionKey === questionKey);
    if (!q) return res.status(404).json({ message: "Question not found in PracticeSet" });

    const computedIsCorrect = isAnswerCorrect(q.correctAnswer, selectedAnswer);

    // Upsert answer by questionKey (avoid duplicates)
    const idx = attempt.answers.findIndex((a) => a.questionKey === questionKey);
    const answerObj = {
      questionKey,
      selectedAnswer: selectedAnswer ?? null,
      isCorrect: computedIsCorrect,
      timeSpentMs: Number(timeSpentMs || 0),
    };

    if (idx >= 0) attempt.answers[idx] = answerObj;
    else attempt.answers.push(answerObj);

    await attempt.save();

    return res.status(201).json({ isCorrect: computedIsCorrect });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST /api/practice-attempts/:attemptId/submit
exports.submitPracticeAttempt = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { attemptId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return res.status(400).json({ message: "Invalid attemptId" });
    }

    const attempt = await PracticeAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "PracticeAttempt not found" });

    if (req.user.role !== "admin" && attempt.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (attempt.submittedAt) {
      return res.status(400).json({ message: "PracticeAttempt already submitted" });
    }

    const set = await PracticeSet.findById(attempt.practiceSetId).select("questions");
    if (!set) return res.status(404).json({ message: "PracticeSet not found" });

    const questions = set.questions || [];
    const totalQuestions = attempt.totalQuestions || questions.length || 0;

    // Count correct based on stored answers (unanswered count as wrong)
    let correctCount = 0;
    const answerMap = new Map(attempt.answers.map((a) => [a.questionKey, a]));

    for (const q of questions) {
      const a = answerMap.get(q.questionKey);
      if (a && a.isCorrect) correctCount += 1;
    }

    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const masteryAfter = masteryFromScore(scorePercent);

    // Simple feedback summary (placeholder; later chatbot/LLM can generate)
    const wrongKeys = [];
    for (const q of questions) {
      const a = answerMap.get(q.questionKey);
      const correct = a ? a.isCorrect : false;
      if (!correct) wrongKeys.push(q.questionKey);
    }

    const feedbackSummary =
      wrongKeys.length === 0
        ? "Great job. You answered all practice questions correctly."
        : `You missed ${wrongKeys.length} practice question(s). Review the explanations and retry.`;


    // Duration (seconds) = sum of timeSpentMs if available
    const durationSeconds = Math.round(
      (attempt.answers || []).reduce((sum, a) => sum + (a.timeSpentMs || 0), 0) / 1000
    );

    attempt.correctCount = correctCount;
    attempt.scorePercent = scorePercent;
    attempt.masteryAfter = masteryAfter;
    attempt.submittedAt = new Date();
    attempt.durationSeconds = durationSeconds;
    attempt.feedbackSummary = feedbackSummary;

    await attempt.save();

    return res.json({
      attemptId: attempt._id,
      practiceSetId: attempt.practiceSetId,
      totalQuestions,
      correctCount,
      scorePercent,
      masteryAfter,
      feedbackSummary,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

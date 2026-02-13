const mongoose = require("mongoose");
const Question = require("../models/Question");
const Quiz = require("../models/Quiz");
const Lesson = require("../models/Lesson");
const Course = require("../models/Course");

// Helper: check student visibility based on course.published
async function ensureStudentCanSeeQuiz(quizId) {
  const quiz = await Quiz.findById(quizId).select("lessonId");
  if (!quiz) return { ok: false, status: 404, message: "Quiz not found" };

  const lesson = await Lesson.findById(quiz.lessonId).select("courseId");
  if (!lesson) return { ok: false, status: 404, message: "Quiz not found" };

  const course = await Course.findById(lesson.courseId).select("published");
  if (!course || !course.published) {
    return { ok: false, status: 404, message: "Quiz not found" };
  }

  return { ok: true };
}

// POST /api/quizzes/:quizId/questions  (admin)
exports.createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const {
      type,
      prompt,
      options,
      correctAnswer,
      explanation,
      topicTag,
      difficulty,
      order,
      published,
    } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quizId" });
    }

    // Quiz must exist
    const quiz = await Quiz.findById(quizId).select("_id");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    // Minimal validation
    if (!prompt || !topicTag || !difficulty || !order || correctAnswer === undefined) {
      return res.status(400).json({
        message: "prompt, topicTag, difficulty, order, correctAnswer are required",
      });
    }

    const question = await Question.create({
      quizId,
      type: type || "mcq",
      prompt: String(prompt).trim(),
      options: Array.isArray(options) ? options : [],
      correctAnswer,
      explanation: explanation ? String(explanation).trim() : "",
      topicTag: String(topicTag).trim(),
      difficulty: Number(difficulty),
      order: Number(order),
      published: published ?? true,
    });

    return res.status(201).json(question);
  } catch (error) {
    // handles unique index (quizId, order) collisions too
    return res.status(400).json({ message: error.message });
  }
};

// GET /api/quizzes/:quizId/questions  (auth required)
// Admin can see everything; students only if course published.
// (We won't hide unpublished questions yet — keep it simple. You can later.)
exports.getQuestionsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({ message: "Invalid quizId" });
    }

    if (req.user?.role !== "admin") {
      const vis = await ensureStudentCanSeeQuiz(quizId);
      if (!vis.ok) return res.status(vis.status).json({ message: vis.message });
    } else {
      // admin: still ensure quiz exists to avoid leaking cast errors
      const quizExists = await Quiz.exists({ _id: quizId });
      if (!quizExists) return res.status(404).json({ message: "Quiz not found" });
    }

    const questions = await Question.find({ quizId }).sort({ order: 1 });
    return res.json(questions);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// PATCH /api/questions/:questionId  (admin)
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid questionId" });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    const allowed = [
      "type",
      "prompt",
      "options",
      "correctAnswer",
      "explanation",
      "topicTag",
      "difficulty",
      "order",
      "published",
    ];

    for (const key of allowed) {
      if (key in req.body) question[key] = req.body[key];
    }

    // normalize a few fields
    if (question.prompt) question.prompt = String(question.prompt).trim();
    if (question.explanation) question.explanation = String(question.explanation).trim();
    if (question.topicTag) question.topicTag = String(question.topicTag).trim();
    if (!Array.isArray(question.options)) question.options = [];

    await question.save();
    return res.json(question);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// DELETE /api/questions/:questionId  (admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid questionId" });
    }

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ message: "Question not found" });

    await Question.deleteOne({ _id: question._id });
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

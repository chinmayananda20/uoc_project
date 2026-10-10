const PracticeSet = require("../models/PracticeSet");
const PracticeAttempt = require("../models/PracticeAttempt");
const QuizAttempt = require("../models/QuizAttempt");
const Question = require("../models/Question");
const generator = require("../services/practiceGenerator");
const geminiService = require("../services/geminiPracticeService");
const Lesson = require("../models/Lesson");
const engine = require("../services/nlpTutorEngine");

/**
 * Helper to normalize answers for comparison.
 */
function normalizeAnswer(ans) {
  if (ans === null || ans === undefined) return "";
  if (typeof ans === "boolean") return ans.toString().toLowerCase();
  if (typeof ans === "string") return ans.trim().toLowerCase();
  if (Array.isArray(ans)) return ans.map(a => normalizeAnswer(a)).sort().join(",");
  return ans.toString().toLowerCase();
}

/**
 * Checks if two answers match (case-insensitive, handles arrays).
 */
function isAnswerCorrect(correct, selected) {
  return normalizeAnswer(correct) === normalizeAnswer(selected);
}

/**
 * Generates a practice set based on a quiz attempt.
 */
exports.generatePracticeSet = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) return res.status(404).json({ message: "Quiz attempt not found" });

    // Security check: owner or admin
    if (req.user.role !== "admin" && attempt.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this attempt" });
    }

    if (!attempt.submittedAt) {
      return res.status(400).json({ message: "Quiz must be submitted before generating practice" });
    }

    if (attempt.scorePercent < 50) {
      return res.status(403).json({ message: "Please revisit the lesson before attempting practice." });
    }

    const regenerate = req.query.regenerate === "true";

    // 4. Prevent duplicate practice sets (check for pending)
    const existingSet = await PracticeSet.findOne({ 
      quizAttemptId: attemptId, 
      userId: attempt.userId,
      status: "pending" 
    });

    if (existingSet) {
      if (regenerate) {
        await PracticeSet.findByIdAndDelete(existingSet._id);
      } else {
        return res.json(existingSet);
      }
    }

    const { masteryLevel, weakTopics, quizId, courseId, lessonId } = attempt;

    // Fetch pool of questions
    const sourceQuestions = await Question.find({ quizId });

    const practiceType = generator.decidePracticeType(masteryLevel);
    
    let questions = [];
    let generationMethod = "rule_based_fallback";
    let rejectedSimilarCount = 0;
    let generationNotes = "Generated via rule-based fallback.";

    // Fetch lesson context for Gemini
    try {
      const lesson = await Lesson.findById(lessonId);
      const chunks = engine.extractTextFromSlides(lesson?.slides || []);
      const lessonContext = chunks.join("\n");

      const geminiResult = await geminiService.generatePracticeQuestionsWithGemini({
        weakTopics,
        masteryLevel,
        practiceType,
        lessonTitle: lesson?.title || "Course Lesson",
        lessonContext,
        sourceQuestions
      });

      questions = geminiResult.questions;
      rejectedSimilarCount = geminiResult.rejectedSimilarCount || 0;
      generationNotes = geminiResult.generationNotes || "Generated successfully.";
      
      // Gemini generated questions don't have a direct sourceQuestionId in the new generation
      generationMethod = "gemini";
    } catch (error) {
      console.error("Gemini Practice Generation Failed, falling back to rule-based:", error.message || error);
      questions = generator.generatePracticeQuestions({ 
        weakTopics, 
        masteryLevel, 
        sourceQuestions 
      });
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({ message: "No suitable questions found for practice" });
    }

    const practiceSet = new PracticeSet({
      userId: attempt.userId, // 3. Use attempt.userId as owner
      courseId,
      lessonId,
      quizId,
      quizAttemptId: attemptId,
      masteryLevel,
      weakTopics,
      practiceType,
      questions,
      generationMethod,
      rejectedSimilarCount,
      generationNotes
    });

    await practiceSet.save();
    return res.status(201).json(practiceSet);

  } catch (error) {
    console.error("Generate Practice Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Retrieves a practice set by ID.
 */
exports.getPracticeSet = async (req, res) => {
  try {
    const { practiceSetId } = req.params;
    const userId = req.user.id;

    const set = await PracticeSet.findById(practiceSetId);
    if (!set) return res.status(404).json({ message: "Practice set not found" });

    if (req.user.role !== "admin" && set.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.json(set);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Submits answers for a practice set.
 */
exports.submitPracticeSet = async (req, res) => {
  try {
    const { practiceSetId } = req.params;
    const userId = req.user.id;

    const set = await PracticeSet.findById(practiceSetId);
    if (!set) return res.status(404).json({ message: "Practice set not found" });

    if (req.user.role !== "admin" && set.userId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (set.status === "completed") {
      return res.status(400).json({ message: "Practice set already completed" });
    }

    const userAnswersInput = Array.isArray(req.body.answers) ? req.body.answers : [];

    let correctCount = 0;
    const processedAnswers = set.questions.map((q, index) => {
      const userAnswer = userAnswersInput.find(ua => ua.questionIndex === index);
      const selected = userAnswer ? userAnswer.selectedAnswer : null;
      
      // 2. Use improved grading logic
      const isCorrect = isAnswerCorrect(q.correctAnswer, selected);
      
      if (isCorrect) correctCount++;

      return {
        questionIndex: index,
        selectedAnswer: selected,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const scorePercent = Math.round((correctCount / set.questions.length) * 100);
    
    const feedbackSummary = scorePercent >= 80 
      ? "Great improvement! You have mastered these concepts." 
      : "Good effort. Review the explanations to strengthen your understanding.";

    const attempt = new PracticeAttempt({
      practiceSetId,
      userId,
      answers: processedAnswers,
      scorePercent,
      correctCount,
      totalQuestions: set.questions.length,
      feedbackSummary
    });

    await attempt.save();

    set.status = "completed";
    await set.save();

    let unlockNextLesson = false;
    if (scorePercent >= 70 && req.user.role !== "admin") {
      unlockNextLesson = true;
      const LessonProgress = require("../models/Lessonprogress");
      const Enrollment = require("../models/Enrollment");

      await LessonProgress.updateOne(
        { userId, lessonId: set.lessonId },
        {
          $set: {
            userId,
            courseId: set.courseId,
            lessonId: set.lessonId,
            status: "completed",
            completedAt: new Date(),
          },
        },
        { upsert: true }
      );

      const totalLessons = await Lesson.countDocuments({ courseId: set.courseId });
      const completedLessons = await LessonProgress.countDocuments({
        userId,
        courseId: set.courseId,
        status: "completed",
      });

      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      await Enrollment.updateOne(
        { userId, courseId: set.courseId },
        {
          $set: {
            progressPercent,
            lastLessonId: set.lessonId,
          },
        }
      );
    }

    return res.json({
      scorePercent,
      correctCount,
      totalQuestions: set.questions.length,
      feedbackSummary,
      detailedFeedback: processedAnswers,
      unlockNextLesson
    });

  } catch (error) {
    console.error("Submit Practice Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const QuizAttempt = require("../models/QuizAttempt");
const Question = require("../models/Question");
const Enrollment = require("../models/Enrollment");
const engine = require("../services/nlpTutorEngine");
const aiService = require("../services/aiProviderService");

exports.askTutor = async (req, res) => {
  try {
    const { mode, message, courseId, lessonId, currentSlideIndex, quizAttemptId, context } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // 1. Off-topic check
    if (mode !== "lesson_summary" && engine.isBlockedMessage(message)) {
      return res.json({ 
        reply: "I can only help with this lesson or course content. Please ask something related to your studies." 
      });
    }

    if (mode === "lesson_summary") {
      const { weakTopics } = req.body;
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });

      const course = await Course.findById(lesson.courseId);

      // Debug logs
      console.log('[Lesson Summary] lessonId:', lessonId);
      console.log('[Lesson Summary] title:', lesson.title);
      console.log('[Lesson Summary] slide count:', (lesson.slides || []).length);

      // Extract lesson text
      const extractedTexts = [];
      (lesson.slides || []).forEach(slide => {
        const elements = slide.elements || [];
        elements.forEach(el => {
          const data = el.data || {};
          if (data.text) extractedTexts.push(data.text);
          if (Array.isArray(data.items)) extractedTexts.push(data.items.join(' '));
        });
      });
      const lessonContext = extractedTexts.join('\n');
      console.log('[Lesson Summary] extracted text length:', lessonContext.length);
      console.log('[Lesson Summary] first 300 chars:', lessonContext.substring(0, 300));

      if (!lessonContext.trim()) {
        return res.status(400).json({ message: "No lesson text found to summarise. Please check lesson slide content." });
      }

      try {
        const aiResult = await aiService.generateTutorResponse({
          mode,
          message: "Generate lesson summary",
          lessonTitle: lesson.title,
          lessonContext,
          courseTitle: course ? course.title : "this course",
          courseTags: course ? course.tags : [],
          weakTopics: weakTopics || []
        });
        // Expect JSON response
        let parsed;
        try { parsed = JSON.parse(aiResult.reply); } catch (e) { parsed = null; }
        if (parsed && (parsed.summary || parsed.keyPoints)) {
          return res.json(parsed);
        }
        // Fallback to rule-based if not JSON
        throw new Error('Invalid JSON from Gemini');
      } catch (aiError) {
        console.error('[Lesson Summary] Gemini failed, fallback:', aiError.message || aiError);
        // Simple rule‑based fallback
        const summary = lessonContext.substring(0, 500);
        const keyPoints = extractedTexts.slice(0, 5);
        const focusAreas = (weakTopics && weakTopics.length) ? weakTopics : [lesson.title];
        return res.json({ summary, keyPoints, focusAreas });
      }
    }

    if (mode === "lesson_help") {
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) return res.status(404).json({ message: "Lesson not found" });

      const realCourseId = lesson.courseId;

      // Security: check enrollment or admin using real courseId
      if (req.user.role !== "admin") {
        const enr = await Enrollment.findOne({ userId, courseId: realCourseId, status: "enrolled" });
        if (!enr) return res.status(403).json({ message: "Not enrolled in this course" });
      }

      // 2. Quiz-lock check for lesson_help ONLY IF context is 'quiz'
      if (context === "quiz") {
        const activeAttempt = await QuizAttempt.findOne({ 
          userId, 
          lessonId, 
          submittedAt: null 
        });

        if (activeAttempt) {
          return res.status(403).json({ 
            message: "AI Tutor is locked during quiz attempts to keep assessment fair." 
          });
        }
      }

      const course = await Course.findById(realCourseId);
      const chunks = engine.extractTextFromSlides(lesson.slides);
      const lessonContext = chunks.join("\n");

      try {
        // Attempt LLM generation
        const aiResult = await aiService.generateTutorResponse({
          mode,
          message,
          lessonTitle: lesson.title,
          lessonContext,
          courseTitle: course ? course.title : "this course",
          courseTags: course ? course.tags : []
        });
        return res.json(aiResult);
      } catch (aiError) {
        console.error("AI Provider Fallback Triggered:", aiError.message || aiError);
        // Fallback to rule-based engine
        const intent = engine.detectIntent(message);
        const relevantChunks = engine.retrieveRelevantChunks(message, chunks);
        
        const contextKeywords = [
          course ? course.title : "",
          ...(course && course.tags ? course.tags : []),
          lesson.title
        ];
        const isRelated = engine.isCourseRelated(message, contextKeywords);
        const reply = engine.buildLessonReply(intent, relevantChunks, isRelated);
        
        return res.json({ 
          reply: `(Rule-based) ${reply}`, 
          intent,
          fallback: true 
        });
      }
    } 

    if (mode === "post_quiz_help") {
      const attempt = await QuizAttempt.findById(quizAttemptId);
      if (!attempt) return res.status(404).json({ message: "Quiz attempt not found" });

      // Security: user check
      if (req.user.role !== "admin" && attempt.userId.toString() !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Security Rule: Locked during active quiz
      if (!attempt.submittedAt) {
        return res.json({ 
          reply: "AI Tutor is locked during quiz attempts to keep assessment fair. Finish your quiz first!" 
        });
      }

      const lesson = await Lesson.findById(attempt.lessonId);
      const course = await Course.findById(attempt.courseId);

      // Fetch relevant questions for explanations
      const questions = await Question.find({ 
        quizId: attempt.quizId,
        topicTag: { $in: attempt.weakTopics }
      }).select("topicTag explanation");

      const questionExplanations = questions.map(q => `[${q.topicTag}]: ${q.explanation}`).join("\n");

      try {
        const aiResult = await aiService.generateTutorResponse({
          mode,
          message,
          lessonTitle: lesson ? lesson.title : "the lesson",
          lessonContext: "Post-quiz analysis mode",
          courseTitle: course ? course.title : "the course",
          courseTags: course ? course.tags : [],
          weakTopics: attempt.weakTopics,
          quizStats: {
            scorePercent: attempt.scorePercent,
            correctCount: attempt.correctCount,
            totalQuestions: attempt.totalQuestions
          },
          questionExplanations
        });
        return res.json(aiResult);
      } catch (aiError) {
        console.error("AI Provider Fallback Triggered (Post-Quiz):", aiError.message || aiError);
        const reply = engine.buildPostQuizReply(attempt, questions);
        return res.json({ 
          reply: `(Rule-based) ${reply}`,
          fallback: true
        });
      }
    }

    return res.status(400).json({ message: "Invalid mode" });

  } catch (error) {
    console.error("AI Tutor Controller Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

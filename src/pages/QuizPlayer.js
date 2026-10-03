import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuizByLessonId, getQuestionsByQuiz } from "../api/adminQuizzes.api";
import { listLessonsByCourse } from "../api/adminLessons.api";
import { startQuizAttempt, answerQuestion, submitQuizAttempt } from "../api/attempts.api";
import { generatePracticeSet } from "../api/practice.api";
import { HiArrowLeft, HiCheckCircle, HiXCircle } from "react-icons/hi2";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import AITutorChat from "../components/AITutorChat";
import { askTutor } from "../api/aiTutor.api";

export default function QuizPlayer() {
  const { courseId, lessonId } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [nextLessonId, setNextLessonId] = useState(null);
  
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({}); // questionId -> answer
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [quizData, lessonsData] = await Promise.all([
          getQuizByLessonId(lessonId),
          listLessonsByCourse(courseId)
        ]);
        setQuiz(quizData);
        
        if (lessonsData && lessonsData.length > 0) {
          const currentIndex = lessonsData.findIndex(l => l._id === lessonId);
          if (currentIndex !== -1 && currentIndex < lessonsData.length - 1) {
            setNextLessonId(lessonsData[currentIndex + 1]._id);
          }
        }
      } catch (error) {
        console.error("Error loading quiz or lessons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, lessonId, token, nav]);

  const handleStartAttempt = async () => {
    try {
      setLoading(true);
      const attemptData = await startQuizAttempt(quiz._id);
      const qs = await getQuestionsByQuiz(quiz._id);
      setAttempt(attemptData);
      setQuestions(qs);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to start quiz";
      alert("Backend error: " + msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = async (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    try {
      await answerQuestion(attempt.attemptId, questionId, { selectedAnswer: option });
    } catch (error) {
      console.error("Failed to record answer", error);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) return;
    }
    try {
      setSubmitting(true);
      const res = await submitQuizAttempt(attempt.attemptId);
      setResults(res);
      toast.success("Quiz submitted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartPractice = async () => {
    try {
      setLoading(true);
      const practiceSet = await generatePracticeSet(attempt.attemptId);
      nav(`/course/${courseId}/practice/${practiceSet._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to generate practice set");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSummary = async () => {
    if (summary) return; // already loaded
    try {
      setLoadingSummary(true);
      const res = await askTutor({
        mode: "lesson_summary",
        message: "Generate a summary",
        courseId,
        lessonId,
        weakTopics: results?.weakTopics || []
      });
      setSummary(res);
    } catch (error) {
      toast.error("Failed to fetch summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Quiz Available</h1>
        <p className="text-slate-500 dark:text-slate-400">There is no quiz configured for this lesson yet.</p>
        <button 
          onClick={() => nav(`/course/${courseId}`)}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <button 
          onClick={() => nav(`/course/${courseId}`)}
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Course
        </button>

        {!attempt && !results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-10 sm:p-16 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-8"
          >
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-3xl mx-auto flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HiCheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                {quiz.title}
              </h1>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                Passing Score: {quiz.passPercent || 70}%
              </p>
            </div>
            <button 
              onClick={handleStartAttempt}
              className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
            >
              Start Quiz
            </button>
          </motion.div>
        )}

        {attempt && !results && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-xl font-black uppercase tracking-tight">{quiz.title}</h2>
              <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-lg border border-blue-200 dark:border-blue-800/50">
                {questions.length} Questions
              </span>
            </div>

            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={q._id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold">
                    <span className="text-blue-500 mr-2">{i + 1}.</span> 
                    {q.prompt}
                  </h3>
                  <div className="space-y-3">
                    {(q.type === "truefalse" && (!q.options || q.options.length === 0) 
                      ? [{ key: "True", text: "True" }, { key: "False", text: "False" }] 
                      : q.options || []
                    ).map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectAnswer(q._id, opt.key)}
                        className={`w-full text-left px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                          answers[q._id] === opt.key
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 text-blue-650 dark:text-blue-400 ring-2 ring-blue-500/20 shadow-md"
                            : "border-slate-200 dark:border-slate-800 hover:border-blue-500/30 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50"
                        }`}
                      >
                        <span className="font-bold mr-3">{opt.key}.</span> {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-all shadow-xl disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Answers"}
              </button>
            </div>
          </motion.div>
        )}

        {results && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8 relative overflow-hidden text-left"
          >
            {results.passed && (
              <div className="absolute -inset-20 bg-gradient-to-t from-green-500/10 to-transparent blur-3xl -z-10 pointer-events-none" />
            )}
            
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${results.passed ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"}`}>
                {results.passed ? <HiCheckCircle className="w-10 h-10" /> : <HiXCircle className="w-10 h-10" />}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${results.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {results.passed ? "Passed Masterfully" : "Needs Review"}
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">
                  Quiz Report Card
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Score</span>
                <p className={`text-3xl font-black mt-1 ${results.passed ? "text-green-500" : "text-red-500"}`}>{results.scorePercent}%</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Accuracy</span>
                <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{results.correctCount} / {results.totalQuestions}</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mastery Level</span>
                <p className="text-3xl font-black text-blue-500 dark:text-blue-400 mt-1 capitalize">{results.masteryLevel}</p>
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-800/40 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Recommended Path</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {results.masteryLevel === 'low' ? 'Remedial practice needed to strengthen foundations.' : results.masteryLevel === 'medium' ? 'Reinforcement practice recommended to build fluency.' : 'Ready to unlock more advanced modules!'}
              </p>
              {results.weakTopics && results.weakTopics.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-red-500 dark:text-red-400">Weak Topics Identified: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {results.weakTopics.map(topic => (
                      <span key={topic} className="text-[10px] font-bold px-2 py-0.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md border border-red-100 dark:border-red-900/30">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {summary && (
              <div className="p-6 bg-slate-50 dark:bg-slate-850 border border-slate-200/50 dark:border-slate-800 rounded-2xl shadow-inner space-y-4">
                <h3 className="text-lg font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  AI Lesson Summary
                </h3>
                {typeof summary === 'string' ? (
                  <div className="text-sm text-slate-650 dark:text-slate-350 whitespace-pre-wrap leading-relaxed">
                    {summary}
                  </div>
                ) : (
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-semibold leading-relaxed">{summary.summary}</p>
                    {Array.isArray(summary.keyPoints) && summary.keyPoints.length > 0 && (
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Key Points:</span>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {summary.keyPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(summary.focusAreas) && summary.focusAreas.length > 0 && (
                      <div>
                        <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Recommended Focus Areas:</span>
                        <ul className="list-disc list-inside space-y-1 mt-1">
                          {summary.focusAreas.map((fa, i) => (
                            <li key={i}>{fa}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {results.learningState === "very_weak" && (
                <>
                  <button onClick={handleViewSummary} disabled={loadingSummary} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    {loadingSummary ? "Generating Summary..." : "View Lesson Summary"}
                  </button>
                  <button onClick={() => nav(`/course/${courseId}/lesson/${lessonId}`)} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Revisit Lesson
                  </button>
                  <button onClick={() => window.location.reload()} className="flex-1 px-6 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-md">
                    Retake Quiz
                  </button>
                </>
              )}

              {results.learningState === "moderate" && (
                <>
                  <button onClick={handleViewSummary} disabled={loadingSummary} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    {loadingSummary ? "Generating Summary..." : "View Lesson Summary"}
                  </button>
                  <button onClick={handleStartPractice} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Start Practice
                  </button>
                </>
              )}

              {results.learningState === "strong" && (
                <>
                  {nextLessonId && (
                    <button onClick={() => nav(`/course/${courseId}/lesson/${nextLessonId}`)} className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                      Next Module
                    </button>
                  )}
                  <button onClick={handleStartPractice} className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                    Challenge Practice
                  </button>
                </>
              )}
              
              <button 
                onClick={() => nav(`/course/${courseId}`)}
                className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Back to Course
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <AITutorChat 
        mode={results ? "post_quiz_help" : "lesson_help"}
        courseId={courseId}
        lessonId={lessonId}
        quizAttemptId={attempt?.attemptId}
        disabled={attempt && !results}
        context={results ? "post_quiz" : "quiz"}
      />
    </div>
  );
}

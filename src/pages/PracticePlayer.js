import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPracticeSet, submitPracticeSet } from "../api/practice.api";
import { HiArrowLeft, HiCheckCircle, HiLightBulb } from "react-icons/hi2";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function PracticePlayer() {
  const { courseId, practiceSetId } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [practiceSet, setPracticeSet] = useState(null);
  const [answers, setAnswers] = useState({}); // questionIndex -> answer
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }

    const fetchPractice = async () => {
      try {
        setLoading(true);
        const data = await getPracticeSet(practiceSetId);
        setPracticeSet(data);
      } catch (error) {
        console.error("Error loading practice set:", error);
        toast.error("Failed to load practice set.");
      } finally {
        setLoading(false);
      }
    };
    fetchPractice();
  }, [practiceSetId, token, nav]);

  const handleSelectAnswer = (index, option) => {
    setAnswers(prev => ({ ...prev, [index]: option }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < practiceSet.questions.length) {
      if (!window.confirm("You have unanswered questions. Submit anyway?")) return;
    }
    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([idx, ans]) => ({
        questionIndex: parseInt(idx),
        selectedAnswer: ans
      }));
      const res = await submitPracticeSet(practiceSetId, formattedAnswers);
      setResults(res);
      toast.success("Practice completed!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit practice");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!practiceSet) return null;

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

        <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <HiLightBulb className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Practice Session</h1>
              <p className="text-indigo-100 font-bold text-sm uppercase tracking-widest">
                Type: {practiceSet.practiceType} • {practiceSet.questions.length} Questions
                {practiceSet.generationMethod === "gemini" && " • AI-Generated"}
                {practiceSet.generationMethod === "rule_based_fallback" && " • Fallback Generation"}
              </p>
            </div>
          </div>
          {practiceSet.weakTopics.length > 0 && (
            <div className="pt-4 border-t border-white/10 text-sm">
              <span className="opacity-70">Focusing on:</span> {practiceSet.weakTopics.join(", ")}
            </div>
          )}
        </div>

        {!results ? (
          <div className="space-y-6">
            {practiceSet.questions.map((q, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
              >
                <h3 className="text-lg font-bold">
                  <span className="text-indigo-500 mr-2">{i + 1}.</span> 
                  {q.questionText}
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectAnswer(i, opt.key)}
                      className={`w-full text-left px-6 py-4 rounded-xl border-2 font-semibold transition-all ${
                        answers[i] === opt.key
                          ? "border-indigo-650 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20 shadow-md"
                          : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50"
                      }`}
                    >
                      <span className="font-bold mr-3">{opt.key}.</span> {opt.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}

            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black text-xl uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all shadow-xl disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Complete Practice"}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-8"
          >
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 shrink-0">
                <HiCheckCircle className="w-10 h-10" />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  Practice Completed
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white mt-1">Practice Report Card</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mastery Score</span>
                <p className="text-3xl font-black text-indigo-600 mt-1">{results.scorePercent}%</p>
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Insight</span>
                <p className="text-base font-bold text-slate-700 dark:text-slate-350 mt-2 leading-relaxed">{results.feedbackSummary}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tight pt-4 border-t border-slate-100 dark:border-slate-800">Review & Feedback</h3>
              {practiceSet.questions.map((q, i) => {
                const userAns = results.detailedFeedback.find(df => df.questionIndex === i);
                return (
                  <div key={i} className="p-6 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <p className="font-bold text-sm text-slate-400 uppercase tracking-widest">Question {i + 1}</p>
                    <p className="font-bold text-lg text-slate-900 dark:text-white leading-relaxed">{q.questionText}</p>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase ${userAns.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {userAns.isCorrect ? "Correct" : "Incorrect"}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-semibold">Your Answer: <strong className="text-slate-850 dark:text-white">{userAns.selectedAnswer || "None"}</strong> • Correct Answer: <strong className="text-slate-850 dark:text-white">{userAns.correctAnswer}</strong></span>
                    </div>
                    {q.explanation && (
                      <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl text-sm border-l-4 border-indigo-500 text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm">
                        <span className="font-black text-indigo-500 uppercase text-[10px] block mb-1">Explanation</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => nav(`/course/${courseId}`)}
              className="w-full py-4.5 bg-slate-950 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all transform active:scale-95 shadow-md flex items-center justify-center gap-2"
            >
              Back to Course Path <HiArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

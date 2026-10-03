import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonById } from "../api/adminLessons.api";
import { HiArrowLeft, HiChevronLeft, HiChevronRight, HiPlay } from "react-icons/hi2";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import AITutorChat from "../components/AITutorChat";

export default function LessonPlayer() {
  const { courseId, lessonId } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const data = await getLessonById(lessonId);
        if (!data || !data.slides || data.slides.length === 0) {
          toast.error("This lesson has no content.");
          nav(`/course/${courseId}`);
          return;
        }
        setLesson(data);
      } catch (error) {
        console.error("Failed to load lesson", error);
        toast.error("Failed to load lesson.");
        nav(`/course/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, courseId, token, nav]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!lesson) return null;

  const slides = lesson.slides;
  const currentSlide = slides[currentSlideIndex];
  const isLastSlide = currentSlideIndex === slides.length - 1;
  const isFirstSlide = currentSlideIndex === 0;

  const progressPercent = ((currentSlideIndex + 1) / slides.length) * 100;

  const handleNext = () => {
    if (!isLastSlide) setCurrentSlideIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (!isFirstSlide) setCurrentSlideIndex((prev) => prev - 1);
  };

  const handleStartQuiz = () => {
    nav(`/course/${courseId}/quiz/${lessonId}`);
  };

  const renderElement = (el, idx) => {
    const { type, data } = el;
    switch (type) {
      case "heading":
        return (
          <h1 key={idx} className="text-4xl md:text-6xl font-black text-white text-center tracking-tighter leading-tight drop-shadow-lg">
            {data.text}
          </h1>
        );
      case "subheading":
        return (
          <h2 key={idx} className="text-2xl md:text-3xl font-bold text-blue-400 text-center uppercase tracking-widest drop-shadow-md">
            {data.text}
          </h2>
        );
      case "text":
        return (
          <p key={idx} className="text-lg md:text-2xl text-slate-300 max-w-4xl text-center leading-relaxed font-medium">
            {data.text}
          </p>
        );
      case "image":
        return (
          <div key={idx} className="flex justify-center w-full my-8">
            <img 
              src={data.url} 
              alt="Slide content" 
              className="max-w-full max-h-[50vh] rounded-3xl shadow-2xl border border-white/10"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&q=80&w=1200";
              }}
            />
          </div>
        );
      case "bullets":
        return (
          <ul key={idx} className="space-y-6 text-left max-w-3xl mx-auto w-full my-8">
            {data.items.map((item, i) => (
              <li key={i} className="flex items-start gap-4 text-xl text-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2.5 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="h-20 shrink-0 border-b border-white/10 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur-md z-50">
        <button 
          onClick={() => nav(`/course/${courseId}`)}
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Exit Lesson
        </button>
        
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
            {lesson.title}
          </span>
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        
        <div className="w-32 text-right text-sm font-bold text-slate-400">
          {currentSlideIndex + 1} <span className="text-slate-600">/</span> {slides.length}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-6 md:p-12">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlideIndex}
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.99 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="w-full max-w-4xl bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/10 dark:border-slate-800/80 shadow-2xl p-8 md:p-16 max-h-[70vh] overflow-y-auto hide-scrollbar flex flex-col items-center justify-center gap-8 shadow-blue-500/5 glow-blue"
          >
            <div className="w-full flex flex-col items-center gap-6">
              {currentSlide.elements.map((el, idx) => renderElement(el, idx))}
            </div>
            
            {/* Show Start Quiz button strictly on the very last slide */}
            {isLastSlide && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-10 pt-10 border-t border-white/10 w-full max-w-2xl text-center space-y-6"
              >
                <h3 className="text-2xl md:text-3xl font-extrabold text-white uppercase tracking-tight">Ready to test your knowledge?</h3>
                <p className="text-slate-400 text-base">You've completed the lesson material. Take the quiz to unlock the next module.</p>
                <button
                  onClick={handleStartQuiz}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg uppercase tracking-wider hover:shadow-xl hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <HiPlay className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  Start Quiz
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="h-24 shrink-0 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-12 z-50 absolute bottom-0 left-0 right-0">
        <button
          onClick={handlePrev}
          disabled={isFirstSlide}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-all
            ${isFirstSlide ? "opacity-30 cursor-not-allowed text-slate-500" : "text-white hover:bg-white/10"}`}
        >
          <HiChevronLeft className="w-6 h-6" />
          Previous
        </button>

        {!isLastSlide ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-xl font-black uppercase tracking-widest hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Next Slide
            <HiChevronRight className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={handleStartQuiz}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            Take Quiz
            <HiPlay className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* AI Tutor Chat Integrated */}
      <AITutorChat 
        mode="lesson_help"
        courseId={courseId}
        lessonId={lessonId}
        currentSlideIndex={currentSlideIndex}
        context="lesson"
      />
    </div>
  );
}

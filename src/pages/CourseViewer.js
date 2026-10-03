import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicCourse } from "../api/courses.api";
import { listLessonsByCourse } from "../api/adminLessons.api";
import { getCourseProgress } from "../api/enrollments.api";
import { HiArrowLeft, HiAcademicCap, HiUser, HiClock, HiLockClosed, HiCheckBadge } from "react-icons/hi2";
import { motion } from "framer-motion";
import { useAuth } from "../auth/AuthContext";
import { toast } from "react-toastify";

export default function CourseViewer() {
  const { courseId } = useParams();
  const nav = useNavigate();
  const { token } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      toast.info("Please login to view this course.");
      nav("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, lessonsData, progressData] = await Promise.all([
          getPublicCourse(courseId),
          listLessonsByCourse(courseId),
          getCourseProgress(courseId).catch(() => ({ completedLessonIds: [] }))
        ]);
        setCourse(courseData);
        setLessons(lessonsData || []);
        setCompletedLessonIds(new Set(progressData.completedLessonIds || []));
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        toast.error("Could not load course. You may not be enrolled.");
        nav("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, token, nav]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) return null;

  const publisherName = course.createdBy?.name || "Smart Path Instructor";
  const publishDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : "Recent";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-6 transition-colors duration-500">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Navigation back */}
        <button 
          onClick={() => nav("/")}
          className="group flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <HiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        {/* Course Header / Meta data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/50 dark:border-slate-800"
        >
          <div className="aspect-[21/9] relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img 
              src={course.bannerImage || course.image} 
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&q=80&w=800";
              }}
            />
            <div className="absolute top-6 left-6 z-20 flex gap-2">
              <span className="px-4 py-1.5 bg-blue-600/90 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg border border-blue-500/50">
                {course.level}
              </span>
            </div>
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tighter uppercase drop-shadow-2xl">
                {course.title}
              </h1>
            </div>
          </div>
          
          <div className="p-8 sm:p-12 space-y-8">
            <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                <HiUser className="w-5 h-5 text-blue-500" />
                <span>{publisherName}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                <HiAcademicCap className="w-5 h-5 text-indigo-500" />
                <span>Published {publishDate}</span>
              </div>
            </div>

            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {course.description || course.desc}
            </p>

            {(course.tags && course.tags.length > 0) && (
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Core Concepts</span>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-800 uppercase tracking-widest hover:border-blue-500/50 transition-colors shadow-sm">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Course Progress & Next Recommended Action */}
        {lessons.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] border border-slate-205 dark:border-slate-800 shadow-lg space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Your Progress</span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                  {Math.round((lessons.filter(l => completedLessonIds.has(l._id)).length / lessons.length) * 100)}% Complete
                </h3>
              </div>
              <div className="w-full sm:w-72 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${(lessons.filter(l => completedLessonIds.has(l._id)).length / lessons.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>

            {(() => {
              const activeLessonIndex = lessons.findIndex((lesson, index) => {
                const isFirstLesson = index === 0;
                const prevLessonId = index > 0 ? lessons[index - 1]._id : null;
                const isUnlocked = isFirstLesson || completedLessonIds.has(prevLessonId);
                const isCompleted = completedLessonIds.has(lesson._id);
                return isUnlocked && !isCompleted;
              });

              if (activeLessonIndex === -1) {
                return (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-green-800 dark:text-green-400 uppercase tracking-tight text-sm">Course Completed! 🎉</h4>
                      <p className="text-xs text-green-600 dark:text-green-500 font-semibold mt-0.5">You've successfully mastered all content and quizzes in this course.</p>
                    </div>
                  </div>
                );
              }

              const nextLesson = lessons[activeLessonIndex];
              return (
                <div className="p-5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Next Recommended Action</span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-tight text-lg mt-1">Module {activeLessonIndex + 1}: {nextLesson.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">Continue your adaptive path to lock in your mastery.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => nav(`/course/${courseId}/lesson/${nextLesson._id}`)}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Resume Lesson
                    </button>
                    <button 
                      onClick={() => nav(`/course/${courseId}/quiz/${nextLesson._id}`)}
                      className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white transition-colors"
                    >
                      Take Quiz
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Lessons List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8 relative"
        >
          <div className="absolute -inset-10 bg-gradient-to-b from-blue-500/5 to-transparent blur-3xl -z-10 rounded-full" />
          
          <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
            Course Lessons
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full border border-blue-200 dark:border-blue-800/50">
              {lessons.length} Modules
            </span>
          </h2>
          
          {lessons.length === 0 ? (
            <div className="p-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2rem] border border-dashed border-slate-300 dark:border-slate-700 text-center text-slate-500 font-medium">
              No lessons have been added to this course yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {lessons.map((lesson, index) => {
                const isFirstLesson = index === 0;
                const prevLessonId = index > 0 ? lessons[index - 1]._id : null;
                const isUnlocked = isFirstLesson || completedLessonIds.has(prevLessonId);
                const isCompleted = completedLessonIds.has(lesson._id);

                return (
                  <motion.div 
                    key={lesson._id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] border shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-all duration-300
                      ${isUnlocked 
                        ? "border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:-translate-y-1" 
                        : "border-slate-100 dark:border-slate-800/50 opacity-60 grayscale-[50%]"
                      }
                      ${isCompleted ? "border-green-500/30 dark:border-green-500/30 bg-green-50/30 dark:bg-green-900/10" : ""}
                    `}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-colors shadow-inner
                        ${isCompleted ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800/50" : 
                          isUnlocked ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50" : 
                          "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"}
                      `}>
                        {isUnlocked ? (isCompleted ? <HiCheckBadge className="w-8 h-8" /> : index + 1) : <HiLockClosed className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className={`text-xl sm:text-2xl font-black uppercase tracking-tight transition-colors
                            ${isUnlocked ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"}
                          `}>
                            {lesson.title}
                          </h3>
                          {!isUnlocked && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Locked</span>
                          )}
                        </div>
                        
                        {lesson.estimatedTime && (
                          <div className={`flex items-center gap-1.5 text-sm font-semibold mt-2
                            ${isUnlocked ? "text-slate-500 dark:text-slate-400" : "text-slate-400 dark:text-slate-600"}
                          `}>
                            <HiClock className="w-4 h-4" />
                            <span>{lesson.estimatedTime} mins</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                      <button 
                        disabled={!isUnlocked}
                        onClick={() => nav(`/course/${courseId}/lesson/${lesson._id}`)}
                        className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm shrink-0
                          ${isUnlocked 
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95" 
                            : "bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed"}
                        `}
                      >
                        Start Lesson
                      </button>
                      <button 
                        disabled={!isUnlocked}
                        onClick={() => nav(`/course/${courseId}/quiz/${lesson._id}`)}
                        className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-sm shrink-0
                          ${isUnlocked 
                            ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95" 
                            : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700"}
                        `}
                      >
                        Start Quiz
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

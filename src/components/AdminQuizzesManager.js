import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { listLessonsByCourse } from "../api/adminLessons.api";
import AdminQuizBuilder from "./AdminQuizBuilder";

export default function AdminQuizzesManager({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  const loadLessons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listLessonsByCourse(courseId);
      setLessons(Array.isArray(data) ? data.sort((a,b) => (a.order||0) - (b.order||0)) : []);
    } catch (e) {
      toast.error("Failed to load lessons for quizzes manager");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  if (loading) return <div className="text-slate-600 p-4">Loading lessons...</div>;

  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
        You need to create at least one Lesson before you can add Quizzes.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-800 mb-2">Select a Lesson to Manage its Quiz</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {lessons.map(l => (
            <button
              key={l._id}
              onClick={() => setSelectedLessonId(l._id)}
              className={[
                "text-left p-4 rounded-xl border transition-all duration-200",
                selectedLessonId === l._id 
                  ? "border-blue-600 bg-blue-50/50 shadow-md ring-1 ring-blue-600 transform scale-[1.02]"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 hover:shadow-sm"
              ].join(" ")}
            >
              <div className="text-xs font-semibold text-slate-500 mb-1">Order: {l.order}</div>
              <div className="font-extrabold text-slate-900 truncate">{l.title}</div>
            </button>
          ))}
        </div>
      </div>

      {selectedLessonId ? (
        <div className="mt-6 border-t border-slate-200 pt-6">
           <AdminQuizBuilder lessonId={selectedLessonId} />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
          Click on a lesson above to view or edit its Quiz.
        </div>
      )}
    </div>
  );
}

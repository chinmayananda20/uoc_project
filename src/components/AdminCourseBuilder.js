import React, { useState } from "react";
import AdminLessonsManager from "./AdminLessonsManager";
import AdminCourseCreateForm from "./AdminCourseCreateForm";
import AdminQuizzesManager from "./AdminQuizzesManager";

export default function AdminCourseBuilder({ course, onBack, onCourseUpdated }) {
  const [tab, setTab] = useState("details");

  if (!course?._id) {
    return (
      <div className="w-full">
        <button onClick={onBack} className="rounded-xl border px-4 py-2">
          Back
        </button>
        <div className="mt-4 text-slate-600">No course selected.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Manage: {course.title}
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Course setup and content</p>
        </div>

        <button
          onClick={onBack}
          className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm transition-all"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("details")}
          className={[
            "rounded-xl px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all",
            tab === "details"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
          ].join(" ")}
        >
          Details
        </button>

        <button
          onClick={() => setTab("lessons")}
          className={[
            "rounded-xl px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all",
            tab === "lessons"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
          ].join(" ")}
        >
          Lessons
        </button>

        <button
          onClick={() => setTab("quizzes")}
          className={[
            "rounded-xl px-5 py-2.5 font-black text-xs uppercase tracking-widest transition-all",
            tab === "quizzes"
              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-200 dark:shadow-none"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700",
          ].join(" ")}
        >
          Quizzes
        </button>
      </div>

      <div className="mt-6">
        {tab === "details" ? (
          <AdminCourseCreateForm
            editingCourse={course}
            setFlag={() => {}}
            addCourseToList={() => {}}
            updateCoursePublished={() => {}}
            onBack={onBack}
            onCourseUpdated={onCourseUpdated}
          />
        ) : tab === "lessons" ? (
          <AdminLessonsManager courseId={course._id} />
        ) : (
          <AdminQuizzesManager courseId={course._id} />
        )}
      </div>
    </div>
  );
}
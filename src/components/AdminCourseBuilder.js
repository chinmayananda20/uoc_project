import React, { useState } from "react";
import AdminLessonsManager from "./AdminLessonsManager";
import AdminCourseCreateForm from "./AdminCourseCreateForm";

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Manage: {course.title}
          </h2>
          <p className="text-sm text-slate-600">Course setup and content</p>
        </div>

        <button
          onClick={onBack}
          className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => setTab("details")}
          className={[
            "rounded-xl px-4 py-2 font-semibold",
            tab === "details" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800",
          ].join(" ")}
        >
          Details
        </button>

        <button
          onClick={() => setTab("lessons")}
          className={[
            "rounded-xl px-4 py-2 font-semibold",
            tab === "lessons" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800",
          ].join(" ")}
        >
          Lessons
        </button>

        <button
          onClick={() => setTab("quizzes")}
          className={[
            "rounded-xl px-4 py-2 font-semibold",
            tab === "quizzes" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800",
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
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
            Quizzes UI coming next.
          </div>
        )}
      </div>
    </div>
  );
}
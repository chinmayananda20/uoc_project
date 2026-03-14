import React, { useMemo, useState, useEffect } from "react";
import {
  adminCreateCourse,
  adminSetCoursePublished,
  adminUpdateCourse,
} from "../api/admin.api";
import { toast } from "react-toastify";
const LEVELS = ["beginner", "intermediate", "advanced"];

const AdminCourseCreateForm = ({
  setFlag,
  onBack,
  addCourseToList,
  updateCoursePublished,
  editingCourse,
  onCourseUpdated,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const canSubmit = useMemo(() => {
    return (
      title.trim().length >= 2 && description.trim().length >= 10 && !saving
    );
  }, [title, description, saving]);

  const addTag = () => {
    const raw = tagInput.trim();
    if (!raw) return;

    const exists = tags.some((t) => t.toLowerCase() === raw.toLowerCase());
    if (exists) {
      setTagInput("");
      return;
    }

    setTags((prev) => [...prev, raw]);
    setTagInput("");
  };
  useEffect(() => {
    if (!editingCourse) return;

    setTitle(editingCourse.title || "");
    setDescription(editingCourse.description || "");
    setLevel(editingCourse.level || "beginner");
    setTags(Array.isArray(editingCourse.tags) ? editingCourse.tags : []);
    setTagInput("");
  }, [editingCourse]);

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const isEdit = Boolean(editingCourse?._id);

  const handleSubmit = async (publish = false) => {
    if (!canSubmit) return;

    setErr("");
    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      level,
      tags,
    };

    try {
      if (isEdit) {
        const updated = await adminUpdateCourse(editingCourse._id, payload);

        const merged = { ...editingCourse, ...updated };
        onCourseUpdated?.(merged);

        toast.success("Course updated successfully");

        if (publish && merged.published !== true) {
          await adminSetCoursePublished(merged._id, true);
          updateCoursePublished?.(merged._id, true);
          onCourseUpdated?.({ ...merged, published: true });

          toast.success("Course published successfully");
        }

        if (onBack) onBack();
        else if (setFlag) setFlag(false);

        return;
      }

      // CREATE
      const course = await adminCreateCourse(payload);

      addCourseToList({ ...course, published: false });

      toast.success("Course created successfully");

      if (publish) {
        await adminSetCoursePublished(course._id, true);
        updateCoursePublished?.(course._id, true);
        toast.success("Course published successfully");
      }

      // Reset form
      setTitle("");
      setDescription("");
      setTags([]);
      setTagInput("");
      setLevel("beginner");

      if (onBack) onBack();
      else if (setFlag) setFlag(false);
    } catch (e) {
      const message =
        e?.response?.data?.error || "Something went wrong. Please try again.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <h2 className="text-2xl font-extrabold text-slate-900">
          {isEdit ? "Edit Course" : "Create Course"}
        </h2>

        <button
          onClick={() => (onBack ? onBack() : setFlag(false))}
          className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Title */}
        <div>
          <label className="text-sm font-semibold text-slate-700">
            Title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="Course title"
          />
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">
            Description *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
            placeholder="Course description"
          />
        </div>

        {/* Level */}
        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mt-5">
          <label className="text-sm font-semibold text-slate-700">Tags</label>

          <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-slate-300 px-3 py-2">
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  className="ml-2 text-slate-500 hover:text-slate-800"
                >
                  ×
                </button>
              </span>
            ))}

            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="flex-1 border-none outline-none text-sm"
              placeholder="Type tag + Enter"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={!canSubmit}
            className="rounded-xl bg-slate-200 px-5 py-2.5 font-semibold text-slate-800 hover:bg-slate-300 disabled:opacity-50"
          >
            {saving ? "Saving..." : isEdit ? "Update" : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={!canSubmit}
            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving
              ? "Working..."
              : isEdit
                ? "Update & Publish"
                : "Create & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCourseCreateForm;

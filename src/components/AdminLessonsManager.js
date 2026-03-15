// src/components/AdminLessonsManager.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "react-toastify";

import {
  adminCreateLesson,
  adminDeleteLesson,
  listLessonsByCourse,
  getLessonById,
  adminUpdateLesson,
} from "../api/adminLessons.api";

// ---------------- constants ----------------

const ELEMENT_TYPES = ["heading", "subheading", "text", "bullets", "image"];

const TOAST = {
  LOAD: "lessons-load",
  SAVE: "lessons-save",
  DEL: "lessons-del",
};

// ---------------- utils ----------------

const uid = () =>
  typeof crypto !== "undefined" && crypto?.randomUUID
    ? crypto.randomUUID()
    : String(Date.now() + Math.random());

function toastLoadingOnce(id, msg) {
  if (toast.isActive(id)) return id;
  return toast.loading(msg, { toastId: id });
}

function formatDate(d) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

const newElement = (type) => {
  const base = { uid: uid(), type, data: {} };

  switch (type) {
    case "heading":
    case "subheading":
    case "text":
      return { ...base, data: { text: "" } };

    case "bullets":
      return { ...base, data: { items: [""] } };

    case "image":
      return { ...base, data: { url: "", alt: "" } };

    default:
      return { ...base, type: "text", data: { text: "" } };
  }
};

const normalizeElement = (el) => {
  const type = String(el?.type || "");
  const data = el?.data && typeof el.data === "object" ? el.data : {};
  const localUid = el?.uid || uid(); // DB doesn't store uid

  if (!ELEMENT_TYPES.includes(type)) return newElement("text");

  if (type === "bullets") {
    const items = Array.isArray(data.items) ? data.items : [];
    return {
      uid: localUid,
      type,
      data: { items: items.map((x) => String(x ?? "")) },
    };
  }

  if (type === "image") {
    return {
      uid: localUid,
      type,
      data: { url: String(data.url ?? ""), alt: String(data.alt ?? "") },
    };
  }

  return {
    uid: localUid,
    type,
    data: { text: String(data.text ?? "") },
  };
};

const emptySlide = () => ({
  label: "",
  elements: [newElement("text")], // schema needs >=1 element
});

const normalizeSlide = (slide) => {
  const s = slide && typeof slide === "object" ? slide : {};
  const elements = Array.isArray(s.elements) ? s.elements : [];
  return {
    label: String(s.label || ""),
    elements: elements.length ? elements.map(normalizeElement) : [newElement("text")],
  };
};

// ---------------- element editor ----------------

function ElementEditor({ el, onChange }) {
  if (!el) return null;

  if (el.type === "heading" || el.type === "subheading") {
    return (
      <input
        value={el.data?.text || ""}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium"
        placeholder={el.type === "heading" ? "Heading..." : "Subheading..."}
      />
    );
  }

  if (el.type === "text") {
    return (
      <textarea
        rows={5}
        value={el.data?.text || ""}
        onChange={(e) => onChange({ text: e.target.value })}
        className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium"
        placeholder="Text..."
      />
    );
  }

  if (el.type === "bullets") {
    const value = Array.isArray(el.data?.items) ? el.data.items.join("\n") : "";
    return (
      <textarea
        rows={4}
        value={value}
        onChange={(e) =>
          onChange({
            items: String(e.target.value || "")
              .split("\n")
              .map((x) => x.trim())
              .filter(Boolean),
          })
        }
        className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all font-medium"
        placeholder="One bullet per line"
      />
    );
  }

  if (el.type === "image") {
    const url = el.data?.url || "";
    const alt = el.data?.alt || "";

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            value={url}
            onChange={(e) => onChange({ url: e.target.value })}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            placeholder="Image URL..."
          />
          <input
            value={alt}
            onChange={(e) => onChange({ alt: e.target.value })}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            placeholder="Alt text..."
          />
        </div>

        {String(url).trim() ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3 shadow-inner">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Preview</div>
            <img
              src={String(url).trim()}
              alt={alt || "Slide image"}
              className="mt-2 max-h-48 w-full object-contain rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="mt-2 text-[10px] font-bold text-slate-500 dark:text-slate-600 italic">
              If it doesn’t show, the URL is invalid or blocked.
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
}

// ---------------- main ----------------

export default function AdminLessonsManager({ courseId }) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [view, setView] = useState("list"); // list | editor
  const [editingLesson, setEditingLesson] = useState(null);

  // editor fields
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(5);
  const [slides, setSlides] = useState([emptySlide()]);
  const [openSlideIndex, setOpenSlideIndex] = useState(0);

  const [saving, setSaving] = useState(false);

  const sortedLessons = useMemo(() => {
    return [...(lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [lessons]);

  const load = useCallback(async () => {
    if (!courseId) return;

    toastLoadingOnce(TOAST.LOAD, "Loading lessons...");

    try {
      setLoading(true);
      setErr("");
      const data = await listLessonsByCourse(courseId);
      setLessons(Array.isArray(data) ? data : []);
      toast.update(TOAST.LOAD, {
        render: "Lessons loaded",
        type: "success",
        isLoading: false,
        autoClose: 1200,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to load lessons";
      setErr(msg);
      toast.update(TOAST.LOAD, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const backToList = () => {
    setView("list");
    setEditingLesson(null);
    setErr("");
  };

  const openCreate = () => {
    setEditingLesson(null);
    setTitle("");
    setOrder(
      sortedLessons.length
        ? Number(sortedLessons[sortedLessons.length - 1]?.order || 0) + 1
        : 1
    );
    setEstimatedTime(5);
    setSlides([emptySlide()]);
    setOpenSlideIndex(0);
    setView("editor");
  };

  const openEdit = async (lesson) => {
  try {
    toastLoadingOnce("lesson-load-one", "Loading lesson...");

    const full = await getLessonById(lesson._id); // <-- IMPORTANT

    setEditingLesson(full);
    setTitle(String(full?.title || ""));
    setOrder(Number(full?.order || 1));
    setEstimatedTime(Number(full?.estimatedTime || 5));

    const dbSlides = Array.isArray(full?.slides) ? full.slides : [];
    setSlides(dbSlides.length ? dbSlides.map(normalizeSlide) : [emptySlide()]);
    setOpenSlideIndex(0);
    setView("editor");

    toast.update("lesson-load-one", {
      render: "Lesson loaded",
      type: "success",
      isLoading: false,
      autoClose: 800,
    });
  } catch (e) {
    const msg = e?.response?.data?.message || "Failed to load lesson";
    setErr(msg);
    toast.update("lesson-load-one", {
      render: msg,
      type: "error",
      isLoading: false,
      autoClose: 2000,
    });
  }
};

  // -------- slides ops (no stale-length bugs) --------

  const addSlide = () => {
    setSlides((prev) => {
      const next = [...prev, emptySlide()];
      setOpenSlideIndex(next.length - 1);
      return next;
    });
  };

  const duplicateSlide = (idx) => {
    setSlides((prev) => {
      const src = prev[idx] ? JSON.parse(JSON.stringify(prev[idx])) : emptySlide();
      // refresh uids so React keys stay unique
      const copied = normalizeSlide(src);
      copied.elements = copied.elements.map((e) => ({ ...e, uid: uid() }));
      const next = [...prev.slice(0, idx + 1), copied, ...prev.slice(idx + 1)];
      setOpenSlideIndex(idx + 1);
      return next;
    });
  };

  const removeSlide = (idx) => {
    setSlides((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      const ensured = next.length ? next : [emptySlide()];
      setOpenSlideIndex((prevIdx) =>
        Math.max(0, Math.min(prevIdx, ensured.length - 1))
      );
      return ensured;
    });
  };

  const updateSlide = (idx, patch) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  // -------- element ops --------

  const addElement = (slideIdx, type) => {
    setSlides((prev) =>
      prev.map((s, i) =>
        i === slideIdx ? { ...s, elements: [...(s.elements || []), newElement(type)] } : s
      )
    );
  };

  const updateElement = (slideIdx, elUid, patchData) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== slideIdx) return s;
        const arr = [...(s.elements || [])];
        const idx = arr.findIndex((x) => x.uid === elUid);
        if (idx < 0) return s;
        arr[idx] = { ...arr[idx], data: { ...(arr[idx].data || {}), ...patchData } };
        return { ...s, elements: arr };
      })
    );
  };

  const deleteElement = (slideIdx, elUid) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== slideIdx) return s;
        const next = (s.elements || []).filter((x) => x.uid !== elUid);
        return { ...s, elements: next.length ? next : [newElement("text")] };
      })
    );
  };

  const moveElement = (slideIdx, elUid, dir) => {
    setSlides((prev) =>
      prev.map((s, i) => {
        if (i !== slideIdx) return s;
        const arr = [...(s.elements || [])];
        const idx = arr.findIndex((x) => x.uid === elUid);
        if (idx < 0) return s;

        const j = idx + dir;
        if (j < 0 || j >= arr.length) return s;

        [arr[idx], arr[j]] = [arr[j], arr[idx]];
        return { ...s, elements: arr };
      })
    );
  };

  // -------- validation + payload --------

  const canSave = useMemo(() => {
    if (saving) return false;
    if (!title.trim()) return false;

    const o = Number(order);
    const t = Number(estimatedTime);

    if (!Number.isFinite(o) || o < 1) return false;
    if (!Number.isFinite(t) || t < 1 || t > 30) return false;

    if (!Array.isArray(slides) || slides.length < 1) return false;

    // schema requires each slide has >=1 element
    for (const s of slides) {
      const el = Array.isArray(s?.elements) ? s.elements : [];
      if (!el.length) return false;
    }

    return true;
  }, [title, order, estimatedTime, slides, saving]);

  const buildPayload = () => ({
    title: title.trim(),
    order: Number(order),
    estimatedTime: Number(estimatedTime),
    slides: slides.map((s) => ({
      label: String(s.label || ""),
      // strip uid before sending to backend
      elements: (s.elements || []).map(({ uid, ...rest }) => rest),
    })),
  });

  const saveLesson = async () => {
    if (!canSave) {
      toast.error("Fix validation errors before saving");
      return;
    }

    toastLoadingOnce(
      TOAST.SAVE,
      editingLesson?._id ? "Updating lesson..." : "Creating lesson..."
    );

    try {
      setSaving(true);
      setErr("");

      const payload = buildPayload();

      if (editingLesson?._id) {
        const updated = await adminUpdateLesson(editingLesson._id, payload);
        setLessons((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
        toast.update(TOAST.SAVE, {
          render: "Lesson updated",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
      } else {
        const created = await adminCreateLesson(courseId, payload);
        setLessons((prev) => [created, ...(prev || [])]);
        toast.update(TOAST.SAVE, {
          render: "Lesson created",
          type: "success",
          isLoading: false,
          autoClose: 1500,
        });
      }

      backToList();
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save lesson";
      setErr(msg);
      toast.update(TOAST.SAVE, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteLesson = async (lessonId) => {
    const ok = window.confirm("Delete this lesson? This cannot be undone.");
    if (!ok) return;

    toastLoadingOnce(TOAST.DEL, "Deleting lesson...");

    try {
      setErr("");
      await adminDeleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
      toast.update(TOAST.DEL, {
        render: "Lesson deleted",
        type: "success",
        isLoading: false,
        autoClose: 1500,
      });
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to delete lesson";
      setErr(msg);
      toast.update(TOAST.DEL, {
        render: msg,
        type: "error",
        isLoading: false,
        autoClose: 2500,
      });
    }
  };

  // ---------------- render guards ----------------

  if (!courseId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
        Missing courseId. Pass courseId to AdminLessonsManager.
      </div>
    );
  }

  if (loading) {
    return <div className="text-slate-600">Loading lessons...</div>;
  }

  // ---------------- UI ----------------

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Lessons Manager</h2>
          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
            Create lessons and build slide-based content.
          </p>
        </div>

        {view === "list" ? (
          <button
            onClick={openCreate}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            + New Lesson
          </button>
        ) : (
          <button
            onClick={backToList}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Back to List
          </button>
        )}
      </div>

      {err ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
          {err}
        </div>
      ) : null}

      {/* LIST VIEW */}
      {view === "list" ? (
        <div className="mt-6">
          {sortedLessons.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
              No lessons yet. Create your first lesson.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {sortedLessons.map((l) => (
                <div
                  key={l._id}
                  className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          Order {l.order}
                        </span>
                        <span className="rounded-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          {l.estimatedTime} min
                        </span>
                        <span className="rounded-full bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">
                          {Number(l.slidesCount || 0)} slides
                        </span>
                      </div>

                      <h3 className="mt-4 truncate text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        {l.title}
                      </h3>

                      <div className="mt-2 text-xs text-slate-500">
                        Updated{" "}
                        <span className="font-semibold text-slate-700">
                          {formatDate(l.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => openEdit(l)}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteLesson(l._id)}
                        className="rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-100 transition-all active:scale-95"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={load}
            className="mt-6 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>
      ) : (
        /* EDITOR VIEW */
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 h-fit sticky top-24">
            <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Lesson Settings</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                    placeholder="Lesson title"
                  />
                </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all text-center"
                    min={1}
                  />
                </div>
 
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                    Mins
                  </label>
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all text-center"
                    min={1}
                    max={30}
                  />
                </div>
              </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                Slides: <span className="font-bold">{slides.length}</span>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={saveLesson}
                  disabled={!canSave}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-black text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
                >
                  {saving
                    ? "Saving..."
                    : editingLesson?._id
                      ? "Update Lesson"
                      : "Create Lesson"}
                </button>
 
                <button
                  onClick={backToList}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-6 py-4 font-black text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>

            <button
              onClick={addSlide}
              className="mt-4 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 font-black text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl shadow-slate-200/20 dark:shadow-none active:scale-[0.98] uppercase tracking-widest text-xs"
            >
              + Add Slide
            </button>
          </div>

          {/* Right Panel: Slides List */}
          <div className="lg:col-span-8">
            <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Slide Deck</h3>
              <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 max-w-lg leading-relaxed">
                Add content elements like headings, text, and images to each slide. 
                Reorder slides using the sidebar controls.
              </p>

              <div className="mt-5 space-y-3">
                {slides.map((s, idx) => {
                  const open = openSlideIndex === idx;

                  const slideTitle = (() => {
                    const headingEl = (s.elements || []).find((e) => e.type === "heading");
                    const subEl = (s.elements || []).find((e) => e.type === "subheading");
                    const heading = headingEl?.data?.text?.trim();
                    const sub = subEl?.data?.text?.trim();
                    return heading || sub || s.label?.trim() || `Slide ${idx + 1}`;
                  })();

                  return (
                    <div
                      key={`slide-${idx}`}
                      className="rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenSlideIndex(open ? -1 : idx)}
                        className={`w-full flex items-center justify-between gap-3 px-6 py-5 text-left transition-colors ${open ? 'bg-blue-600' : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <div className="min-w-0">
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${open ? 'text-blue-200' : 'text-slate-400 dark:text-slate-500'}`}>Slide 0{idx + 1}</div>
                          <div className={`truncate text-lg font-black tracking-tight ${open ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                            {slideTitle}
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${open ? 'bg-white/20 border-white/30 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          {open ? "Close Editor" : "Edit Slide"}
                        </span>
                      </button>

                      {open ? (
                        <div className="p-6 space-y-8 bg-white dark:bg-slate-900/50 animate-in fade-in slide-in-from-top-4 duration-300">
                          <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
                              Slide internal label (optional)
                            </label>
                            <input
                              value={s.label || ""}
                              onChange={(e) => updateSlide(idx, { label: e.target.value })}
                              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium transition-all"
                              placeholder="e.g. Intro Concept 1"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
                              Insert Elements
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {ELEMENT_TYPES.map((t) => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => addElement(idx, t)}
                                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95"
                                >
                                  + {t}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {(slides[idx]?.elements || []).map((el) => (
                              <div
                                key={el.uid}
                                className="rounded-[1.5rem] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 group transition-colors"
                              >
                                <div className="mb-4 flex items-center justify-between">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                                    {el.type}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => moveElement(idx, el.uid, -1)}
                                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveElement(idx, el.uid, +1)}
                                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold hover:bg-slate-50"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => deleteElement(idx, el.uid)}
                                      className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>

                                <ElementEditor
                                  el={el}
                                  onChange={(patch) => updateElement(idx, el.uid, patch)}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => duplicateSlide(idx)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                            >
                              Duplicate slide
                            </button>

                            <button
                              type="button"
                              onClick={() => removeSlide(idx)}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              Delete slide
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={addSlide}
                className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800 transition active:scale-[0.98] shadow-sm"
              >
                + Add Another Slide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
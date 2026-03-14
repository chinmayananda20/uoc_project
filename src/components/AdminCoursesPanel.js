import React, { useEffect, useMemo, useState } from "react";
import { getAllCoursesAdmin } from "../api/admin.api";
import { useAuth } from "../auth/AuthContext";
import { adminGetUsers } from "../api/adminUsers.api";
import { MdCreateNewFolder } from "react-icons/md";
import { FaArrowCircleRight } from "react-icons/fa";
import { adminDeleteCourse } from "../api/admin.api";
import { HiOutlineTrash } from "react-icons/hi2";
import { HiOutlinePlayCircle } from "react-icons/hi2";
import AdminCourseBuilder from "./AdminCourseBuilder";
import { useCallback } from "react";
import {
  HiOutlineBookOpen,
  HiOutlineUser,
  HiOutlineUsers,
} from "react-icons/hi2";
import { adminSetCoursePublished } from "../api/admin.api";
import AdminCourseCreateForm from "./AdminCourseCreateForm";
import { HiOutlineEyeSlash, HiOutlineEye } from "react-icons/hi2";

const AdminCoursesPanel = () => {
  const { userId } = useAuth();
  const [editingCourse, setEditingCourse] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "courseForm" | "manage"
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [err, setErr] = useState("");
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState(null);
  const [search, setSearch] = useState("");
  const handleDeleteDraft = async () => {
    if (!confirmDeleteCourse) return;

    setDeletingCourseId(confirmDeleteCourse._id);

    try {
      await adminDeleteCourse(confirmDeleteCourse._id);

      setCourses((prev) =>
        prev.filter((c) => c._id !== confirmDeleteCourse._id),
      );

      setConfirmDeleteCourse(null);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to delete course");
    } finally {
      setDeletingCourseId(null);
    }
  };
  const usersById = useMemo(() => {
    const map = new Map();
    for (const u of users || []) map.set(String(u._id), u);
    return map;
  }, [users]);
  const getUserNameById = (id) => usersById.get(String(id))?.name || "Unknown";

  const matchesCourse = useCallback(
  (course) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const title = String(course?.title || "").toLowerCase();
    const desc = String(course?.description || "").toLowerCase();
    const level = String(course?.level || "").toLowerCase();
    const tags = Array.isArray(course?.tags)
      ? course.tags.join(" ").toLowerCase()
      : "";

    const creatorName = String(
      usersById.get(String(course?.createdBy))?.name || ""
    ).toLowerCase();

    return (
      title.includes(q) ||
      desc.includes(q) ||
      level.includes(q) ||
      tags.includes(q) ||
      creatorName.includes(q)
    );
  },
  [search, usersById]
);
  useEffect(() => {
    let cancelled = false;

    const fetchCourses = async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getAllCoursesAdmin();
        const users = await adminGetUsers();
        setUsers(Array.isArray(users) ? users : []);
        if (!cancelled) setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load courses", e);
        if (!cancelled) setErr("Failed to load courses.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCourses();
    return () => {
      cancelled = true;
    };
  }, []);
  const applyCourseUpdate = (updatedCourse) => {
    if (!updatedCourse?._id) return;

    setCourses((prev) =>
      (prev || []).map((c) =>
        c._id === updatedCourse._id ? { ...c, ...updatedCourse } : c,
      ),
    );

    // keep manage screen in sync too
    setSelectedCourse((prev) =>
      prev?._id === updatedCourse._id ? { ...prev, ...updatedCourse } : prev,
    );

    // also keep editingCourse in sync if you use it
    setEditingCourse((prev) =>
      prev?._id === updatedCourse._id ? { ...prev, ...updatedCourse } : prev,
    );
  };
  


  const stats = useMemo(() => {
    const all = courses || [];
    let total = 0,
      pub = 0,
      draft = 0;

    let myTotal = 0,
      myPub = 0,
      myDraft = 0;

    let otherTotal = 0,
      otherPub = 0,
      otherDraft = 0;

    for (const c of all) {
      total++;
      const isPublished = !!c?.published;
      if (isPublished) pub++;
      else draft++;

      const createdBy = String(c?.createdBy || "");
      const me = String(userId || "");
      const isMine = me && createdBy && createdBy === me;

      if (isMine) {
        myTotal++;
        if (isPublished) myPub++;
        else myDraft++;
      } else {
        otherTotal++;
        if (isPublished) otherPub++;
        else otherDraft++;
      }
    }

    return {
      total,
      pub,
      draft,
      myTotal,
      myPub,
      myDraft,
      otherTotal,
      otherPub,
      otherDraft,
    };
  }, [courses, userId]);
  const myPublished = useMemo(() => {
    const me = String(userId || "");
    return (courses || [])
      .filter((c) => String(c?.createdBy || "") === me && !!c?.published)
      .filter(matchesCourse);
  }, [courses, userId, matchesCourse]);

  const myDrafts = useMemo(() => {
    const me = String(userId || "");
    return (courses || [])
      .filter((c) => String(c?.createdBy || "") === me && !c?.published)
      .filter(matchesCourse);
  }, [courses, userId, matchesCourse]);
  const addCourseToList = (newCourse) => {
    setCourses((prev) => [newCourse, ...(prev || [])]);
  };

  const othersPublished = useMemo(() => {
    const me = String(userId || "");
    return (courses || [])
      .filter((c) => String(c?.createdBy || "") !== me && !!c?.published)
      .filter(matchesCourse);
  }, [courses, userId, matchesCourse]);

  const Card = ({
    title,
    subtitle,
    icon: Icon,
    gradient,
    total,
    published,
    draft,
  }) => (
    <div
      className={[
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-md",
        "transition hover:scale-[1.02] hover:shadow-lg",
        `bg-gradient-to-br ${gradient}`,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm opacity-85">{title}</p>
          <h2 className="mt-2 text-4xl font-extrabold tracking-tight">
            {loading ? (
              <span className="inline-block h-10 w-24 rounded-xl bg-white/20 animate-pulse" />
            ) : (
              total
            )}
          </h2>
          <p className="mt-2 text-sm opacity-80">{subtitle}</p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/15 p-3">
          <Icon className="h-8 w-8" />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs opacity-80">Published</p>
          <p className="mt-1 text-lg font-bold">
            {loading ? (
              <span className="inline-block h-6 w-12 rounded bg-white/20 animate-pulse" />
            ) : (
              published
            )}
          </p>
        </div>
        <div className="rounded-xl bg-white/10 p-3">
          <p className="text-xs opacity-80">Draft</p>
          <p className="mt-1 text-lg font-bold">
            {loading ? (
              <span className="inline-block h-6 w-12 rounded bg-white/20 animate-pulse" />
            ) : (
              draft
            )}
          </p>
        </div>
      </div>
    </div>
  );
  const [busyCourseId, setBusyCourseId] = useState(null);

  const handleEdit = (course) => {
    setEditingCourse(course);
    setView("courseForm");
  };
  const handleManage = (course) => {
    setSelectedCourse(course);
    setEditingCourse(course); // so Details tab can edit same course
    setView("manage");
  };
  const handlePublishToggle = async (courseId, nextPublished) => {
    setErr("");
    setBusyCourseId(courseId);
    try {
      await adminSetCoursePublished(courseId, nextPublished);
      setCourses((prev) =>
        prev.map((c) =>
          c._id === courseId ? { ...c, published: nextPublished } : c,
        ),
      );
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to update publish status");
    } finally {
      setBusyCourseId(null);
    }
  };
  const badgeClasses = (published) =>
    published
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  const stripClasses = (published) =>
    published
      ? "bg-gradient-to-r from-emerald-500 to-emerald-700"
      : "bg-gradient-to-r from-amber-400 to-amber-600";

  const iconBoxClasses = (published) =>
    published
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  const CourseCard = ({
    course,
    variant, // "mine" | "other"
    onEdit,
    onManage,
    onTogglePublish,
    busy,
  }) => {
    const tags = Array.isArray(course?.tags) ? course.tags : [];
    const isPublished = Boolean(course?.published);

    const createdAtLabel = useMemo(() => {
      const d = course?.createdAt ? new Date(course.createdAt) : null;
      if (!d || Number.isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }, [course?.createdAt]);

    const updatedAtLabel = useMemo(() => {
      const d = course?.updatedAt ? new Date(course.updatedAt) : null;
      if (!d || Number.isNaN(d.getTime())) return "—";
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    }, [course?.updatedAt]);

    const ownerLabel =
      variant === "other"
        ? `Created by ${getUserNameById(course?.createdBy)}`
        : `Level: ${course?.level || "—"}`;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
        {/* Status strip */}
        <div
          className={[
            "h-1.5 w-full rounded-t-2xl",
            stripClasses(isPublished),
          ].join(" ")}
        />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-lg font-extrabold text-slate-900">
                  {course?.title || "Untitled course"}
                </h4>

                <span
                  className={[
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                    badgeClasses(isPublished),
                  ].join(" ")}
                >
                  {isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {course?.description || "No description"}
              </p>
            </div>

            <div
              className={[
                "shrink-0 rounded-2xl border p-3",
                iconBoxClasses(isPublished),
              ].join(" ")}
              title={isPublished ? "Published" : "Draft"}
            >
              {isPublished ? (
                <HiOutlineEye className="h-6 w-6" />
              ) : (
                <HiOutlineEyeSlash className="h-6 w-6" />
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{ownerLabel}</span>
            <span className="text-slate-300">•</span>

            <span>
              Created{" "}
              <span className="font-semibold text-slate-700">
                {createdAtLabel}
              </span>
            </span>

            <span className="text-slate-300">•</span>

            <span>
              Updated{" "}
              <span className="font-semibold text-slate-700">
                {updatedAtLabel}
              </span>
            </span>
          </div>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.length ? (
              <>
                {tags.slice(0, 5).map((t, idx) => (
                  <span
                    key={`${t}-${idx}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    title={t}
                  >
                    {t}
                  </span>
                ))}
                {tags.length > 5 ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    +{tags.length - 5}
                  </span>
                ) : null}
              </>
            ) : (
              <span className="text-xs text-slate-400">No tags</span>
            )}
          </div>

          {/* Actions: stable layout */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            {variant === "other" ? (
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">Read-only</div>
                <button
                  type="button"
                  onClick={() => console.log("Preview course:", course)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <HiOutlinePlayCircle className="h-5 w-5" />
                  Preview
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {/* Preview */}
                <button
                  type="button"
                  onClick={() => console.log("Preview course:", course)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <HiOutlinePlayCircle className="h-5 w-5" />
                  Preview
                </button>

                {/* Manage */}
                <button
                  type="button"
                  onClick={() => onManage?.(course)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <HiOutlineBookOpen className="h-5 w-5" />
                  Manage
                </button>

                {/* Edit */}

                {/* Publish toggle */}
                <button
                  type="button"
                  onClick={() => onTogglePublish?.(course._id, !isPublished)}
                  disabled={busy}
                  className={[
                    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white disabled:opacity-60",
                    isPublished
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-emerald-600 hover:bg-emerald-700",
                  ].join(" ")}
                >
                  {isPublished ? (
                    <HiOutlineEyeSlash className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                  {busy ? "Updating..." : isPublished ? "Unpublish" : "Publish"}
                </button>

                {/* Delete draft - full width on small rows */}
                {!isPublished && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteCourse(course)}
                    disabled={deletingCourseId === course._id}
                    className="col-span-2 sm:col-span-4 inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    title="Delete draft"
                  >
                    <HiOutlineTrash className="h-5 w-5" />
                    {deletingCourseId === course._id
                      ? "Deleting..."
                      : "Delete Draft"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {view === "list" ? (
        <div className="w-full">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Courses Overview
              </h2>
              <p className="mt-1 text-slate-600">
                Summary of all courses and who created them.
              </p>
            </div>
          </div>
          <div className="mt-6 w-full sm:max-w-md">
  <label className="text-sm font-semibold text-slate-700">
    Search courses
  </label>

  <div className="relative mt-2">
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search by title, description, tags, level, or creator..."
      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
    />

    {search && (
      <button
        type="button"
        onClick={() => setSearch("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
        aria-label="Clear search"
      >
        ✕
      </button>
    )}
  </div>
</div>
          {err ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          ) : null}

          {!userId ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
              Could not determine your user ID. “My courses” vs “Other admins”
              split may be inaccurate.
            </div>
          ) : null}

          {/* 3x1 on desktop, stacks on mobile */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card
              title="Total Courses"
              subtitle="All Courses In the System"
              icon={HiOutlineBookOpen}
              gradient="from-slate-700 to-slate-900"
              total={stats.total}
              published={stats.pub}
              draft={stats.draft}
            />

            <Card
              title="Courses Created By You"
              subtitle="Courses Created By You"
              icon={HiOutlineUser}
              gradient="from-indigo-600 to-indigo-800"
              total={stats.myTotal}
              published={stats.myPub}
              draft={stats.myDraft}
            />

            <Card
              title="Courses By Other Admins"
              subtitle="Courses Created By Other Admins"
              icon={HiOutlineUsers}
              gradient="from-emerald-600 to-emerald-800"
              total={stats.otherTotal}
              published={stats.otherPub}
              draft={stats.otherDraft}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-10">
            Course Actions
          </h1>
          <div
            className="rounded-xl mt-7 mb-14 flex items-center justify-around bg-blue-600 text-white w-[400px] coursor-pointer transition
    hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300
    active:translate-y-0 active:shadow-sm
    focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            onClick={() => {
              setEditingCourse(null);
              setView("courseForm");
            }}
          >
            <MdCreateNewFolder className="text-5xl m-5" />
            <div>
              <span className="text-lg font-semibold">Create a New Course</span>
              <p className="mt-0.5 text-sm text-white ">
                Add title, description, tags and publish later
              </p>
            </div>

            <FaArrowCircleRight className="text-2xl m-5 " />
          </div>

          <div className="mt-10 space-y-10">
            {/* 1) My Published */}
            <section>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Your Published Courses
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Edit or unpublish your live courses.
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {myPublished.length} item(s)
                </div>
              </div>

              {myPublished.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                  No published courses found.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {myPublished.map((c) => (
                    <CourseCard
                      key={c._id}
                      course={c}
                      variant="mine"
                      onManage={handleManage}
                      onEdit={handleEdit}
                      onTogglePublish={handlePublishToggle}
                      busy={busyCourseId === c._id}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 2) My Drafts */}
            <section>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Your Draft Courses
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Finish and publish your drafts.
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {myDrafts.length} item(s)
                </div>
              </div>

              {myDrafts.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                  No draft courses found.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {myDrafts.map((c) => (
                    <CourseCard
                      key={c._id}
                      course={c}
                      variant="mine"
                      onEdit={handleEdit}
                      onManage={handleManage}
                      onTogglePublish={handlePublishToggle}
                      busy={busyCourseId === c._id}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* 3) Others Published */}
            <section>
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">
                    Published Courses by Other Admins
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Browse courses published by others.
                  </p>
                </div>
                <div className="text-sm text-slate-500">
                  {othersPublished.length} item(s)
                </div>
              </div>

              {othersPublished.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-600">
                  No published courses from other admins found.
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {othersPublished.map((c) => (
                    <CourseCard
                      key={c._id}
                      course={c}
                      variant="other"
                      onEdit={handleEdit}
                      onTogglePublish={handlePublishToggle}
                      busy={false}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
          {confirmDeleteCourse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Overlay */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setConfirmDeleteCourse(null)}
              />

              {/* Modal */}
              <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-fadeIn">
                <h3 className="text-lg font-bold text-slate-900">
                  Delete Draft Course?
                </h3>

                <p className="mt-3 text-sm text-slate-600">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-slate-800">
                    {confirmDeleteCourse.title}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setConfirmDeleteCourse(null)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteDraft}
                    disabled={deletingCourseId === confirmDeleteCourse._id}
                    className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
                  >
                    {deletingCourseId === confirmDeleteCourse._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : view === "courseForm" ? (
        <AdminCourseCreateForm
          setFlag={(v) => {
            // keep prop name for now so you don't refactor form yet
            if (v === false) {
              setView("list");
              setEditingCourse(null);
            }
          }}
          addCourseToList={addCourseToList}
          updateCoursePublished={(id, published) => {
            setCourses((prev) =>
              prev.map((c) => (c._id === id ? { ...c, published } : c)),
            );
          }}
          editingCourse={editingCourse}
          onCourseUpdated={(updatedCourse) => {
            setCourses((prev) =>
              prev.map((c) =>
                c._id === updatedCourse._id ? { ...c, ...updatedCourse } : c,
              ),
            );

            setEditingCourse((prev) =>
              prev?._id === updatedCourse._id
                ? { ...prev, ...updatedCourse }
                : prev,
            );
          }}
        />
      ) : (
        <AdminCourseBuilder
          course={selectedCourse}
          onBack={() => {
            setView("list");
            setSelectedCourse(null);
            setEditingCourse(null);
          }}
          onCourseUpdated={applyCourseUpdate}
        />
      )}
    </>
  );
};

export default AdminCoursesPanel;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminUsersPanel from "../components/AdminUsersPanel";
import CreateAdminPanel from "../components/createAdminPanel";
import {
  adminCreateCourse,
  adminDeleteCourse,
  adminListCourses,
  adminSetCoursePublished,
  adminUpdateCourse,
} from "../api/admin.api";
import { useAuth } from "../auth/AuthContext";

function parseTags(input) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function tagsToString(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const { logout, role } = useAuth();

  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Edit mode state
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("beginner");
  const [tagsInput, setTagsInput] = useState("");

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLevel("beginner");
    setTagsInput("");
  };

  const load = async () => {
    setErr("");
    try {
      const data = await adminListCourses(); // GET /courses/admin
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load courses");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

  const startEdit = (course) => {
    const id = course._id || course.id;
    setEditingId(id);
    setTitle(course.title || "");
    setDescription(course.description || "");
    setLevel(course.level || "beginner");
    setTagsInput(tagsToString(course.tags));
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const payload = {
      title: title.trim(),
      description: description.trim(),
      level,
      tags: parseTags(tagsInput),
    };

    // Create requires title/description/level (your backend enforces)
    if (!payload.title || !payload.description || !payload.level) {
      setErr("title, description, and level are required");
      return;
    }

    setBusy(true);
    try {
      if (isEditing) {
        await adminUpdateCourse(editingId, payload); // PATCH /courses/:id
      } else {
        await adminCreateCourse(payload); // POST /courses
      }

      resetForm();
      await load();
    } catch (e) {
      setErr(e?.response?.data?.message || (isEditing ? "Failed to update course" : "Failed to create course"));
    } finally {
      setBusy(false);
    }
  };

  const setPublished = async (id, published) => {
    setErr("");
    setBusy(true);
    try {
      await adminSetCoursePublished(id, published); // PATCH /courses/:id/publish
      setCourses((prev) =>
        prev.map((c) => ((c._id || c.id) === id ? { ...c, published } : c))
      );
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to update publish status");
    } finally {
      setBusy(false);
    }
  };

  const removeCourse = async (id) => {
    setErr("");
    const ok = window.confirm("Delete this course? This cannot be undone.");
    if (!ok) return;

    setBusy(true);
    try {
      await adminDeleteCourse(id);
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== id));
      if (editingId === id) resetForm();
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to delete course");
    } finally {
      setBusy(false);
    }
  };

  return (
    
    <div style={{ maxWidth: 980, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Role: {role}</span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
          <h3 style={{ marginTop: 0 }}>{isEditing ? "Edit Course" : "Create Course"}</h3>
          {isEditing && (
            <button type="button" onClick={resetForm} disabled={busy}>
              Cancel edit
            </button>
          )}
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div>
              <label>Title</label>
              <input
                style={{ width: "100%", padding: 8 }}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Description</label>
              <textarea
                style={{ width: "100%", padding: 8, minHeight: 90 }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Level</label>
              <select
                style={{ width: "100%", padding: 8 }}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
              >
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </div>

            <div>
              <label>Tags (comma separated)</label>
              <input
                style={{ width: "100%", padding: 8 }}
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. ai, security, web"
              />
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                Stored as array: [{parseTags(tagsInput).map((t) => `"${t}"`).join(", ")}]
              </div>
            </div>

            <button disabled={busy} type="submit">
              {busy ? "Working..." : isEditing ? "Save changes" : "Create"}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>All Courses (Admin)</h3>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          {courses.length === 0 ? (
            <p>No courses found.</p>
          ) : (
            courses.map((c) => {
              const id = c._id || c.id;
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{c.title}</div>
                    <div style={{ fontSize: 13, opacity: 0.85 }}>{c.description}</div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
                      Level: {c.level} • Status: {c.published ? "Published" : "Draft"}
                    </div>
                    {Array.isArray(c.tags) && c.tags.length > 0 && (
                      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
                        Tags: {c.tags.join(", ")}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button disabled={busy} onClick={() => startEdit(c)}>
                      Edit
                    </button>

                    {c.published ? (
                      <button disabled={busy} onClick={() => setPublished(id, false)}>
                        Unpublish
                      </button>
                    ) : (
                      <button disabled={busy} onClick={() => setPublished(id, true)}>
                        Publish
                      </button>
                    )}

                    <button disabled={busy} onClick={() => removeCourse(id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <AdminUsersPanel />
      <CreateAdminPanel />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { adminGetUsers } from "../api/adminUsers.api";
import { adminListCourses } from "../api/admin.api"; // adjust if needed
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { role } = useAuth();
  const nav = useNavigate();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [err, setErr] = useState("");

useEffect(() => {
  const load = async () => {
    setErr("");

    try {
      const courseData = await adminListCourses(); // /courses (published)
      setCourses(courseData || []);
    } catch (e) {
      setErr(e?.response?.data?.message || "Failed to load courses");
    }

    if (role === "admin") {
      try {
        const userData = await adminGetUsers();
        setUsers(userData || []);
      } catch (e) {
        // don't block the dashboard for this
      }
    }
  };

  load();
}, [role]);


  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>Dashboard</h2>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {/* Summary Section */}
      <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
        <Card title="Published Courses" value={courses.length} />
        {role === "admin" && (
          <Card title="Total Users" value={users.length} />
        )}
        <Card title="Your Role" value={role.toUpperCase()} />
      </div>

      {/* Courses Preview */}
      <section style={{ marginBottom: 40 }}>
        <h3>Courses</h3>
        {courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          courses.map((c) => (
            <div
              key={c._id}
              style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 6,
                marginBottom: 10,
              }}
            >
              <strong>{c.title}</strong>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                {c.description}
              </div>
            </div>
          ))
        )}
      </section>

      {/* Admin Shortcut */}
      {role === "admin" && (
        <section>
          <h3>Admin Panel</h3>
          <button onClick={() => nav("/admin")}>
            Go to Admin Management
          </button>
        </section>
      )}
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.8 }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

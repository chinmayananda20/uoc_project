import { useEffect, useMemo, useState } from "react";
import { adminGetUsers, adminSetUserRole } from "../api/adminUsers.api";

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setErr("");
    try {
      const data = await adminGetUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load users");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter((u) =>
      [u.name, u.email, u.student_number, u.role].some((v) =>
        String(v || "").toLowerCase().includes(s)
      )
    );
  }, [q, users]);

  const changeRole = async (userId, role) => {
    setErr("");
    setBusyId(userId);
    try {
      await adminSetUserRole(userId, role);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role } : u)));
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Manage Users</h3>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <input
        style={{ width: "100%", padding: 8, marginBottom: 12 }}
        placeholder="Search name/email/student number/role..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p>No users found.</p>
      ) : (
        filtered.map((u) => (
          <div
            key={u._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{u.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {u.email} {u.student_number ? `• ${u.student_number}` : ""} • role: {u.role}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select
                value={u.role}
                onChange={(e) => changeRole(u._id, e.target.value)}
                disabled={busyId === u._id}
                style={{ padding: 6 }}
              >
                <option value="student">student</option>
<option value="staff">staff</option>
<option value="admin">admin</option>

              </select>

              {busyId === u._id && <span style={{ fontSize: 12 }}>Saving...</span>}
            </div>
          </div>
        ))
      )}

      <p style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>
        Note: if you promote someone to admin, they must log out + log in again to get a new token containing role=admin.
      </p>
    </div>
  );
}

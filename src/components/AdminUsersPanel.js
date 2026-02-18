import { useEffect, useMemo, useState } from "react";
import { adminGetUsers, adminSetUserRole } from "../api/adminUsers.api";

export default function AdminUsersPanel() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
const [pendingChange, setPendingChange] = useState(null);


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

  return users
    // ✅ only admin & staff
    .filter((u) => u.role === "admin" || u.role === "staff")
    // ✅ then apply search
    .filter((u) =>
      !s
        ? true
        : [u.name, u.email, u.student_number, u.role].some((v) =>
            String(v || "").toLowerCase().includes(s)
          )
    );
}, [q, users]);
  const confirmRoleChange = async () => {
  if (!pendingChange) return;

  const { userId, newRole } = pendingChange;

  setConfirmOpen(false);
  await changeRole(userId, newRole);
  setPendingChange(null);
};


  const changeRole = async (userId, role) => {
    setErr("");
    setBusyId(userId);
    try {
      await adminSetUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role } : u)),
      );
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to update role");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-8 bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h3>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <input
        className="w-full mb-6 rounded-xl border border-gray-300 px-4 py-2 
               focus:outline-none focus:ring-2 focus:ring-indigo-500 
               focus:border-indigo-500 transition"
        placeholder="Search name, email, student number, role..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No users found.</p>
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
                {u.email} {u.student_number ? `• ${u.student_number}` : ""} •
                role: {u.role}
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

              {busyId === u._id && (
                <span style={{ fontSize: 12 }}>Saving...</span>
              )}
            </div>
          </div>
        ))
      )} */}
       {filtered.length === 0 ? (
    <p className="text-gray-500 text-sm">No users found.</p>
  ) : (
    <div className="overflow-x-auto max-h-[400px] overflow-y-auto  rounded-xl">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-gray-200 bg-gray-600 text-white text-sm uppercase">
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Change Role</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {filtered.map((u) => (
            <tr key={u._id} className="hover:bg-gray-50 transition">
              <td className="p-3 font-medium text-gray-800">
                {u.name}
              </td>

              <td className="p-3 text-gray-600 text-sm">
                {u.email}
              </td>

              {/* Role Badge */}
              <td className="p-3">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full
                    ${
                      u.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : u.role === "staff"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                >
                  {u.role}
                </span>
              </td>

              {/* Dropdown */}
              <td className="py-3">
                <div className="flex items-center gap-3">
                  <select
                    value={u.role}
                    onChange={(e) => {
  const newRole = e.target.value;
  if (newRole !== u.role) {
    setPendingChange({
      userId: u._id,
      name: u.name,
      newRole,
    });
    setConfirmOpen(true);
  }
}}

                    disabled={busyId === u._id}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>

                  {busyId === u._id && (
                    <span className="text-xs text-gray-500">
                      Saving...
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>)}

      <p style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>
        Note: if you promote someone to admin, they must log out + log in again
        to get a new token containing role=admin.
      </p>

      {confirmOpen && pendingChange && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 animate-fadeIn">
      <h4 className="text-lg font-semibold text-gray-800">
        Confirm Role Change
      </h4>

      <p className="mt-3 text-sm text-gray-600">
        Are you sure you want to change{" "}
        <span className="font-semibold text-gray-900">
          {pendingChange.name}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-indigo-600">
          {pendingChange.newRole}?
          {pendingChange.newRole === "admin" && (
            <div className="my-1 text-xs text-red-500">Note: {pendingChange.name} can now access admin features after logging out and back in.</div>
          )}
          {pendingChange.newRole === "staff" && (
            <div className="my-1 text-xs text-red-500">Note: {pendingChange.name} will not be able to access staff features after logging out and back in.</div>
          )}
        </span>
        
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            setConfirmOpen(false);
            setPendingChange(null);
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
        >
          Cancel
        </button>

        <button
          onClick={confirmRoleChange}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Yes, Change Role
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

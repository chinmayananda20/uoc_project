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
    <div className="mt-8 bg-white dark:bg-slate-900 shadow-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-8 transition-colors">
      <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight">Manage Admins</h3>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <input
        className="w-full mb-8 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-slate-900 dark:text-white
               focus:outline-none focus:ring-2 focus:ring-blue-500/40 
               focus:border-blue-500 transition shadow-sm font-medium"
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
    <>
      {/* Mobile Card Layout */}
      <div className="block md:hidden space-y-4 pr-2">
        {filtered.map((u) => (
          <div key={`mob-${u._id}`} className="bg-white dark:bg-slate-800 border text-sm border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative transition-colors font-medium">
            <div className="flex justify-between items-start mb-2">
              <div className="font-black text-slate-900 dark:text-white">{u.name}</div>
              <span
                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full
                  ${
                    u.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : u.role === "staff"
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  }`}
              >
                {u.role}
              </span>
            </div>
            <div className="text-gray-500 dark:text-slate-400 text-xs mb-4 truncate font-medium">{u.email}</div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
               <span className="text-xs font-medium text-gray-500">Change Role:</span>
               <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      if (newRole !== u.role) {
                        setPendingChange({ userId: u._id, name: u.name, newRole });
                        setConfirmOpen(true);
                      }
                    }}
                    disabled={busyId === u._id}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                  >
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                  {busyId === u._id && <span className="text-[10px] text-slate-400">Saving...</span>}
               </div>
            </div>
          </div>
        ))}
      </div>

    {/* Desktop Table Layout */}
    <div className="hidden md:block overflow-hidden border border-slate-100 dark:border-slate-800 rounded-2xl transition-colors">
      <table className="w-full text-left border-collapse min-w-[600px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
            <th className="p-4">Admin</th>
            <th className="p-4">Information</th>
            <th className="p-4">Role</th>
            <th className="p-4">Manage</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.map((u) => (
            <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="p-4">
                <div className="font-black text-slate-900 dark:text-white">{u.name}</div>
              </td>

              <td className="p-4">
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{u.email}</div>
              </td>

              {/* Role Badge */}
              <td className="p-4">
                <span
                  className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full
                    ${
                      u.role === "admin"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                        : u.role === "staff"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
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
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-sm
                               focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white font-medium"
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
      </div>
    </>
  )}

      <p style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>
        Note: if you promote someone to admin, they must log out + log in again
        to get a new token containing role=admin.
      </p>

      {confirmOpen && pendingChange && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all p-4">
    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
      <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
        Confirm Change
      </h4>

      <div className="mt-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
        <p>
          Are you sure you want to change the access level for{" "}
          <span className="font-black text-slate-900 dark:text-white underline decoration-blue-500/30">
            {pendingChange.name}
          </span> to{" "}
          <span className="font-semibold text-indigo-600">
            {pendingChange.newRole}
          </span>?
        </p>
        {pendingChange.newRole === "admin" && (
          <div className="my-1 text-xs text-red-500 mt-2">Note: {pendingChange.name} can now access admin features after logging out and back in.</div>
        )}
        {pendingChange.newRole === "staff" && (
          <div className="my-1 text-xs text-red-500 mt-2">Note: {pendingChange.name} will not be able to access staff features after logging out and back in.</div>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            setConfirmOpen(false);
            setPendingChange(null);
          }}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-bold text-sm"
        >
          Cancel
        </button>
 
        <button
          onClick={confirmRoleChange}
          className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-sm shadow-lg shadow-blue-500/20 active:scale-95"
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

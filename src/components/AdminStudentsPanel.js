import { useEffect, useMemo, useState } from "react";
import { adminGetUsers, adminToggleUserBlock } from "../api/adminUsers.api";

export default function AdminStudentsPanel() {
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
      // ✅ only students
      .filter((u) => u.role === "student")
      // ✅ apply search
      .filter((u) =>
        !s
          ? true
          : [u.name, u.email, u.student_number].some((v) =>
              String(v || "").toLowerCase().includes(s)
            )
      );
  }, [q, users]);

  const confirmBlockToggle = async () => {
    if (!pendingChange) return;

    const { userId, newBlockedStatus } = pendingChange;

    setConfirmOpen(false);
    await toggleBlock(userId, newBlockedStatus);
    setPendingChange(null);
  };

  const toggleBlock = async (userId, isBlocked) => {
    setErr("");
    setBusyId(userId);
    try {
      await adminToggleUserBlock(userId, isBlocked);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked } : u))
      );
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to update block status");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mt-8 bg-white dark:bg-slate-900 shadow-lg rounded-3xl border border-gray-200 dark:border-slate-800 p-8 transition-colors">
      <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 uppercase tracking-tight">Manage Students</h3>

      {err && <p style={{ color: "crimson", marginBottom: 10 }}>{err}</p>}

      <input
        className="w-full mb-8 rounded-2xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-slate-900 dark:text-white
               focus:outline-none focus:ring-2 focus:ring-indigo-500 
               focus:border-indigo-500 transition shadow-sm"
        placeholder="Search name, email, student number..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No students found.</p>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-4 pr-2">
            {filtered.map((u) => (
              <div key={`mob-${u._id}`} className="bg-white dark:bg-slate-800 border text-sm border-gray-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm relative transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-black text-gray-900 dark:text-white">{u.name}</div>
                  <span
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full
                      ${
                        u.isBlocked
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }`}
                  >
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </div>
                <div className="text-gray-500 dark:text-slate-400 text-xs mb-1 truncate font-medium">{u.email}</div>
                <div className="text-gray-400 dark:text-slate-500 text-[10px] mb-4 truncate font-bold uppercase tracking-wide">ID: {u.student_number || "N/A"}</div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                   <span className="text-xs font-medium text-gray-500">Access:</span>
                   <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setPendingChange({ userId: u._id, name: u.name, newBlockedStatus: !u.isBlocked });
                          setConfirmOpen(true);
                        }}
                        disabled={busyId === u._id}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold focus:outline-none transition ${
                          u.isBlocked 
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-red-300 text-red-700 hover:bg-red-50"
                        }`}
                      >
                        {u.isBlocked ? "Unblock Student" : "Block Student"}
                      </button>
                      {busyId === u._id && <span className="text-[10px] text-gray-400">Saving...</span>}
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-hidden border border-gray-100 dark:border-slate-800 rounded-2xl transition-colors">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                  <th className="p-4">Student</th>
                  <th className="p-4">Information</th>
                  <th className="p-4">Student Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-slate-900 dark:text-white">{u.name}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{u.email}</div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-400 dark:text-slate-500 text-xs font-bold font-mono tracking-tight">{u.student_number || "-"}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full
                          ${
                            u.isBlocked
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          }`}
                      >
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setPendingChange({
                              userId: u._id,
                              name: u.name,
                              newBlockedStatus: !u.isBlocked,
                            });
                            setConfirmOpen(true);
                          }}
                          disabled={busyId === u._id}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition
                                    focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                            u.isBlocked 
                            ? "border-green-300 text-green-700 hover:bg-green-50"
                            : "border-red-300 text-red-700 hover:bg-red-50"
                          }`}
                        >
                          {u.isBlocked ? "Unblock Access" : "Block Access"}
                        </button>

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

      {confirmOpen && pendingChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-all p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
            <h4 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              Action Required
            </h4>

            <p className="mt-4 text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              Are you sure you want to {pendingChange.newBlockedStatus ? "restrict" : "restore"} access for{" "}
              <span className="font-black text-slate-900 dark:text-white underline decoration-blue-500/30">
                {pendingChange.name}
              </span>?
            </p>
            {pendingChange.newBlockedStatus ? (
              <div className="my-1 text-xs text-red-500 mt-2">Note: This student will be immediately prevented from logging into the platform until unblocked.</div>
            ) : (
              <div className="my-1 text-xs text-green-600 mt-2">Note: This student will have their login access restored.</div>
            )}

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
                onClick={confirmBlockToggle}
                className={`px-4 py-2 rounded-lg text-white transition ${
                  pendingChange.newBlockedStatus ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Yes, {pendingChange.newBlockedStatus ? "Block Student" : "Unblock Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

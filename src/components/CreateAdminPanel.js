import { useState } from "react";
import { adminCreateAdminApi } from "../api/adminCreateAdmin.api";
import illustration from "../assets/addadmin.png";
function CreateAdminPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const data = await adminCreateAdminApi({ name, email });
      setMsg(data?.message || "Admin created and email sent.");
      setName("");
      setEmail("");
    } catch (error) {
      setErr(error?.response?.data?.error || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-around items-center h-full w-full">
      <img
        src={illustration}
        alt="Add Admin Illustration"
        className="w-1/2 max-w-md hidden md:block"
      />
      <div className="w-full max-w-lg md:max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none transition-colors">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">
          Create Admin
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
          An email with a password reset link will be sent to the new admin.
        </p>
        {err && <p className="text-red-500">{err}</p>}
        {msg && <p className="text-green-500">{msg}</p>}

        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-4 w-full max-w-sm mx-auto p-2">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm font-medium"
                placeholder="Enter admin name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-sm font-medium"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-2xl py-4 font-black text-white bg-blue-600 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20 disabled:opacity-70 uppercase tracking-wide"
            >
              {loading ? "Creating..." : "Create Admin Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAdminPanel;

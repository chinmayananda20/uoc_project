import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../api/password.api";
import { HiEnvelope, HiArrowLeft, HiCpuChip } from "react-icons/hi2";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // success info
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setStatus("");
    setLoading(true);

    try {
      const data = await forgotPasswordApi(email);
      setStatus(data?.message || "If the account exists, a password reset link has been sent.");
    } catch (error) {
      setErr(error?.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Left pane: Brand Background (Consistent with Login/Signup) */}
      <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-12 lg:flex relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-blue-400/20 blur-3xl mix-blend-overlay"></div>

        <div className="relative z-10 text-white max-w-lg mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Forgot <br /> Password?
          </h1>
          <p className="text-lg text-blue-100 mb-10 leading-relaxed">
            No worries! Just enter your email and we'll send you a secure link to reset your credentials.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <div className="h-px w-16 bg-white/40"></div>
            <span className="text-sm font-semibold tracking-wider uppercase">Security & Recovery</span>
          </div>
        </div>
      </div>

      {/* Right pane: Form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-slate-50 dark:bg-slate-900/50">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors">
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-2">
              <HiCpuChip className="text-blue-600 w-8 h-8" />
              <h1 className="text-2xl font-black text-blue-600 tracking-tighter uppercase">Smart Path</h1>
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recover Access</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
            Enter your email to receive recovery instructions.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <HiEnvelope className="w-5 h-5" />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-4 py-4 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {err && (
              <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-600 dark:text-red-400 font-bold border-l-4 border-l-red-600">
                {err}
              </div>
            )}
            {status && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 p-4 text-sm text-emerald-700 dark:text-emerald-400 font-bold border-l-4 border-l-emerald-600">
                {status}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-2xl bg-blue-600 py-4 text-lg font-black text-white transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-blue-500/20 focus:outline-none focus:ring-4 focus:ring-blue-600/30 disabled:opacity-70 disabled:active:scale-100 uppercase tracking-wide"
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all border-b-2 border-transparent hover:border-blue-600">
              <HiArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

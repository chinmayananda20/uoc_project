import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/password.api";
import { HiLockClosed, HiArrowLeft, HiCheckCircle, HiCpuChip } from "react-icons/hi2";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const nav = useNavigate();
  const q = useQuery();

  const emailFromLink = q.get("email") || "";
  const tokenFromLink = q.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setStatus("");

    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    if (!emailFromLink || !tokenFromLink) {
      setErr("Missing security credentials. Please use the link sent to your email.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPasswordApi({ email: emailFromLink, token: tokenFromLink, newPassword });
      setStatus(data?.message || "Password reset successful! Redirecting...");
      
      // Keep status visible for a moment before redirect
      setTimeout(() => {
        nav("/login", { replace: true });
      }, 2000);
    } catch (error) {
      setErr(error?.response?.data?.error || "Reset failed. Link may be expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Left pane: Security Branding */}
      <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-indigo-800 to-purple-900 p-12 lg:flex relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] h-96 w-96 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-[0%] left-[-10%] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"></div>

        <div className="relative z-10 text-white max-w-lg mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Reset Your <br /> Password
          </h1>
          <p className="text-lg text-indigo-100 mb-10 leading-relaxed font-medium">
            Strong passwords keep your educational progress secure. Enter your new credentials to regain access.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <div className="h-px w-12 bg-white/40"></div>
            <span className="text-sm font-bold tracking-widest uppercase">Safe & Secure</span>
          </div>
        </div>
      </div>

      {/* Right pane: Form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 min-h-screen">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors my-8">
          <div className="mb-10 lg:hidden">
             <div className="flex items-center gap-2">
              <HiCpuChip className="text-indigo-600 w-8 h-8" />
              <h1 className="text-2xl font-black text-indigo-600 tracking-tighter uppercase">Smart Path</h1>
            </div>
          </div>

          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Set New Password</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
            Please choose a secure password for your account.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {/* Hidden fields for security context - kept for the API but styled as read-only labels or hidden */}
            <div className="hidden">
               <input type="text" value={emailFromLink} readOnly tabIndex="-1" />
               <input type="text" value={tokenFromLink} readOnly tabIndex="-1" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <HiLockClosed className="w-5 h-5" />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-4 py-4 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 font-medium"
                  type="password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <HiLockClosed className="w-5 h-5" />
                </div>
                <input
                  className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-11 pr-4 py-4 text-slate-900 dark:text-white transition-all placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 font-medium"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 p-4 text-sm text-emerald-700 dark:text-emerald-400 font-bold border-l-4 border-l-emerald-600 animate-pulse">
                <div className="flex items-center gap-2">
                  <HiCheckCircle className="w-5 h-5" />
                  {status}
                </div>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-2xl bg-indigo-600 py-4 text-lg font-black text-white transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20 focus:outline-none focus:ring-4 focus:ring-indigo-600/30 disabled:opacity-70 disabled:active:scale-100 uppercase tracking-wide"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <HiArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

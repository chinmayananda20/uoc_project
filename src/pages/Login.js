import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/", { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.error || error?.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Left pane: Gradient & Branding (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-blue-600 to-indigo-900 p-12 lg:flex relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-10%] left-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-blue-400/20 blur-3xl mix-blend-overlay"></div>

        <div className="relative z-10 text-white max-w-lg mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Learn smarter, <br /> Not harder.
          </h1>
          <p className="text-lg text-blue-100 mb-10 leading-relaxed">
            Welcome to Smart Path, the AI-curated microcourse platform guiding your educational journey step-by-step.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <div className="h-px w-16 bg-white/40"></div>
            <span className="text-sm font-semibold tracking-wider uppercase">Admin & Student Portal</span>
          </div>
        </div>
      </div>

      {/* Right pane: Form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-slate-50 dark:bg-slate-900/50">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
          <div className="mb-10 lg:hidden">
            <h1 className="text-3xl font-extrabold text-blue-600">Smart Path</h1>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Welcome back</h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">Please enter your details to sign in.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email address</label>
              <input
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
                 <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                   Forgot password?
                 </Link>
              </div>
              <input
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </div>

            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium">
                {err}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-4 w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? "Signing in..." : "Sign in to account"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

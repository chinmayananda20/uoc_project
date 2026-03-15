import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api/auth.api";

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    student_number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await signupApi({
        name: form.name,
        student_number: form.student_number,
        email: form.email,
        password: form.password,
      });

      nav("/login", { replace: true });
    } catch (error) {
      setErr(
        error?.response?.data?.message ||
          "Signup failed. Try a different email or student number."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors">
      {/* Left pane: Gradient & Branding (Hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-12 lg:flex relative overflow-hidden">
        {/* Subtle decorative geometry */}
        <div className="absolute top-[-10%] right-[-10%] h-96 w-96 rounded-full bg-purple-500/20 blur-3xl mix-blend-overlay"></div>
        <div className="absolute bottom-[10%] left-[-20%] h-96 w-96 rounded-full bg-blue-400/10 blur-3xl mix-blend-overlay"></div>

        <div className="relative z-10 text-white max-w-lg mx-auto">
          <h1 className="text-5xl font-extrabold mb-6 leading-tight">
            Start your journey <br /> today.
          </h1>
          <p className="text-lg text-indigo-200 mb-10 leading-relaxed">
            Join thousands of students mastering complex topics through our structured, AI-curated curriculum.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <div className="h-px w-16 bg-white/40"></div>
            <span className="text-sm font-semibold tracking-wider uppercase">Create Your Profile</span>
          </div>
        </div>
      </div>

      {/* Right pane: Form */}
      <div className="flex w-full items-center justify-center p-6 sm:p-12 lg:w-1/2 bg-slate-50 dark:bg-slate-900/50 min-h-screen">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 my-8">
          <div className="mb-8 lg:hidden">
            <h1 className="text-3xl font-extrabold text-indigo-600">Smart Path</h1>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create account</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Join us to start learning.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                <input
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={set("name")}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Student No.</label>
                <input
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  placeholder="e.g. 12345678"
                  value={form.student_number}
                  onChange={set("student_number")}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
              <input
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                placeholder="you@university.edu"
                value={form.email}
                onChange={set("email")}
                type="email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
              <input
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                type="password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
              <input
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white transition-colors placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                type="password"
                required
              />
            </div>

            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 font-medium my-2">
                {err}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

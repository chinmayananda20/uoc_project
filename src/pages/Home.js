import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { HiSun, HiMoon, HiArrowRight, HiCpuChip, HiSparkles, HiAcademicCap, HiRocketLaunch } from "react-icons/hi2";

const FEATURES = [
  {
    title: "AI Curated Paths",
    desc: "Algorithmically optimized learning roadmaps tailored to your speed.",
    icon: <HiSparkles className="w-10 h-10 text-blue-500" />,
  },
  {
    title: "Micro-Course Focus",
    desc: "Learn complex topics in bite-sized, digestible components.",
    icon: <HiCpuChip className="w-10 h-10 text-indigo-500" />,
  },
  {
    title: "Active Assessment",
    desc: "Real-time quizzes and interactive feedback loops.",
    icon: <HiAcademicCap className="w-10 h-10 text-purple-500" />,
  },
  {
    title: "Rapid Mastery",
    desc: "Designed to help you reach competency 3x faster than traditional methods.",
    icon: <HiRocketLaunch className="w-10 h-10 text-pink-500" />,
  },
];

export default function Home() {
  const nav = useNavigate();
  const { token, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const canSeeDashboard = role === "admin" || role === "staff";



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HiCpuChip className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Smart Path</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform active:scale-95"
            >
              {theme === "light" ? <HiMoon className="w-6 h-6" /> : <HiSun className="w-6 h-6" />}
            </button>
            {token ? (
              <button
                onClick={() => {
                  logout();
                  nav("/login", { replace: true });
                }}
                className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors"
              >
                Logout
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => nav("/login")}
                  className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => nav("/signup")}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 py-10 lg:py-20">
          <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-200 dark:border-blue-800">
              <HiSparkles className="w-4 h-4" />
              <span>Next-Gen Learning Platform</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-900 dark:text-white">
              Master Any Skill In Minutes. <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Powered By AI
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed font-medium">
              Join the future of education where AI meets micro-learning to create 
              the fastest path to knowledge across any discipline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {token ? (
                <>
                  {canSeeDashboard && (
                    <button
                      onClick={() => nav("/admindashboard")}
                      className="group relative flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white px-8 py-4 text-lg font-bold text-white dark:text-slate-900 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-slate-500/20"
                    >
                      Enter Dashboard
                      <HiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>
                  )}
                  <button className="flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 text-lg font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg">
                    My Courses
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => nav("/signup")}
                    className="group relative flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/20"
                  >
                    Get Started Free
                    <HiArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => nav("/login")}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 text-lg font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-lg"
                  >
                    Login to Account
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 relative animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* Background Glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-full blur-[100px] opacity-20 dark:opacity-30"></div>
            
            {/* Main Hero Image */}
            <div className="relative transform hover:rotate-2 transition-transform duration-500 cursor-pointer group">
              <img
                src="/hero_ai_3d_1773500066058.png"
                alt="AI Learning Sphere"
                className="w-full max-w-2xl mx-auto rounded-[2rem] shadow-2xl drop-shadow-[0_25px_25px_rgba(0,0,0,0.1)] group-hover:drop-shadow-[0_35px_35px_rgba(59,130,246,0.3)] transition-all duration-500"
              />
              {/* Floating Element Mockups (CSS) */}
              <div className="absolute top-10 right-0 lg:-right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl animate-bounce duration-[3000ms] border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Matching</div>
                    <div className="text-sm font-black dark:text-white">Smart Path Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-20 lg:mt-32">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Engineered for Efficiency</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              We've redesigned the learning cycle from the ground up using verified brain science and artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature) => (
              <div 
                key={feature.title}
                className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-3 dark:text-white">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-20 lg:mt-40 p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden relative shadow-2xl shadow-blue-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">Ready to evolve your knowledge?</h2>
            <p className="text-xl text-blue-100 font-medium opacity-90">
              Join thousands of learners bypassing the status quo with AI-driven paths.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => nav(token ? "/admindashboard" : "/signup")}
                className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-900/40"
              >
                {token ? "Continue Learning" : "Get Started Now"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <HiCpuChip className="w-5 h-5 font-black" />
            <span className="font-black tracking-tighter">Smart Path</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            © 2026 Smart Path AI Education. All rights reserved.
          </p>
          <div className="flex gap-6 text-slate-400 text-sm font-bold">
            <button type="button" className="hover:text-blue-500 transition-colors">Twitter</button>
            <button type="button" className="hover:text-blue-500 transition-colors">GitHub</button>
            <button type="button" className="hover:text-blue-500 transition-colors">Privacy</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

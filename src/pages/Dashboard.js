import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminUsersPanel from "../components/AdminUsersPanel";
import AdminStudentsPanel from "../components/AdminStudentsPanel";
import CreateAdminpanel from "../components/CreateAdminPanel";
import AdminContentPanel from "../components/AdminContentPanel";
import AdminCoursesPanel from "../components/AdminCoursesPanel.js";

const MENU = [
  { key: "content", label: "Overview" },
  { key: "courses", label: " Course Library" },
  { key: "students", label: "Manage Students" },
  { key: "users", label: "Manage Admins" },
  { key: "admins", label: "Add Admin" },
];

export default function Dashboard() {
  const { logout,role } = useAuth();
  const nav = useNavigate();



  const [active, setActive] = useState("content");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };
  const ActiveComponent = useMemo(() => {
    if (active === "content") return <AdminContentPanel />;
    if (active === "courses") return <AdminCoursesPanel />;
    if (active === "users") return <AdminUsersPanel />;
    if (active === "students") return <AdminStudentsPanel />;
    return <CreateAdminpanel />;
  }, [active]);
  return (
    // <div style={{ maxWidth: 900, margin: "40px auto" }}>
    //   <h2>Dashboard</h2>

    //   {err && <p style={{ color: "crimson" }}>{err}</p>}

    //   {/* Summary Section */}
    //   <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
    //     <Card title="Published Courses" value={courses.length} />
    //     {role === "admin" && (
    //       <Card title="Total Users" value={users.length} />
    //     )}
    //     <Card title="Your Role" value={role.toUpperCase()} />
    //   </div>

    //   {/* Courses Preview */}
    //   <section style={{ marginBottom: 40 }}>
    //     <h3>Courses</h3>
    //     {courses.length === 0 ? (
    //       <p>No courses available.</p>
    //     ) : (
    //       courses.map((c) => (
    //         <div
    //           key={c._id}
    //           style={{
    //             padding: 12,
    //             border: "1px solid #ddd",
    //             borderRadius: 6,
    //             marginBottom: 10,
    //           }}
    //         >
    //           <strong>{c.title}</strong>
    //           <div style={{ fontSize: 13, opacity: 0.8 }}>
    //             {c.description}
    //           </div>
    //         </div>
    //       ))
    //     )}
    //   </section>

    //   {/* Admin Shortcut */}
    //   {role === "admin" && (
    //     <section>
    //       <h3>Admin Panel</h3>
    //       <button onClick={() => nav("/admin")}>
    //         Go to Admin Management
    //       </button>
    //     </section>
    //   )}
    // </div>
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 flex flex-col transition-colors">
      <header className="w-full rounded-3xl bg-white dark:bg-slate-900 px-5 py-4 shadow-sm border border-transparent dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tighter uppercase">
              Smart Path
            </h1>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Admin Dashboard</span>
          </div>

          <button onClick={onLogout} className="rounded-xl bg-red-600 px-6 py-2.5 text-white font-bold text-sm tracking-wide hover:bg-red-700 active:scale-[0.98] transition-all shadow-lg shadow-red-500/20">
            Logout
          </button>
        </div>
      </header>

      <main className="mt-4 w-full flex-1 mb-8 flex flex-col min-h-0">
        <div className="flex flex-col md:flex-row gap-4 flex-1 md:h-[80vh] md:flex-none">
          {/* Sidebar */}
          <aside className="w-full md:w-72 shrink-0 rounded-3xl md:h-full bg-white dark:bg-slate-900/50 p-6 shadow-sm flex flex-col border border-slate-100 dark:border-slate-800 transition-colors backdrop-blur-sm">
            <div className="mb-8 flex items-center justify-between md:block">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Admin Tools</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Navigate system modules</p>
              </div>
              <button
                className="md:hidden rounded-xl p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isSidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            <div className={`${isSidebarOpen ? "block" : "hidden"} md:block flex-1 overflow-y-auto`}>
              {role === "admin" && (
                <nav className="flex flex-col gap-2.5 pb-2 md:pb-0 scrollbar-hide">
                  {MENU.map((item) => {
                    const isActive = active === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          setActive(item.key);
                          setIsSidebarOpen(false); // Auto close on selection
                        }}
                        className={[
                        "whitespace-nowrap md:whitespace-normal w-full rounded-2xl px-5 py-4 md:text-left text-sm md:text-base font-bold transition-all shrink-0 md:shrink",
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 md:bg-transparent",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
            {role !== "admin" && (
              <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  Access Restricted. Please contact support.
                </p>
              </div>
            )}
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 rounded-3xl bg-white dark:bg-slate-900/50 p-4 sm:p-8 shadow-sm flex flex-col min-w-0 border border-slate-100 dark:border-slate-800 transition-colors backdrop-blur-sm">
            {/* Let it flow naturally on mobile, scrollable on desktop */}
            <div className="flex-1 w-full md:overflow-y-auto md:overflow-x-hidden md:min-h-0">
              <div className="pb-10">
                {ActiveComponent}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

// function Card({ title, value }) {
//   return (
//     <div
//       style={{
//         flex: 1,
//         padding: 20,
//         border: "1px solid #ddd",
//         borderRadius: 8,
//         textAlign: "center",
//       }}
//     >
//       <div style={{ fontSize: 14, opacity: 0.8 }}>{title}</div>
//       <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
//     </div>
//   );
// }

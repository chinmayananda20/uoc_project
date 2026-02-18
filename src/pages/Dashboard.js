import { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import AdminUsersPanel from "../components/AdminUsersPanel";
import CreateAdminpanel from "../components/CreateAdminPanel";
import AdminContentPanel from "../components/AdminContentPanel";
import AdminCoursesPanel from "../components/AdminCoursesPanel.js";

export default function Dashboard() {
  const { logout,role } = useAuth();
  const nav = useNavigate();


  const MENU = [
    { key: "content", label: "Overview" },
    {key: "courses", label: " Course Library" },
    {key:"students", label:"Manage Students"},
    { key: "users", label: "Manage Admins" },
    { key: "admins", label: "Add Admin" },
  ];
  const [active, setActive] = useState("content");
const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };
  const ActiveComponent = useMemo(() => {
    if (active === "content") return <AdminContentPanel />;
    if (active === "courses") return <AdminCoursesPanel />;
    if (active === "users") return <AdminUsersPanel />;
    if (active === "students") return <div>Manage Students - Coming Soon</div>;
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
    <div className="min-h-screen bg-[#D1D1D1] p-4 sm:p-6 flex flex-col">
      <header className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600">
              Smart Path
            </h1>
            <span className="text-sm text-slate-500">Admin Dashboard</span>
          </div>

          <button onClick={onLogout} className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700 active:scale-[0.99]">
            Logout
          </button>
        </div>
      </header>

      <main className="mt-4 w-full ">
        <div className="grid grid-cols-12 gap-4  h-[80vh]">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3 rounded-2xl h-full bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-slate-800">Admin Tools</h2>
              <p className="text-sm text-slate-500">Pick a section</p>
            </div>

            {role === "admin" && (
              <nav className="space-y-2">
                {MENU.map((item) => {
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActive(item.key)}
                      className={[
                        "w-full rounded-xl px-4 py-3 text-left text-lg font-semibold transition",
                        isActive
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-100 text-slate-800",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
            {role !== "admin" && (
              <div>
                <button
                  className={[
                    "w-full rounded-xl px-4 py-3 text-left text-lg font-semibold transition",
                    active
                      ? "bg-slate-900 text-white"
                      : "hover:bg-slate-100 text-slate-800",
                  ].join(" ")}
                >
                  Content
                </button>
                <p className="text-sm text-red-500 mt-2">
                  You do not have access to admin tools.Please Contact Supoort
                </p>
              </div>
            )}
          </aside>

          {/* Content */}
          <section className="col-span-12 md:col-span-9 rounded-2xl bg-white p-5 sm:p-6 shadow-sm min-h-[60vh]">
            {/* if content grows, keep it scrollable */}
            <div className="h-full w-full overflow-auto">{ActiveComponent}</div>
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

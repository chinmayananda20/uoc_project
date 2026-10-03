import React, { useEffect, useMemo, useState } from "react";
import { adminGetUsers } from "../api/adminUsers.api";
import { getAllCoursesAdmin } from "../api/admin.api";
import { useAuth } from "../auth/AuthContext";
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineShieldCheck,
  HiOutlineCheckCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";

const AdminContentPanel = () => {
  const { role } = useAuth();

  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const roleReady = Boolean(role);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        // Wait until role exists
        if (!role) return;

        // ✅ allow admin + staff
        if (role !== "admin" && role !== "staff") {
          if (!cancelled) {
            setUsers([]);
            setCourses([]);
            setErrorMsg("You are not authorized to view this dashboard.");
          }
          return;
        }

        const [userData, courseData] = await Promise.all([
          adminGetUsers(),
          getAllCoursesAdmin(),
        ]);

        if (!cancelled) {
          setUsers(userData || []);
          setCourses(courseData || []);
        }
      } catch (e) {
        const status = e?.response?.status;

        if (!cancelled) {
          if (status === 401 || status === 403) {
            setErrorMsg("You are not authorized to view this dashboard.");
          } else {
            setErrorMsg("Failed to load dashboard data. Try again.");
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const stats = useMemo(() => {
    const userCount = users?.length || 0;

    let staffCount = 0;
    let studentCount = 0;
    let adminCount = 0;

    for (const u of users || []) {
      if (u?.role === "staff") staffCount++;
      else if (u?.role === "student") studentCount++;
      else if (u?.role === "admin") adminCount++;
    }
    console.log(courses);
    let publishedCourseCount = 0;
    let draftCourseCount = 0;

    for (const c of courses || []) {
      if (c?.published) publishedCourseCount++;
      else draftCourseCount++;
    }

    return {
      userCount,
      staffCount,
      studentCount,
      adminCount,
      publishedCourseCount,
      draftCourseCount,
    };
  }, [users, courses]);

  const cards = useMemo(
    () => [
      {
        title: "Total Users",
        value: stats.userCount,
        sub: "All registered accounts",
        Icon: HiOutlineUsers,
        gradient: "from-slate-700 to-slate-900",
        iconBg: "bg-white/15",
      },
      {
        title: "Staff Members",
        value: stats.staffCount,
        sub: "Teaching & content staff",
        Icon: HiOutlineUserGroup,
        gradient: "from-indigo-500 to-indigo-700",
        iconBg: "bg-white/15",
      },
      {
        title: "Students",
        value: stats.studentCount,
        sub: "Active learners",
        Icon: HiOutlineAcademicCap,
        gradient: "from-emerald-500 to-emerald-700",
        iconBg: "bg-white/15",
      },
      {
        title: "Admins",
        value: stats.adminCount,
        sub: "Full access accounts",
        Icon: HiOutlineShieldCheck,
        gradient: "from-amber-500 to-amber-700",
        iconBg: "bg-white/15",
      },
      {
        title: "Published Courses",
        value: stats.publishedCourseCount,
        sub: "Visible to students",
        Icon: HiOutlineCheckCircle,
        gradient: "from-blue-600 to-blue-800",
        iconBg: "bg-white/15",
      },
      {
        title: "Draft Courses",
        value: stats.draftCourseCount,
        sub: "Pending publication",
        Icon: HiOutlineDocumentText,
        gradient: "from-rose-500 to-rose-700",
        iconBg: "bg-white/15",
      },
    ],
    [stats],
  );

  const showSkeleton = !roleReady || loading;

  return (
    <div className="w-full">
      <div>
        <h1 className="font-extrabold text-3xl text-slate-900 dark:text-white tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">
          Welcome to the dashboard. Here you can manage courses and users.
        </p>

        {role && (
          <div className="mt-3 inline-flex items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">
            Role: {role}
          </div>
        )}
      </div>

      {!roleReady ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <div className="h-4 w-32 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="mt-4 h-10 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="mt-6 h-3 w-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ))}
        </div>
      ) : errorMsg ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMsg}
        </div>
      ) : (
        <div>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map(({ title, value, sub, Icon }) => (
              <div
                key={title}
                className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                      {showSkeleton ? (
                        <span className="inline-block h-8 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                      ) : (
                        value
                      )}
                    </h2>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500 font-medium pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                  {sub}
                </div>
              </div>
            ))}
          </div>

          {role === "admin" && (
            <div className="mt-6 py-4 border-t border-slate-100 dark:border-slate-800">
               <span className="text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">System Controls Active</span>
            </div>
          )}
          {role !== "admin" && (
            <div className="mt-6">
              <div className="relative overflow-hidden rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/5 dark:to-orange-900/5 p-6 shadow-sm">
                {/* subtle background glow */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />

                <div className="flex items-start gap-4">
                  {/* icon */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 border border-amber-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z"
                      />
                    </svg>
                  </div>

                  {/* content */}
                  <div>
                    <h3 className="text-lg font-bold text-amber-900 dark:text-amber-500">
                      Restricted Access
                    </h3>
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-600 font-medium">
                      You are logged in as{" "}
                      <span className="font-black text-amber-950 dark:text-amber-400 uppercase tracking-tight">{role}</span>.
                      Administrative controls are only available to admin users.
                    </p>
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-700 font-bold">
                      If you believe this is an error, please contact your
                      system administrator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminContentPanel;

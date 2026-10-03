import React, { useEffect, useState } from "react";
import { getCourseEnrollments } from "../api/enrollments.api";
import { HiUser, HiEnvelope, HiCalendarDays, HiMagnifyingGlass } from "react-icons/hi2";
import { motion } from "framer-motion";

export default function AdminEnrolledStudents({ courseId }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const data = await getCourseEnrollments(courseId);
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, [courseId]);

  const filtered = enrollments.filter(e => 
    e.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header/Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Enrolled Students</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {enrollments.length} total students enrolled
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <HiUser className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No students found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((enrollment, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={enrollment._id}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl uppercase">
                  {enrollment.userId?.name?.charAt(0) || "U"}
                </div>
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{enrollment.userId?.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <HiEnvelope className="w-3.5 h-3.5" />
                    <span className="truncate">{enrollment.userId?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                    <HiCalendarDays className="w-3.5 h-3.5" />
                    <span>Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

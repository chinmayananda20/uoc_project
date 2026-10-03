import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { HiSun, HiMoon, HiArrowRight, HiCpuChip, HiSparkles, HiAcademicCap, HiRocketLaunch, HiStar, HiUser } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { listPublicCourses } from "../api/courses.api";
import { listMyEnrollments, enrollInCourse } from "../api/enrollments.api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const TESTIMONIALS = [
  {
    name: "Alex Rivera",
    role: "Full Stack Developer",
    content: "Smart Path cut my learning time in half. The AI roadmaps are spooky accurate.",
    avatar: <HiUser className="w-6 h-6" />,
  },
  {
    name: "Sarah Chen",
    role: "Data Scientist",
    content: "The micro-course approach is revolutionary. I can master complex concepts during my commute.",
    avatar: <HiUser className="w-6 h-6" />,
  },
  {
    name: "Marcus Wright",
    role: "Product Designer",
    content: "Finally, a platform that understands my learning pace. The UI is stunning and intuitive.",
    avatar: <HiUser className="w-6 h-6" />,
  },
];



const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    },
  },
};

const CourseDetailModal = ({ course, onClose, onEnroll, isEnrolled }) => {
  useEffect(() => {
    if (course) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [course]);

  if (!course) return null;

  const publisherName = course.createdBy?.name || "Smart Path Instructor";
  const publishDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : "Recent";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto py-8 sm:py-16 px-4 sm:px-6 backdrop-blur-xl bg-slate-950/60 scrollbar-hide"
      onClick={onClose}
    >
      <div className="min-h-full flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="aspect-video relative overflow-hidden">
          <img 
            src={course.bannerImage || course.image} 
            alt={course.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&q=80&w=800";
            }}
          />
          <div className="absolute top-6 left-6 flex gap-2">
            <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
              {course.level}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-900/10 hover:bg-slate-900/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors group"
          >
            <div className="w-5 h-0.5 bg-slate-900 dark:bg-white rotate-45 absolute transition-transform group-hover:scale-110"></div>
            <div className="w-5 h-0.5 bg-slate-900 dark:bg-white -rotate-45 absolute transition-transform group-hover:scale-110"></div>
          </button>
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter uppercase">
              {course.title}
            </h2>
            <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <HiUser className="w-4 h-4 text-blue-500" />
                <span>{publisherName}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                <HiAcademicCap className="w-4 h-4 text-indigo-500" />
                <span>Published {publishDate}</span>
              </div>
            </div>
          </div>

          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {course.description || course.desc}
          </p>

          {(course.tags && course.tags.length > 0) && (
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Core Concepts</span>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-black border border-slate-200 dark:border-slate-800 uppercase tracking-widest hover:border-blue-500/50 transition-colors">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={onEnroll}
              className="flex-1 px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              {isEnrolled ? (
                <>Go to Course <HiArrowRight className="w-5 h-5" /></>
              ) : (
                <>Enroll & Start Now</>
              )}
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-5 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const nav = useNavigate();
  const { token, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(new Set());

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [publicCourses, userEnrollments] = await Promise.all([
          listPublicCourses(),
          token ? listMyEnrollments() : Promise.resolve([])
        ]);
        
        setCourses(publicCourses);
        if (token && userEnrollments) {
          const ids = new Set(userEnrollments.map(e => e.courseId?._id || e.courseId));
          setEnrolledCourseIds(ids);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [token]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  const handleEnroll = async () => {
    if (!token) {
      toast.info("Please login to enroll in courses.");
      nav("/login");
      return;
    }

    const courseId = selectedCourse._id || selectedCourse.id;
    if (enrolledCourseIds.has(courseId)) {
      nav(`/course/${courseId}`); 
      setSelectedCourse(null);
      return;
    }

    try {
      await enrollInCourse(courseId);
      toast.success(`Successfully enrolled in ${selectedCourse.title}!`);
      setEnrolledCourseIds(prev => new Set([...prev, courseId]));
      setSelectedCourse(null);
    } catch (error) {
      console.error("Enrollment failed:", error);
      toast.error(error.response?.data?.message || "Failed to enroll. Please try again.");
    }
  };

  const canSeeDashboard = role === "admin" || role === "staff";
  const displayCourses = courses;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HiCpuChip className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">Smart Path</span>
          </motion.div>

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

      <main className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-32">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between gap-12 py-10 lg:py-20 lg:mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 space-y-8"
          >
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
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="flex-1 relative"
          >
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
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 lg:-right-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Matching</div>
                    <div className="text-sm font-black dark:text-white">Smart Path Active</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Courses Section */}
        <section>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center space-y-4 mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Featured Courses</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Start your journey with our top-rated micro-courses.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-80 rounded-[2rem] bg-slate-200 dark:bg-slate-900 animate-pulse" />
              ))
            ) : displayCourses.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-xl font-bold text-slate-500 dark:text-slate-400">No courses available yet.</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Check back later or contact an administrator.</p>
              </div>
            ) : (
            displayCourses.map((course) => {
              const courseId = course._id || course.id;
              const isEnrolled = enrolledCourseIds.has(courseId);
              const tags = Array.isArray(course.tags) ? course.tags : [];
              return (
                <motion.div 
                  key={courseId}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ y: -8, scale: 1.01 }}
                  onClick={() => handleCourseClick(course)}
                  className="group cursor-pointer bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
                >
                  <div className="aspect-video relative overflow-hidden shrink-0">
                    <img 
                      src={course.bannerImage || course.image} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad095?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3.5 py-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border border-slate-100 dark:border-slate-800 shadow-sm">
                        {course.level || "Beginner"}
                      </span>
                      {isEnrolled && (
                        <span className="px-3.5 py-1.5 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                          Enrolled
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 line-clamp-2 text-sm leading-relaxed">
                        {course.description || course.desc}
                      </p>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] font-bold px-2.5 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200/40 dark:border-slate-700/50 uppercase tracking-wider">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isEnrolled) {
                          nav(`/course/${courseId}`);
                        } else {
                          handleCourseClick(course);
                        }
                      }}
                      className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                        isEnrolled 
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white"
                          : "bg-slate-950 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-500 dark:hover:text-white"
                      }`}
                    >
                      {isEnrolled ? (
                        <>Resume Learning <HiArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>Explore Syllabus <HiArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <button 
              onClick={() => nav("/signup")}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Explore All Courses
              <HiArrowRight />
            </button>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center space-y-4 mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Engineered for Efficiency</motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              We've redesigned the learning cycle using verified brain science.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {FEATURES.map((feature) => (
              <motion.div 
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="group p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black mb-2 dark:text-white">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <section>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center space-y-4 mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Trusted by Learners</motion.h2>
            <div className="flex justify-center gap-1 text-yellow-500 mb-2">
              {[...Array(5)].map((_, i) => <HiStar key={i} className="w-5 h-5 fill-current" />)}
            </div>
            <motion.p variants={itemVariants} className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
              Join 50,000+ professionals hitting their goals faster.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div 
                key={t.name}
                variants={itemVariants}
                className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="font-black dark:text-white leading-none">{t.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.role}</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">"{t.content}"</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Call to Action */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-800 text-white overflow-hidden relative shadow-2xl shadow-blue-500/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 text-center space-y-8 max-w-3xl mx-auto py-10">
            <h2 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight">Ready to evolve your knowledge?</h2>
            <p className="text-xl text-blue-100 font-medium opacity-90 text-center">
              Join thousands of learners bypassing the status quo with AI-driven paths.
            </p>
            <div className="flex justify-center">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => nav(token ? "/admindashboard" : "/signup")}
                className="px-12 py-5 bg-white text-blue-600 rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-900/40"
              >
                {token ? "Continue Learning" : "Get Started Now"}
              </motion.button>
            </div>
          </div>
        </motion.section>
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

      <AnimatePresence>
        {selectedCourse && (
          <CourseDetailModal 
            course={selectedCourse} 
            onClose={() => setSelectedCourse(null)} 
            onEnroll={handleEnroll}
            isEnrolled={enrolledCourseIds.has(selectedCourse._id || selectedCourse.id)}
          />
        )}
      </AnimatePresence>
      <ToastContainer position="bottom-right" theme={theme === "dark" ? "dark" : "light"} />
    </div>
  );
}

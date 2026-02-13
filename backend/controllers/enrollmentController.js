const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const getUserId = (req) => req.user?.id || req.user?._id;

// POST /api/courses/:courseId/enroll  (student/admin)
exports.enrollInCourse = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    const course = await Course.findById(courseId).select("published");
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Students can only enroll in published courses
    if (req.user.role !== "admin" && !course.published) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create if not exists, else return existing
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      {
        $setOnInsert: {
          userId,
          courseId,
          status: "enrolled",
          progressPercent: 0,
          lastLessonId: null,
          startedAt: new Date(),
        },
      },
      { new: true, upsert: true }
    );

    return res.status(201).json(enrollment);
  } catch (error) {
    // if unique index race happens, just fetch existing
    if (error.code === 11000) {
      const enrollment = await Enrollment.findOne({
        userId: getUserId(req),
        courseId: req.params.courseId,
      });
      return res.status(200).json(enrollment);
    }

    return res.status(400).json({ message: error.message });
  }
};

// GET /api/me/enrollments  (student/admin)
exports.getMyEnrollments = async (req, res) => {
  try {
    const userId = getUserId(req);

    const enrollments = await Enrollment.find({ userId })
      .populate("courseId", "title level tags published")
      .sort({ createdAt: -1 });

    return res.json(enrollments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PATCH /api/courses/:courseId/enrollment/drop  (student)
exports.dropCourse = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    const enr = await Enrollment.findOne({ userId, courseId });
    if (!enr) return res.status(404).json({ message: "Enrollment not found" });

    enr.status = "dropped";
    await enr.save();

    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// (Optional admin) GET /api/enrollments  (admin)
exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({})
      .populate("userId", "name email role")
      .populate("courseId", "title level published")
      .sort({ createdAt: -1 });

    return res.json(enrollments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
 
const Course = require("../models/Course");

const getUserId = (req) => req.user?.id || req.user?._id;

exports.createCourse = async (req, res) => {
  try {
    const { title, description, tags, level } = req.body || {};

    if (!title || !description || !level) {
      return res
        .status(400)
        .json({ message: "title, description, and level are required" });
    }

    const course = await Course.create({
      title: String(title).trim(),
      description: String(description).trim(),
      tags: Array.isArray(tags) ? tags : [],
      level,
      createdBy: getUserId(req),
    });

    return res.status(201).json(course);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Public: only published courses
exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ published: true })
      .select("title description level tags")
      .sort({ createdAt: -1 });

    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Public: published only; Admin: can view drafts too
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.published) return res.json(course);

    // only admin can view unpublished
    if (req.user && req.user.role === "admin") return res.json(course);

    return res.status(404).json({ message: "Course not found" });
  } catch (error) {
    return res.status(400).json({ message: "Invalid course ID" });
  }
};

// Admin: update course fields (draft or published)
exports.updateCourse = async (req, res) => {
  try {
    const { title, description, tags, level } = req.body || {};

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (title !== undefined) course.title = String(title).trim();
    if (description !== undefined) course.description = String(description).trim();
    if (tags !== undefined) course.tags = Array.isArray(tags) ? tags : [];
    if (level !== undefined) course.level = level;

    await course.save();
    return res.json(course);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Admin: publish/unpublish
exports.setCoursePublished = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (typeof req.body?.published !== "boolean") {
      return res.status(400).json({ message: "published must be true/false" });
    }

    course.published = req.body.published;
    await course.save();

    return res.json({ id: course._id, published: course.published });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
// Admin: list all courses (published + drafts)
exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find({})
      .select("title description level tags published createdAt")
      .sort({ createdAt: -1 });

    return res.json(courses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin: delete
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await Course.deleteOne({ _id: course._id });
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

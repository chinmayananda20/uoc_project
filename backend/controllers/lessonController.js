const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

exports.createLesson = async (req, res) => {
  try {
    const { title, content, order, estimatedTime } = req.body || {};
    const { courseId } = req.params;

    if (!title || !content || !order || !estimatedTime) {
      return res.status(400).json({
        message: "title, content, order, estimatedTime are required",
      });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lesson = await Lesson.create({
      courseId,
      title: String(title).trim(),
      content: String(content),
      order: Number(order),
      estimatedTime: Number(estimatedTime),
    });

    return res.status(201).json(lesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Public-ish: only if course is published
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("published");
    if (!course) return res.status(404).json({ message: "Course not found" });

    // only show lessons if the course is published
    if (!course.published) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lessons = await Lesson.find({ courseId })
      .select("title order estimatedTime")
      .sort({ order: 1 });

    return res.json(lessons);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// Admin can view any lesson; students should only access via course published + enrollment (later)
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    // If not admin, only allow if parent course is published
    if (req.user?.role !== "admin") {
      const course = await Course.findById(lesson.courseId).select("published");
      if (!course || !course.published) {
        return res.status(404).json({ message: "Lesson not found" });
      }
    }

    return res.json(lesson);
  } catch (error) {
    return res.status(400).json({ message: "Invalid lesson ID" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const allowed = ["title", "content", "order", "estimatedTime"];
    for (const key of allowed) {
      if (key in req.body) lesson[key] = req.body[key];
    }

    await lesson.save();
    return res.json(lesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await Lesson.deleteOne({ _id: lesson._id });
    return res.json({ success: true });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

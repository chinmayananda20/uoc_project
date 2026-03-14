// const Course = require("../models/Course");
// const Lesson = require("../models/Lesson");

// exports.createLesson = async (req, res) => {
//   try {
//     const { title, content, order, estimatedTime } = req.body || {};
//     const { courseId } = req.params;

//     if (!title || !content || order === undefined || estimatedTime === undefined) {
//       return res.status(400).json({
//         message: "title, content, order, estimatedTime are required",
//       });
//     }

//     const course = await Course.findById(courseId);
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const lesson = await Lesson.create({
//       courseId,
//       title: String(title).trim(),
//       content: String(content),
//       order: Number(order),
//       estimatedTime: Number(estimatedTime),
//     });

//     return res.status(201).json(lesson);
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// };

// // Access control should be handled by middleware (requireEnrollment / published checks).
// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const course = await Course.findById(courseId).select("_id");
//     if (!course) return res.status(404).json({ message: "Course not found" });

//     const lessons = await Lesson.find({ courseId })
//       .select("title order estimatedTime")
//       .sort({ order: 1 });

//     return res.json(lessons);
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// };

// // Access control should be handled by middleware (requireEnrollment / published checks).
// exports.getLessonById = async (req, res) => {
//   try {
//     const lesson = await Lesson.findById(req.params.lessonId);
//     if (!lesson) return res.status(404).json({ message: "Lesson not found" });

//     return res.json(lesson);
//   } catch (error) {
//     return res.status(400).json({ message: "Invalid lesson ID" });
//   }
// };

// exports.updateLesson = async (req, res) => {
//   try {
//     const lesson = await Lesson.findById(req.params.lessonId);
//     if (!lesson) return res.status(404).json({ message: "Lesson not found" });

//     const allowed = ["title", "content", "order", "estimatedTime"];
//     for (const key of allowed) {
//       if (key in req.body) lesson[key] = req.body[key];
//     }

//     await lesson.save();
//     return res.json(lesson);
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// };

// exports.deleteLesson = async (req, res) => {
//   try {
//     const lesson = await Lesson.findById(req.params.lessonId);
//     if (!lesson) return res.status(404).json({ message: "Lesson not found" });

//     await Lesson.deleteOne({ _id: lesson._id });
//     return res.json({ success: true });
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// };
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");

function validateSlides(slides) {
  if (!Array.isArray(slides) || slides.length === 0) {
    return "slides must be a non-empty array";
  }

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    if (!slide || !Array.isArray(slide.elements) || slide.elements.length === 0) {
      return `slide[${i}] must have a non-empty elements array`;
    }

    let headingCount = 0;
    let subheadingCount = 0;

    for (let j = 0; j < slide.elements.length; j++) {
      const el = slide.elements[j];
      if (!el || !el.type || !el.data) {
        return `slide[${i}].elements[${j}] must include type and data`;
      }

      if (el.type === "heading") headingCount++;
      if (el.type === "subheading") subheadingCount++;

      if (["heading", "subheading", "text"].includes(el.type)) {
        if (typeof el.data.text !== "string" || !el.data.text.trim()) {
          return `slide[${i}].elements[${j}] (${el.type}) requires data.text`;
        }
      }

      if (el.type === "bullets") {
        if (!Array.isArray(el.data.items) || el.data.items.length === 0) {
          return `slide[${i}].elements[${j}] (bullets) requires data.items[]`;
        }
      }

      if (el.type === "image") {
        if (typeof el.data.url !== "string" || !el.data.url.trim()) {
          return `slide[${i}].elements[${j}] (image) requires data.url`;
        }
      }
    }

    // Guardrails to keep slides sane (adjust as you want)
    if (headingCount > 1) return `slide[${i}] can have at most 1 heading`;

  }

  return null;
}

exports.createLesson = async (req, res) => {
  try {
    const { title, slides, order, estimatedTime } = req.body || {};
    const { courseId } = req.params;

    if (!title || order === undefined || estimatedTime === undefined || slides === undefined) {
      return res.status(400).json({
        message: "title, slides, order, estimatedTime are required",
      });
    }

    const slidesError = validateSlides(slides);
    if (slidesError) return res.status(400).json({ message: slidesError });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lesson = await Lesson.create({
      courseId,
      title: String(title).trim(),
      slides,
      order: Number(order),
      estimatedTime: Number(estimatedTime),
    });

    return res.status(201).json(lesson);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).select("_id");
    if (!course) return res.status(404).json({ message: "Course not found" });

    const lessons = await Lesson.find({ courseId })
  .select("title order estimatedTime slides updatedAt") // include slides to count
  .sort({ order: 1 })
  .lean();

return res.json(
  lessons.map((l) => ({
    _id: l._id,
    title: l.title,
    order: l.order,
    estimatedTime: l.estimatedTime,
    updatedAt: l.updatedAt,
    slidesCount: Array.isArray(l.slides) ? l.slides.length : 0,
  }))
);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    return res.json(lesson);
  } catch (error) {
    return res.status(400).json({ message: "Invalid lesson ID" });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const allowed = ["title", "slides", "order", "estimatedTime"];

    for (const key of allowed) {
      if (key in req.body) {
        if (key === "slides") {
          const slidesError = validateSlides(req.body.slides);
          if (slidesError) return res.status(400).json({ message: slidesError });
        }
        lesson[key] = req.body[key];
      }
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

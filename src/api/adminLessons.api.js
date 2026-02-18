import api from "./client";

// ========== ADMIN ==========

// POST /api/courses/:courseId/lessons
// body: { title, content, order, estimatedTime }
export async function adminCreateLesson(courseId, payload) {
  const res = await api.post(`/courses/${courseId}/lessons`, payload);
  return res.data;
}

// PATCH /api/lessons/:lessonId
// body can include: { title?, content?, order?, estimatedTime? }
export async function adminUpdateLesson(lessonId, payload) {
  const res = await api.patch(`/lessons/${lessonId}`, payload);
  return res.data;
}

// DELETE /api/lessons/:lessonId
export async function adminDeleteLesson(lessonId) {
  const res = await api.delete(`/lessons/${lessonId}`);
  return res.data; // { success: true }
}

// ========== STUDENT / AUTHED ==========

// GET /api/courses/:courseId/lessons
// requires auth + enrollment middleware (in your backend)
export async function getLessonsByCourse(courseId) {
  const res = await api.get(`/courses/${courseId}/lessons`);
  return res.data; // [{ title, order, estimatedTime, _id? }]
}

// GET /api/lessons/:lessonId
// requires auth + enrollment middleware (in your backend)
export async function getLessonById(lessonId) {
  const res = await api.get(`/lessons/${lessonId}`);
  return res.data;
}

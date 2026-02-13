import api from "./client";

export async function adminListCourses() {
  const res = await api.get("/courses"); // admin list (drafts + published)
  return res.data;
}

export async function adminCreateCourse(payload) {
  const res = await api.post("/courses", payload); // requires title, description, level
  return res.data;
}

export async function adminSetCoursePublished(courseId, published) {
  const res = await api.patch(`/courses/${courseId}/publish`, { published });
  return res.data;
}

export async function adminDeleteCourse(courseId) {
  const res = await api.delete(`/courses/${courseId}`);
  return res.data;
}
export async function adminUpdateCourse(courseId, payload) {
  const res = await api.patch(`/courses/${courseId}`, payload);
  return res.data;
}
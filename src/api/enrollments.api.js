import api from "./client";

export async function enrollInCourse(courseId) {
  const res = await api.post(`/courses/${courseId}/enroll`);
  return res.data;
}

export async function listMyEnrollments() {
  const res = await api.get("/me/enrollments");
  return res.data;
}

export async function getCourseEnrollments(courseId) {
  const res = await api.get(`/courses/${courseId}/enrollments`);
  return res.data;
}

export async function getCourseProgress(courseId) {
  const res = await api.get(`/courses/${courseId}/progress`);
  return res.data;
}

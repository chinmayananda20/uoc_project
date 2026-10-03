import api from "./client";

export async function listPublicCourses() {
  const res = await api.get("/courses");
  return res.data;
}

export async function getPublicCourse(id) {
  const res = await api.get(`/courses/${id}`);
  return res.data;
}

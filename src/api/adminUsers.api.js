import api from "./client";

export async function adminGetUsers() {
  const res = await api.get("/admin/users");
  return res.data;
}

export async function adminSetUserRole(userId, role) {
  const res = await api.patch(`/admin/users/${userId}/role`, { role });
  return res.data;
}

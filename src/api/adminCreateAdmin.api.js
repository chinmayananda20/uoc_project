import api from "./client";

export async function adminCreateAdminApi({ name, email }) {
  const res = await api.post("/admin/users/admin", { name, email });
  return res.data;
}

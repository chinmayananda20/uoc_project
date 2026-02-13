import api from "./client";

export async function forgotPasswordApi(email) {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data; // { message: "If the account exists..." }
}

export async function resetPasswordApi({ email, token, newPassword }) {
  const res = await api.post("/auth/reset-password", { email, token, newPassword });
  return res.data; // { message: "Password reset successful" }
}

import api from "./client";

// LOGIN: adjust if your backend uses /auth/login or /login
export async function loginApi(email, password) {
  const res = await api.post("/auth/login", { email, password });
  // expected: { token, user }
  return { token: res.data.authtoken };
}

// SIGNUP: you said app.use('/api/signup', ...)
export async function signupApi(payload) {
  const res = await api.post("/auth/signup", payload);
  return res.data;
}

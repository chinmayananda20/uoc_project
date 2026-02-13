import { createContext, useContext, useMemo, useState } from "react";
import { loginApi } from "../api/auth.api";
import { decodeJwt } from "../utils/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = async (email, password) => {
    const { token } = await loginApi(email, password); // returns normalized token
    if (!token) throw new Error("No token returned");
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  };

  const decoded = token ? decodeJwt(token) : null;
  const role = decoded?.user?.role || null; // your JWT payload has user.role

  const value = useMemo(() => ({ token, role, login, logout }), [token, role]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

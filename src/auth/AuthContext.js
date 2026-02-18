import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loginApi } from "../api/auth.api";
import { decodeJwt } from "../utils/jwt";

const AuthContext = createContext(null);

function getExpiryMs(token) {
  try {
    const payload = decodeJwt(token);
    const expSec = payload?.exp;
    if (!expSec) return null;
    return expSec * 1000;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const logoutTimerRef = useRef(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  };

  const login = async (email, password) => {
    // IMPORTANT: your backend returns { authtoken }
    // If your loginApi already normalizes it to { token }, keep as-is.
    const data = await loginApi(email, password);

    const t = data?.token || data?.authtoken; // supports both
    if (!t) throw new Error("No token returned");

    localStorage.setItem("token", t);
    setToken(t);
  };

  // Decode role from token
  const decoded = token ? decodeJwt(token) : null;
  const role = decoded?.user?.role || null;
  const userId = decoded?.user?.id || null;
  // Auto-logout timer based on token expiry
  useEffect(() => {
    // clear previous timer
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!token) return;

    const expiryMs = getExpiryMs(token);
    if (!expiryMs) return; // token has no exp -> can't schedule

    const timeout = expiryMs - Date.now();

    if (timeout <= 0) {
      // already expired
      logout();
      return;
    }

    logoutTimerRef.current = setTimeout(() => {
      logout();
      // optional: redirect
      window.location.href = "/login";
    }, timeout);

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [token]);

  const value = useMemo(
    () => ({ token, role, login, logout,userId }),
    [token, role, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireRole({ role: requiredRole, children }) {
  const { token, role } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  // requiredRole can be: "admin" OR ["admin","staff"]
  const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  if (!allowed.includes(role)) return <Navigate to="/" replace />;

  return children;
}

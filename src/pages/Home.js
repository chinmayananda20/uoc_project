import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const nav = useNavigate();
  const { role, logout } = useAuth();

  const canSeeDashboard = role === "admin" || role === "staff";

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>Home</h2>

      {canSeeDashboard && (
        <button onClick={() => nav("/dashboard")}>Dashboard</button>
      )}

      <button
        style={{ marginLeft: 8 }}
        onClick={() => {
          logout();
          nav("/login", { replace: true });
        }}
      >
        Logout
      </button>
    </div>
  );
}

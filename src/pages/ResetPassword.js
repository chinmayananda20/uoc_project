import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resetPasswordApi } from "../api/password.api";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPassword() {
  const nav = useNavigate();
  const q = useQuery();

  const emailFromLink = q.get("email") || "";
  const tokenFromLink = q.get("token") || "";

  const [email, setEmail] = useState(emailFromLink);
  const [token, setToken] = useState(tokenFromLink);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setStatus("");

    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    if (!email || !token) {
      setErr("Missing email or token. Use the link from your email.");
      return;
    }

    setLoading(true);
    try {
      const data = await resetPasswordApi({ email, token, newPassword });
      setStatus(data?.message || "Password reset successful");

      // Redirect to login after success (immediate)
      nav("/login", { replace: true });
    } catch (error) {
      setErr(error?.response?.data?.error || "Reset failed. Link may be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Reset Password</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 8 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Token</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
            This is auto-filled from the reset link. Don’t edit unless needed.
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>New Password</label>
          <input
            style={{ width: "100%", padding: 8 }}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Confirm Password</label>
          <input
            style={{ width: "100%", padding: 8 }}
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {status && <p style={{ color: "green" }}>{status}</p>}

        <button disabled={loading} type="submit">
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPasswordApi } from "../api/password.api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // success info
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setStatus("");
    setLoading(true);

    try {
      const data = await forgotPasswordApi(email);
      // backend returns generic message always
      setStatus(data?.message || "If the account exists, a password reset link has been sent.");
    } catch (error) {
      // Only real validation/server errors should show
      setErr(error?.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Forgot Password</h2>
      <p style={{ opacity: 0.8 }}>
        Enter your email. If an account exists, you’ll receive a reset link.
      </p>

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

        {err && <p style={{ color: "crimson" }}>{err}</p>}
        {status && <p style={{ color: "green" }}>{status}</p>}

        <button disabled={loading} type="submit">
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Back to <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

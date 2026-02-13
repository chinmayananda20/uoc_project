import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api/auth.api";

export default function Signup() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    student_number: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // ---------- FRONTEND VALIDATION ----------
    if (form.password !== form.confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // ONLY send what backend expects
      await signupApi({
        name: form.name,
        student_number: form.student_number,
        email: form.email,
        password: form.password,
      });

      // success → login
      nav("/login", { replace: true });
    } catch (error) {
      console.log("Signup error", error);
      setErr(
        error?.response?.data?.message ||
          "Signup failed. Try a different email or student number."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "40px auto" }}>
      <h2>Signup</h2>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={form.name}
            onChange={set("name")}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Student Number</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={form.student_number}
            onChange={set("student_number")}
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Email</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={form.email}
            onChange={set("email")}
            type="email"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={form.password}
            onChange={set("password")}
            type="password"
            required
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Confirm Password</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            type="password"
            required
          />
        </div>

        {err && <p style={{ color: "crimson" }}>{err}</p>}

        <button disabled={loading} type="submit">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

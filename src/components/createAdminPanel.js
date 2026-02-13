import { useState } from "react";
import { adminCreateAdminApi } from "../api/adminCreateAdmin.api";

function CreateAdminPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const data = await adminCreateAdminApi({ name, email });
      setMsg(data?.message || "Admin created and email sent.");
      setName("");
      setEmail("");
    } catch (error) {
      setErr(error?.response?.data?.error || "Failed to create admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Create Admin (sends password reset link)</h3>

      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {msg && <p style={{ color: "green" }}>{msg}</p>}

      <form onSubmit={submit}>
        <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
          <div>
            <label>Name</label>
            <input
              style={{ width: "100%", padding: 8 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Email</label>
            <input
              style={{ width: "100%", padding: 8 }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button disabled={loading} type="submit">
            {loading ? "Creating..." : "Create Admin & Send Link"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAdminPanel;

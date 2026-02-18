import { useState } from "react";
import { adminCreateAdminApi } from "../api/adminCreateAdmin.api";
import illustration from "../assets/addadmin.png";
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
    <div className="flex justify-around items-center h-full w-full">
      <img
        src={illustration}
        alt="Add Admin Illustration"
        className="w-1/2 max-w-md hidden md:block"
      />
      <div className=" max-w-lg  md:max-w-xl rounded-2xl border  border-gray-200 p-6 md:p-8 shadow-sm">
        <h3 className="text-3xl font-semibold text-gray-800 mb-4">
          Create Admin{" "}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          An email with a password reset link will be sent to the new admin.
        </p>
        {err && <p className="text-red-500">{err}</p>}
        {msg && <p className="text-green-500">{msg}</p>}

        <form className="space-y-4" onSubmit={submit}>
          <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
            <div>
              <label>Name</label>
              <input
                style={{ width: "100%", padding: 8 }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className={` m-5 rounded-xl py-2.5 font-medium hover:bg-blue-700 bg-blue-500 text-white transition`}
            >
              {loading ? "Creating..." : "Create Admin "}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateAdminPanel;

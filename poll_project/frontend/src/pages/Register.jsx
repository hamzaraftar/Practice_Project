import React, { useState } from "react";
import API from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    is_admin: false,
    is_regular: true,
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false); // ✅ loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const pickRole = (isAdmin) => {
    setForm({ ...form, is_admin: isAdmin, is_regular: !isAdmin });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (form.password !== form.password2) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true); // ✅ start loading animation

    try {
      await API.post("register/", {
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
        is_admin: form.is_admin,
        is_regular: form.is_regular,
      });

      setMsg("Registration successful. Redirecting...");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const detail = err?.response?.data || err.message;
      setMsg(`Registration failed: ${JSON.stringify(detail)}`);
      setLoading(false); // ✅ stop loading if error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow z-10"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="password2"
          type="password"
          placeholder="Confirm Password"
          value={form.password2}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        {/* Role selection */}
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => pickRole(true)}
            className={`flex-1 py-2 rounded ${
              form.is_admin ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => pickRole(false)}
            className={`flex-1 py-2 rounded ${
              form.is_regular ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Regular
          </button>
        </div>

        {msg && <p className="mb-2 text-sm text-red-500">{msg}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                ></path>
              </svg>
              Creating account...
            </div>
          ) : (
            "Register"
          )}
        </button>
      </form>

      {/* ✅ Optional full-screen overlay animation */}
      {loading && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-40 flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

// src/pages/Register.jsx
import React, { useState } from "react";
import API from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    password2: "",
    is_admin: false,
    is_regular: true,
  });
  const [msg, setMsg] = useState("");
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

    try {
      await API.post("register/", {
        username: form.username,
        password: form.password,
        password2: form.password2,
        is_admin: form.is_admin,
        is_regular: form.is_regular,
      });
      setMsg("Registration successful. You may now login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const detail = err?.response?.data || err.message;
      setMsg(`Registration failed: ${JSON.stringify(detail)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded-lg shadow">
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
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <input
          name="password2"
          placeholder="Confirm password"
          type="password"
          value={form.password2}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => pickRole(true)}
            className={`flex-1 py-2 rounded ${
              form.is_admin ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => pickRole(false)}
            className={`flex-1 py-2 rounded ${
              form.is_regular ? "bg-blue-600 text-white" : "bg-gray-100"
            }`}
          >
            Regular
          </button>
        </div>

        {msg && <p className="mb-2 text-sm text-red-500">{msg}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}

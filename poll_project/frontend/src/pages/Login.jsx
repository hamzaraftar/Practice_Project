import { useState } from "react";
import API from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // start loading

    try {
      const res = await API.post("login/", credentials);
      // Save tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("username", credentials.username);

      navigate("/");
      window.location.reload();
    } catch (err) {
      setError("Invalid username or password.");
      setLoading(false); // stop loading if error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-lg shadow-md z-10"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        <input
          name="username"
          placeholder="Username"
          value={credentials.username}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={credentials.password}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded mb-3 focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
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
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </button>
      </form>

      {/* Optional full-screen loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-opacity-40 flex justify-center items-center z-0">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

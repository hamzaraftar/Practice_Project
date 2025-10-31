import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000/api/",
});

// Add token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

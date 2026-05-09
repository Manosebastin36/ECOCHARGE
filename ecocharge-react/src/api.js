import axios from "axios";

// This will use the Render URL in production and localhost during development
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add the Authorization token to every request if it exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

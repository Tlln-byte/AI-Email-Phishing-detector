// src/services/api.js
import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({ 
  baseURL: "http://localhost:8000"  // Point directly to backend
});

// Attach token to all requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler: auto-logout and redirect
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/"; // Redirect to login
    }
    return Promise.reject(error);
  }
);

export const loginUser = (credentials) => API.post("/login", credentials);
export const signupUser = (credentials) => API.post("/signup", credentials);

// Helper to handle API errors and show toast
export const handleApiError = (err, fallbackMsg) => {
  toast.error(err?.response?.data?.detail || fallbackMsg || "An error occurred.");
};

export default API;

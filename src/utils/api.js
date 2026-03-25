// ============================================================
// src/utils/api.js
// ============================================================ 
// ============================================================
console.log("API URL:", import.meta.env.VITE_API_URL);

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5175/api";

export async function apiFetch(path, options = {}) {
  // Attach saved auth token if it exists
  const token = localStorage.getItem("mporiums-token");

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Parse the response
  const data = await response.json().catch(() => ({}));

  // Throw a clean error if the request failed
  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data;
}

// ── Auth helpers ─────────────────────────────────────────────

// Login — saves token to localStorage on success
export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("mporiums-token", data.token);
  localStorage.setItem("mporiums-user", JSON.stringify(data.user));
  return data.user;
}

// Register — saves token to localStorage on success
export async function register(email, password, displayName, sellerType = "standard") {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName, sellerType }),
  });
  localStorage.setItem("mporiums-token", data.token);
  localStorage.setItem("mporiums-user", JSON.stringify(data.user));
  return data.user;
}

// Logout — clears token and user from localStorage
export function logout() {
  localStorage.removeItem("mporiums-token");
  localStorage.removeItem("mporiums-user");
}

// Get the currently logged-in user from localStorage
// (doesn't make an API call — just reads from storage)
export function getCurrentUser() {
  try {
    const user = localStorage.getItem("mporiums-user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Check if a user is logged in
export function isLoggedIn() {
  return !!localStorage.getItem("mporiums-token");
}

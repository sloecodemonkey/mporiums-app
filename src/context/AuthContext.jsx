// ============================================================
// AuthContext.jsx
// src/context/AuthContext.jsx
// ============================================================
// Shares the logged-in user across the whole app.
// Follows the exact same pattern as CartContext and WishlistContext.
//
// Any component accesses it with:
//   const { user, isLoggedIn, logout } = useAuth();
//
// What it holds:
//   user        — the logged-in user object, or null if not logged in
//                 e.g. { id, email, displayName, avatar, sellerType }
//   isLoggedIn  — true or false
//
// What it can do:
//   login(email, password)               — signs in via API
//   register(email, password, name)      — creates account via API
//   logout()                             — clears token and user
//   updateUser(updatedFields)            — updates user data locally
//
// The user is loaded from localStorage on first render so the
// logged-in state persists across page refreshes.
// ============================================================

import { createContext, useContext, useState } from "react";
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  // Load user from localStorage on first render
  // This means if you refresh the page you stay logged in
  const [user, setUser] = useState(() => getCurrentUser());

  // ── Login ────────────────────────────────────────────────
  // Calls the API, saves the token, updates user state
  async function login(email, password) {
    const loggedInUser = await apiLogin(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }

  // ── Register ─────────────────────────────────────────────
  // Creates a new account, saves the token, updates user state
  async function register(email, password, displayName, sellerType) {
    const newUser = await apiRegister(email, password, displayName, sellerType);
    setUser(newUser);
    return newUser;
  }

  // ── Logout ───────────────────────────────────────────────
  // Clears token from localStorage and resets user to null
  function logout() {
    apiLogout();
    setUser(null);
  }

  // ── Update user locally ──────────────────────────────────
  // Used by Account.jsx when the user saves profile changes
  // so the Navbar updates without needing to re-fetch
  function updateUser(updatedFields) {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem("mporiums-user", JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — any component uses this to access auth state
// import { useAuth } from "../context/AuthContext";
export function useAuth() {
  return useContext(AuthContext);
}

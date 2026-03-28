// ============================================================
// WishlistContext.jsx
// src/context/WishlistContext.jsx
// ============================================================
// Wishlist with API sync when logged in.
// Falls back to localStorage-only when logged out.
//
// Any component accesses it with one line:
//   const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchWishlist as apiFetchWishlist,
  addToWishlist as apiAdd,
  removeFromWishlist as apiRemove,
  fetchListing,
} from "../utils/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("mporiums-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("mporiums-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // Sync with API when user logs in or out
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    async function syncWishlist() {
      try {
        const ids = await apiFetchWishlist(); // [3, 7, 12, ...]
        if (ids.length === 0) {
          setWishlist([]);
          return;
        }
        // Reuse locally cached objects where available; fetch the rest
        const localById = Object.fromEntries(
          JSON.parse(localStorage.getItem("mporiums-wishlist") || "[]")
            .map((p) => [p.id, p])
        );
        const listings = await Promise.all(
          ids.map((id) => {
            const sid = String(id);
            return localById[sid]
              ? Promise.resolve(localById[sid])
              : fetchListing(sid);
          })
        );
        setWishlist(
          listings.map((p) => ({ ...p, savedAt: p.savedAt || new Date().toISOString() }))
        );
      } catch (err) {
        console.error("Wishlist sync failed:", err);
      }
    }
    syncWishlist();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function isWishlisted(productId) {
    return wishlist.some((item) => item.id === String(productId));
  }

  function toggleWishlist(product) {
    const id = String(product.id);
    const exists = wishlist.some((item) => item.id === id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== id));
      if (user) apiRemove(id).catch(console.error);
    } else {
      setWishlist((prev) => [
        ...prev,
        { ...product, savedAt: new Date().toISOString() },
      ]);
      if (user) apiAdd(id).catch(console.error);
    }
  }

  function removeFromWishlist(productId) {
    const id = String(productId);
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    if (user) apiRemove(id).catch(console.error);
  }

  function clearWishlist() {
    setWishlist([]);
  }

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      removeFromWishlist,
      isWishlisted,
      clearWishlist,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

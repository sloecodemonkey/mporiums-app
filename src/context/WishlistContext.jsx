// ============================================================
// WishlistContext.jsx
// src/context/WishlistContext.jsx
// ============================================================
// Exactly the same pattern as CartContext.jsx — a shared
// "backpack" that any component can reach into to:
//   - read the wishlist
//   - add a product
//   - remove a product
//   - check if a product is already wishlisted
//
// The wishlist persists to localStorage so it survives
// page refreshes, just like the cart does.
//
// Any component accesses it with one line:
//   const { wishlist, toggleWishlist, isWishlisted } = useWishlist();
//
// In production, sync with your backend:
//   GET  /api/wishlist         → load on app start
//   POST /api/wishlist/:id     → when adding
//   DELETE /api/wishlist/:id   → when removing
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {

  // Load saved wishlist from localStorage on first render
  // Each entry is a full product object so the Wishlist page
  // can display all details without fetching anything extra
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("mporiums-wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    localStorage.setItem("mporiums-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // ── Check if a product is already in the wishlist ──────
  // Used by ProductCard to know whether to show a filled or
  // empty heart. Takes a product id, returns true or false.
  function isWishlisted(productId) {
    return wishlist.some((item) => item.id === productId);
  }

  // ── Toggle — add if not present, remove if already there ──
  // ProductCard calls this when the heart button is clicked.
  // We store the full product object so Wishlist.jsx has
  // everything it needs to render the card (title, price, image etc.)
  function toggleWishlist(product) {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        // Already wishlisted — remove it
        return prev.filter((item) => item.id !== product.id);
      }
      // Not yet wishlisted — add it with a timestamp so we can
      // sort by "recently saved" on the Wishlist page
      return [...prev, { ...product, savedAt: new Date().toISOString() }];
    });
  }

  // ── Remove by id (used on the Wishlist page) ───────────
  function removeFromWishlist(productId) {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  }

  // ── Clear entire wishlist ──────────────────────────────
  function clearWishlist() {
    setWishlist([]);
  }

  return (
    <WishlistContext.Provider value={{
      wishlist,           // the full array of saved products
      toggleWishlist,     // add or remove by passing a product object
      removeFromWishlist, // remove by id
      isWishlisted,       // check if a product id is saved → boolean
      clearWishlist,      // empty the whole list
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

// Custom hook — any component uses this to access the wishlist
// import { useWishlist } from "../context/WishlistContext";
export function useWishlist() {
  return useContext(WishlistContext);
}

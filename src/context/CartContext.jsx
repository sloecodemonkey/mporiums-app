// ============================================================
// CartContext.jsx
// ============================================================
// This file solves a specific problem. Look at your old script.js:
//
//   var cart = [];  ← one global variable, accessible everywhere
//
// In your old site, cart was a global variable sitting at the
// top of script.js. ANY function could read or change it:
//   - addToCart()       could push to it
//   - removeFromCart()  could filter it
//   - updateCartBadge() could read it
//   - renderCart()      could read it
//
// In React, components can't share global variables like that.
// Each component is isolated. So if Cart.jsx changes the cart,
// Navbar.jsx won't know about it — the badge won't update.
//
// CartContext solves this by creating a "shared backpack" that
// ANY component in your app can reach into and:
//   - read the cart
//   - add an item
//   - remove an item
//   - update a quantity
//   - clear the whole cart
//
// You set it up ONCE here. Then any component that needs the
// cart just calls: const { cart, addToCart } = useCart();
// That's it. No prop passing. No global variables.
// ============================================================

import { createContext, useContext, useState, useEffect } from "react";

// ── STEP 1: Create the context ──────────────────────────────
// Think of this like creating the backpack.
// It starts empty — we fill it with real data in CartProvider below.
const CartContext = createContext();

// ── STEP 2: Create the Provider ─────────────────────────────
// The Provider is a wrapper component. You put it around your
// whole app in App.jsx, like this:
//
//   <CartProvider>
//     <App />
//   </CartProvider>
//
// Everything INSIDE the provider can access the cart.
// Everything OUTSIDE cannot.
export function CartProvider({ children }) {

  // The cart array — this replaces:  var cart = [];  in script.js
  // We initialise it from localStorage so the cart survives a
  // page refresh. Was: cart was lost every time the page reloaded.
  const [cart, setCart] = useState(() => {
    // Try to load a saved cart from the browser's localStorage.
    // If nothing is saved yet, start with an empty array [].
    try {
      const saved = localStorage.getItem("mporiums-cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Save cart to localStorage whenever it changes ──────────
  // Was: cart was a plain JS variable — lost on every page refresh.
  // Now: useEffect watches the cart. Any time cart changes,
  //      this runs automatically and saves it to localStorage.
  // The [cart] at the end means "run this whenever cart changes".
  useEffect(() => {
    localStorage.setItem("mporiums-cart", JSON.stringify(cart));
  }, [cart]);

  // ── ADD TO CART ────────────────────────────────────────────
  // Was: function addToCart() {
  //        var existing = jQuery.grep(cart, function(item) {
  //          return item.id === currentProduct.id;
  //        })[0];
  //        if (existing) {
  //          existing.quantity++;
  //        } else {
  //          cart.push({ id, title, price, ... quantity: 1 });
  //        }
  //        updateCartBadge();
  //      }
  //
  // Now: we receive the full product object as an argument.
  // If it already exists in the cart, increase its quantity.
  // If it's new, add it with quantity: 1.
  // setCart() triggers a re-render everywhere automatically —
  // no updateCartBadge() call needed.
  function addToCart(product) {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);

      if (existing) {
        // Item is already in the cart — just increase quantity
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Brand new item — add it with quantity 1.
      // We only store what we need in the cart (not the full product).
      return [
        ...prevCart,
        {
          id:        product.id,
          title:     product.title,
          price:     product.price,
          condition: product.condition,
          image:     product.images[0],
          seller:    product.seller,
          quantity:  1,
        },
      ];
    });
  }

  // ── REMOVE FROM CART ───────────────────────────────────────
  // Was: function removeFromCart(id) {
  //        cart = jQuery.grep(cart, function(item) { return item.id !== id; });
  //        updateCartBadge();
  //        renderCart();
  //      }
  //
  // Now: .filter() keeps every item EXCEPT the one matching the id.
  // The page updates automatically — no renderCart() needed.
  function removeFromCart(id) {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }

  // ── UPDATE QUANTITY ────────────────────────────────────────
  // Was: function updateQty(id, delta) {
  //        item.quantity += delta;
  //        if (item.quantity <= 0) { removeFromCart(id); return; }
  //        renderCart();
  //      }
  //
  // Now: .map() updates the matching item's quantity.
  //      .filter() at the end removes it if quantity drops to 0.
  //      delta is +1 (increase) or -1 (decrease).
  function updateQty(id, delta) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // ── CLEAR ENTIRE CART ──────────────────────────────────────
  // Was: function clearCartAll() { cart = []; updateCartBadge(); renderCart(); }
  // Now: just set cart back to an empty array.
  function clearCart() {
    setCart([]);
  }

  // ── CART TOTALS ────────────────────────────────────────────
  // Was: function getCartTotals() { ... return { subtotal, shipping, tax, total }; }
  // Now: we calculate these here once and share them with every component.
  // Any component that needs the total just reads: const { totals } = useCart();
  const subtotal  = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping  = subtotal > 500 ? 0 : subtotal === 0 ? 0 : 14.99;
  const tax       = subtotal * 0.08;
  const total     = subtotal + shipping + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totals = { subtotal, shipping, tax, total, itemCount };

  // ── STEP 3: Provide everything to the app ──────────────────
  // This is what gets put into the "shared backpack".
  // Any component that calls useCart() gets access to all of this.
  return (
    <CartContext.Provider
      value={{
        cart,         // the cart array itself
        totals,       // subtotal, shipping, tax, total, itemCount
        addToCart,    // function to add a product
        removeFromCart, // function to remove by id
        updateQty,    // function to change quantity (+1 or -1)
        clearCart,    // function to empty the whole cart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── STEP 4: Create the useCart hook ─────────────────────────
// This is the easy way for any component to access the cart.
// Instead of writing:
//   const { cart } = useContext(CartContext);
// Any component can just write:
//   const { cart, addToCart } = useCart();
//
// Export this so every component can import it:
//   import { useCart } from "../context/CartContext";
export function useCart() {
  return useContext(CartContext);
}

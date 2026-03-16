// ============================================================
// Cart.jsx
// Converted from renderCart(), getCartTotals(), updateQty(),
// removeFromCart(), and clearCartAll() in script.js
// ============================================================
// In your old code, the cart page was an empty HTML skeleton:
//
//   <div id="cartItems"><!-- Populated by JS --></div>
//
// ...and jQuery's renderCart() injected HTML strings into it.
// Every time the cart changed, renderCart() ran again and
// rebuilt the entire HTML from scratch.
//
// In React, we just describe what the cart LOOKS LIKE based
// on the cart array. When the array changes, React automatically
// updates only the parts of the screen that changed.
// No manual re-rendering needed at all.
//
// Props received:
//   cart      → the cart array from App.jsx
//               e.g. [{ id, title, price, image, seller, condition, quantity }]
//   setCart   → the function to update the cart (from App.jsx)
// ============================================================

import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Cart() {

  // ----------------------------------------------------------
  // GET CART FROM CONTEXT
  // ----------------------------------------------------------
  // Was: cart was passed in as a prop from App.jsx — { cart, setCart }
  // Now: we pull everything we need from CartContext in one line.
  // cart       → the array of items
  // totals     → subtotal, shipping, tax, total, itemCount (pre-calculated)
  // removeFromCart, updateQty, clearCart → functions to mutate the cart
  const { cart, totals, removeFromCart, updateQty, clearCart } = useCart();

  // Pull individual totals out for easy use in the JSX below
  const { subtotal, shipping, tax, total, itemCount } = totals;

  // ----------------------------------------------------------
  // JSX — replaces the HTML skeleton + renderCart() output
  // ----------------------------------------------------------

  return (
    <main className="page-main">
      <div className="container">

        {/* Breadcrumb
            Was: <a href="#" onclick="showPage('shop')">← Continue Shopping</a> */}
        <div className="breadcrumb">
          <Link to="/shop" className="link-primary">← Continue Shopping</Link>
        </div>

        {/* Page title with item count
            Was: <h1>Shopping Cart <span id="cartItemCount"></span></h1>
                 jQuery("#cartItemCount").text("(" + t.items + ")")
            Now: we calculate itemCount above and render it directly */}
        <h1 className="page-title">
          Shopping Cart{" "}
          {itemCount > 0 && (
            <span className="text-muted">({itemCount})</span>
          )}
        </h1>

        {/* ── EMPTY STATE ──
            Was: jQuery("#cartEmpty").show() / hide()
                 The HTML had display:none by default, shown by jQuery.
            Now: {cart.length === 0 && (...)} — only renders when cart is empty.
                 When the cart has items, this block simply doesn't exist on the page. */}
        {cart.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h2 className="empty-title">Your cart is empty</h2>
            <p className="text-muted">
              Discover amazing deals on music gear, instruments, and audio equipment.
            </p>
            <Link
              to="/shop"
              className="btn btn-primary btn-lg"
              style={{ marginTop: "1.5rem" }}
            >
              Browse the Shop
            </Link>
          </div>
        )}

        {/* ── CART CONTENT ──
            Was: jQuery("#cartContent").show() / hide()
            Now: {cart.length > 0 && (...)} — only renders when cart has items */}
        {cart.length > 0 && (
          <div className="cart-layout">

            {/* ── LEFT COLUMN: Cart Items ── */}
            <div className="cart-items">

              {/* Clear all button */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
                <button className="btn btn-outline" onClick={clearCart}>
                  Clear All
                </button>
              </div>

              {/* Loop through cart items
                  Was: jQuery.map(cart, function(item) { return '<div class="cart-item">...' })
                  Now: cart.map() — for each item, render a cart row.
                  The key={item.id} is required so React can track each item efficiently. */}
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>

                  {/* Item image — clicking goes to product detail page */}
                  <Link to={`/product/${item.id}`} className="cart-item-image">
                    <img src={item.image} alt={item.title} />
                  </Link>

                  <div className="cart-item-info">
                    <div>
                      {/* Item title — also a link to product detail */}
                      <Link to={`/product/${item.id}`} className="cart-item-title">
                        {item.title}
                      </Link>
                      {/* Condition and seller info */}
                      <p className="cart-item-meta">
                        {item.condition} · Sold by {item.seller}
                      </p>
                    </div>

                    <div className="cart-item-bottom">

                      {/* Quantity controls
                          Was: onclick="updateQty('1', -1)" and onclick="updateQty('1', 1)"
                          Now: onClick calls updateQty with the item's id and a +1 or -1 */}
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {/* Remove button
                            Was: onclick="removeFromCart('1')"
                            Now: onClick={() => removeFromCart(item.id)} */}
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          🗑️
                        </button>

                        {/* Line total: price × quantity
                            Was: '$' + (item.price * item.quantity).toLocaleString() */}
                        <span className="cart-item-price">
                          ${(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── RIGHT COLUMN: Order Summary ── */}
            <div className="cart-summary">
              <div className="summary-card">
                <h2 className="summary-title">Order Summary</h2>
                <hr className="separator" />

                {/* Summary rows
                    Was: jQuery("#cartSubtotal").text("$" + t.subtotal.toLocaleString())
                    Now: we just render the values we calculated at the top of this component.
                    No jQuery, no IDs, no manual updates needed. */}
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  {/* Show "Free" when shipping is 0, otherwise show the amount
                      Was: t.shipping === 0 ? "Free" : "$" + t.shipping.toFixed(2) */}
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="summary-row">
                  <span>Estimated Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <hr className="separator" />

                <div className="summary-total">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Free shipping note — only show when shipping is 0
                    Was: jQuery("#freeShippingNote").toggle(t.shipping === 0) */}
                {shipping === 0 && (
                  <p className="free-shipping-note">
                    🎉 You qualify for free shipping!
                  </p>
                )}

                {/* Checkout button
                    Was: <a href="#" onclick="showPage('checkout')"> */}
                <Link
                  to="/checkout"
                  className="btn btn-primary btn-lg btn-full"
                  style={{ marginTop: "1.5rem" }}
                >
                  Proceed to Checkout
                </Link>

                <div className="secure-note">
                  🛡️ Secure checkout · Buyer protection included
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;

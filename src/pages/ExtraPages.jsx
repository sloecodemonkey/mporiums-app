// ============================================================
// PaymentSuccess.jsx
// Converted from #page-payment-success in index.html
// ============================================================
// Was: shown by handleCheckout() calling showPage("payment-success")
// Now: a standalone page at /success rendered by React Router

import { Link } from "react-router-dom";

export function PaymentSuccess() {
  return (
    <main className="page-main center-content" style={{ paddingTop: "64px" }}>
      <div className="success-content animate-fade-in">
        <div className="success-icon">✅</div>
        <h1 className="page-title">Payment Successful!</h1>
        <p className="text-muted" style={{ maxWidth: "28rem" }}>
          Thank you for your purchase. You'll receive a confirmation email
          shortly with your order details.
        </p>
        <div className="success-actions">
          {/* Was: onclick="showPage('shop')" */}
          <Link to="/shop" className="btn btn-primary">🛍️ Continue Shopping</Link>
          <Link to="/" className="btn btn-outline">Back to Home</Link>
        </div>
      </div>
    </main>
  );
}

// ============================================================
// NotFound.jsx
// Converted from #page-404 in index.html
// ============================================================
// Was: shown by showPage("404") — you had to call it manually.
// Now: React Router shows this automatically for any URL that
//      doesn't match a defined route. Add it to App.jsx as:
//      <Route path="*" element={<NotFound />} />
//      The * means "match anything that hasn't matched above"

export function NotFound() {
  return (
    <main className="page-main center-content">
      <div className="text-center">
        <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
        <p className="text-muted" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Oops! Page not found
        </p>
        {/* Was: onclick="showPage('home')" */}
        <Link to="/" className="link-primary">Return to Home</Link>
      </div>
    </main>
  );
}

// ============================================================
// Checkout.jsx
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

// Steps:
//   auth-choice → login | register → verify
//   → shipping-select | shipping → processing

function Checkout() {
  const { cart, totals } = useCart();
  const { subtotal, shipping, tax, total } = totals;
  const { user, login, register, verifyEmail } = useAuth();

  const [step, setStep] = useState(() => (user ? "shipping-select" : "auth-choice"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  // ── Auth form fields ─────────────────────────────────────
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    verificationCode: "",
  });
  const [emailChecked, setEmailChecked] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  // ── Shipping ─────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [shipForm, setShipForm] = useState({
    name: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
  });

  // When user becomes available (on mount or after login/verify),
  // load their saved addresses and go to shipping-select.
  useEffect(() => {
    if (!user) return;
    apiFetch(`/checkout/shipping-addresses?userId=${user.id}`)
      .then((data) => {
        const addrs = data.addresses || [];
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) setSelectedAddress(def);
      })
      .catch(() => {})
      .finally(() => setStep("shipping-select"));
  }, [user?.id]);

  // ── Field helpers ────────────────────────────────────────
  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleShipChange(e) {
    const { name, value } = e.target;
    setShipForm((prev) => ({ ...prev, [name]: value }));
  }

  function clearMessages() {
    setError("");
    setInfo("");
  }

  // ── LOGIN ────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await login(form.email, form.password);
      // useEffect on user?.id handles step → "shipping-select"
    } catch (err) {
      if (err.message === "email_not_verified") {
        setPendingEmail(form.email);
        setStep("verify");
      } else {
        setError(err.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  // ── REGISTER step 1: check email ─────────────────────────
  async function handleEmailCheck(e) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const data = await apiFetch("/auth/check-email", {
        method: "POST",
        body: JSON.stringify({ email: form.email }),
      });
      if (data.exists) {
        setError("An account with this email already exists. Please sign in.");
        setStep("login");
        return;
      }
      setEmailChecked(true);
    } catch (err) {
      setError(err.message || "Failed to check email");
    } finally {
      setLoading(false);
    }
  }

  // ── REGISTER step 2: create account ─────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    clearMessages();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, {
        firstName: form.firstName,
        lastName: form.lastName,
      });
      setPendingEmail(form.email);
      setStep("verify");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  // ── VERIFY ───────────────────────────────────────────────
  async function handleVerify(e) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      await verifyEmail(pendingEmail, form.verificationCode);
      // useEffect on user?.id handles step → "shipping-select"
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    clearMessages();
    setLoading(true);
    try {
      await apiFetch("/auth/resend-code", {
        method: "POST",
        body: JSON.stringify({ email: pendingEmail }),
      });
      setInfo("Verification code resent! Check your email.");
    } catch (err) {
      setError(err.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  }

  // ── SHIPPING ─────────────────────────────────────────────
  async function handleShippingSubmit(e) {
    e.preventDefault();
    await initiateCheckout(shipForm);
  }

  async function handleContinueWithSelected() {
    if (selectedAddress) await initiateCheckout(selectedAddress);
  }

  async function initiateCheckout(address) {
    setStep("processing");
    clearMessages();
    try {
      const data = await apiFetch("/checkout/initiate", {
        method: "POST",
        body: JSON.stringify({
          items: cart,
          shippingAddress: address,
          userId: user?.id,
          buyerEmail: user?.email || form.email,
          buyerFirstName: user?.first_name || form.firstName,
          buyerLastName: user?.last_name || form.lastName,
          saveAddress: saveAddress && !!user,
          successUrl: `${window.location.origin}/success`,
          cancelUrl: window.location.origin,
        }),
      });
      window.location.href = data.stripeSessionUrl;
    } catch (err) {
      setError(err.message || "Checkout failed");
      setStep(user ? "shipping-select" : "shipping");
    }
  }

  // ── Inline error / info banners ──────────────────────────
  function ErrorBanner() {
    if (!error) return null;
    return (
      <p style={{
        color: "var(--destructive)",
        fontSize: "0.875rem",
        marginBottom: "1rem",
        padding: "0.6rem 0.75rem",
        background: "var(--muted)",
        borderRadius: "var(--radius)",
        border: "0.5px solid var(--destructive)",
      }}>{error}</p>
    );
  }

  function InfoBanner() {
    if (!info) return null;
    return (
      <p style={{
        fontSize: "0.875rem",
        marginBottom: "1rem",
        padding: "0.6rem 0.75rem",
        background: "var(--muted)",
        borderRadius: "var(--radius)",
        border: "0.5px solid var(--primary)",
        color: "var(--primary)",
      }}>{info}</p>
    );
  }

  // ── Step content ─────────────────────────────────────────
  function renderStep() {

    // AUTH CHOICE
    if (step === "auth-choice") return (
      <div className="form-card">
        <h2 className="form-card-title">Sign In to Checkout</h2>
        <hr className="separator" />
        <ErrorBanner />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button
            className="btn btn-primary btn-full"
            onClick={() => { clearMessages(); setStep("login"); }}
          >
            Sign In
          </button>
          <p className="text-muted" style={{ textAlign: "center", margin: 0 }}>or</p>
          <button
            className="btn btn-outline btn-full"
            onClick={() => { clearMessages(); setStep("register"); }}
          >
            Create Account
          </button>
        </div>
      </div>
    );

    // LOGIN
    if (step === "login") return (
      <div className="form-card">
        <h2 className="form-card-title">Sign In</h2>
        <hr className="separator" />
        <ErrorBanner />
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleFormChange} required
              placeholder="you@example.com" autoFocus
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleFormChange} required placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <button
            type="button" className="btn btn-outline btn-full"
            style={{ marginTop: "0.5rem" }}
            onClick={() => { clearMessages(); setStep("auth-choice"); }}
          >
            Back
          </button>
        </form>
      </div>
    );

    // REGISTER
    if (step === "register") return (
      <div className="form-card">
        <h2 className="form-card-title">Create Account</h2>
        <hr className="separator" />
        <ErrorBanner />
        {!emailChecked ? (
          <form onSubmit={handleEmailCheck}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleFormChange} required
                placeholder="you@example.com" autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Checking..." : "Continue"}
            </button>
            <button
              type="button" className="btn btn-outline btn-full"
              style={{ marginTop: "0.5rem" }}
              onClick={() => { clearMessages(); setStep("auth-choice"); }}
            >
              Back
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email" value={form.email} disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text" name="firstName" value={form.firstName}
                  onChange={handleFormChange} required placeholder="John"
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text" name="lastName" value={form.lastName}
                  onChange={handleFormChange} required placeholder="Doe"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleFormChange} required placeholder="At least 8 characters"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password" name="confirmPassword" value={form.confirmPassword}
                onChange={handleFormChange} required placeholder="Repeat password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <button
              type="button" className="btn btn-outline btn-full"
              style={{ marginTop: "0.5rem" }}
              onClick={() => { clearMessages(); setEmailChecked(false); setStep("auth-choice"); }}
            >
              Back
            </button>
          </form>
        )}
      </div>
    );

    // VERIFY
    if (step === "verify") return (
      <div className="form-card">
        <h2 className="form-card-title">Verify Your Email</h2>
        <hr className="separator" />
        <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
          We sent a 6-digit code to <strong>{pendingEmail}</strong>.
        </p>
        <ErrorBanner />
        <InfoBanner />
        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text" name="verificationCode" value={form.verificationCode}
              onChange={handleFormChange} required maxLength={6}
              placeholder="123456" autoFocus
              style={{ textAlign: "center", letterSpacing: "0.3em", fontSize: "1.5rem" }}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>
        <p className="text-muted" style={{ marginTop: "1rem", textAlign: "center", fontSize: "0.875rem" }}>
          Didn't receive the code?{" "}
          <button className="link-primary" onClick={handleResendCode} disabled={loading}>
            Resend
          </button>
        </p>
      </div>
    );

    // SHIPPING SELECT (saved addresses)
    if (step === "shipping-select") return (
      <div className="form-card">
        <h2 className="form-card-title">Shipping Address</h2>
        <hr className="separator" />
        <ErrorBanner />
        {savedAddresses.length > 0 ? (
          <>
            <p className="text-muted" style={{ marginBottom: "1rem" }}>
              Select a saved address or enter a new one.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {savedAddresses.map((addr) => (
                <label
                  key={addr.id}
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--radius)",
                    border: selectedAddress?.id === addr.id
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border)",
                    cursor: "pointer",
                    background: "var(--card)",
                  }}
                >
                  <input
                    type="radio" name="savedAddress"
                    checked={selectedAddress?.id === addr.id}
                    onChange={() => setSelectedAddress(addr)}
                    style={{ display: "none" }}
                  />
                  <p style={{ fontWeight: 600, margin: 0 }}>{addr.firstName} {addr.lastName}</p>
                  <p className="text-muted" style={{ margin: 0, fontSize: "0.875rem" }}>
                    {addr.address}, {addr.city}, {addr.state} {addr.zip}
                  </p>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {selectedAddress && (
                <button
                  className="btn btn-primary btn-full"
                  onClick={handleContinueWithSelected} disabled={loading}
                >
                  {loading ? "Processing..." : "Continue to Payment"}
                </button>
              )}
              <button
                className="btn btn-outline btn-full"
                onClick={() => { clearMessages(); setStep("shipping"); }}
              >
                Use a Different Address
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted" style={{ marginBottom: "1rem" }}>
              Enter your shipping address to continue.
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={() => setStep("shipping")}
            >
              Enter Address
            </button>
          </>
        )}
      </div>
    );

    // SHIPPING FORM
    if (step === "shipping") return (
      <div className="form-card">
        <h2 className="form-card-title">Shipping Address</h2>
        <hr className="separator" />
        <ErrorBanner />
        <form onSubmit={handleShippingSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text" name="firstName" value={shipForm.name}
              onChange={handleShipChange} required placeholder="John"
            />
          </div>
          <div className="form-group">
            <label>Street Address</label>
            <input
              type="text" name="address" value={shipForm.addressLine1}
              onChange={handleShipChange} required placeholder="123 Main St"
            />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>City</label>
              <input
                type="text" name="city" value={shipForm.city}
                onChange={handleShipChange} required placeholder="Los Angeles"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text" name="state" value={shipForm.state}
                onChange={handleShipChange} required placeholder="CA"
              />
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text" name="zip" value={shipForm.zip}
                onChange={handleShipChange} required placeholder="90001"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel" name="phone" value={shipForm.phone}
                onChange={handleShipChange} required placeholder="(555) 123-4567"
              />
            </div>
          </div>
          {user && (
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", cursor: "pointer" }}>
              <input
                type="checkbox" checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
              />
              <span style={{ fontSize: "0.875rem" }}>Save this address for future orders</span>
            </label>
          )}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? "Processing..." : "Continue to Payment"}
          </button>
          {(savedAddresses.length > 0 || !user) && (
            <button
              type="button" className="btn btn-outline btn-full"
              style={{ marginTop: "0.5rem" }}
              onClick={() => { clearMessages(); setStep(user ? "shipping-select" : "auth-choice"); }}
            >
              Back
            </button>
          )}
        </form>
      </div>
    );

    // PROCESSING
    if (step === "processing") return (
      <div className="form-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <div style={{
          width: "3rem", height: "3rem", border: "3px solid var(--border)",
          borderTop: "3px solid var(--primary)", borderRadius: "50%",
          animation: "spin 0.8s linear infinite", margin: "0 auto 1.5rem",
        }} />
        <h2 className="form-card-title" style={{ margin: "0 0 0.5rem" }}>Processing...</h2>
        <p className="text-muted">Redirecting you to secure payment.</p>
      </div>
    );
  }

  // ── JSX ──────────────────────────────────────────────────
  return (
    <main className="page-main">
      <div className="container">

        <div className="breadcrumb">
          <Link to="/cart" className="link-primary">← Back to Cart</Link>
        </div>

        <h1 className="page-title">Checkout</h1>

        <div className="checkout-layout">

          {/* LEFT: step content */}
          <div className="checkout-form">
            {renderStep()}

            {/* Payment info — only relevant during shipping steps */}
            {(step === "shipping" || step === "shipping-select") && (
              <div className="form-card">
                <h2 className="form-card-title">Payment</h2>
                <hr className="separator" />
                <div className="info-box">
                  <span>💳</span>
                  <div>
                    <p className="info-box-title">Secure Card Payment via Stripe</p>
                    <p className="text-muted text-xs">
                      You'll be redirected to Stripe's secure checkout to complete payment.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: order summary */}
          <div className="checkout-summary">
            <div className="summary-card sticky">
              <h2 className="summary-title">Order Summary</h2>
              <hr className="separator" />

              <div className="checkout-items">
                {cart.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <img src={item.image} alt={item.title} />
                    <div className="checkout-item-info">
                      <p className="checkout-item-title">{item.title}</p>
                      <p className="checkout-item-qty">Qty: {item.quantity}</p>
                    </div>
                    <span className="checkout-item-price">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="separator" />

              <div className="summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
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

              <div className="secure-note">
                🛡️ Secure checkout · Buyer protection included
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

export default Checkout;

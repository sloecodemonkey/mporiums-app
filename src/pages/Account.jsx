// ============================================================
// Account.jsx
// Converted from #page-account in index.html and
// handleSaveProfile() in script.js
// ============================================================
// The account page is the simplest remaining page — it's
// mostly a static form. Your old script.js only had one
// function for it:
//
//   function handleSaveProfile(e) {
//     e.preventDefault();
//     alert("Profile saved! (Requires backend integration)");
//   }
//
// In React the conversion is straightforward:
//   - All form inputs become controlled with useState
//   - onsubmit="handleSaveProfile(event)" → onSubmit={handleSaveProfile}
//   - class="" → className=""
//   - The purchase history section stays as-is (empty state for now)
//
// In a real app with a backend, you would:
//   1. Fetch the user's saved profile on load with useEffect
//   2. Pre-fill the inputs with the fetched data
//   3. POST the form data to your API on submit
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";

function Account() {

  // ----------------------------------------------------------
  // SCROLL TO TOP
  // ----------------------------------------------------------

  function handleScrollToTop() {
    window.scrollTo(0, 0);
  }

  // ----------------------------------------------------------
  // STATE — one object holding all form field values
  // ----------------------------------------------------------
  // Was: plain HTML inputs with no JS tracking their values.
  //      handleSaveProfile() just showed an alert — it never
  //      actually read any of the input values.
  //
  // Now: all inputs are controlled — React tracks every value.
  //      When you connect a real backend, you just read from
  //      this state object and POST it to your API.
  const [profile, setProfile] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  // Saved confirmation message
  // Shows briefly after clicking Save Changes — nicer than an alert
  const [saved, setSaved] = useState(false);

  // ----------------------------------------------------------
  // HELPER — update a single field in the profile object
  // ----------------------------------------------------------
  // Instead of writing a separate onChange handler for each input,
  // this one function handles all of them.
  // e.target.name matches the name="" attribute on each input.
  // e.target.value is what the user typed.
  //
  // The ...profile spread keeps all the other fields intact —
  // we only update the one field that changed.
  function handleChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  // ----------------------------------------------------------
  // SAVE PROFILE
  // ----------------------------------------------------------
  // Was: function handleSaveProfile(e) {
  //        e.preventDefault();
  //        alert("Profile saved! (Requires backend integration)");
  //      }
  // Now: same placeholder, but we show an inline confirmation
  //      instead of a browser alert, and the profile state is
  //      ready to be sent to a real API when you add one.
  function handleSaveProfile(e) {
    e.preventDefault();
    // In production: POST profile data to your backend here
    // e.g. await fetch("/api/profile", { method: "POST", body: JSON.stringify(profile) })
    setSaved(true);
    setTimeout(() => setSaved(false), 3000); // hide after 3 seconds
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (
    <main className="page-main">
      <div className="container narrow">

        <h1 className="page-title">My Account</h1>
        <p className="text-muted">
          Manage your profile, payment info, and view purchase history
        </p>

        {/* Was: <form onsubmit="handleSaveProfile(event)" class="account-form">
            Now: onSubmit={handleSaveProfile} className="account-form" */}
        <form onSubmit={handleSaveProfile} className="account-form">

          {/* ── PROFILE CARD ── */}
          <div className="form-card">
            <h2 className="form-card-title">
              <img
                src="/icons/user.svg"
                alt="Profile"
                style={{ width: "1.5rem", height: "1.5rem", display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }}
              />
              Profile
            </h2>
            <hr className="separator" />

            {/* Email — disabled, cannot be changed
                Was: <input value="user@example.com" disabled>
                In a real app, you'd populate this from the logged-in user's data */}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value="user@example.com"
                disabled
                className="input-disabled"
                readOnly
              />
              <p className="text-xs text-muted">Email cannot be changed here</p>
            </div>

            {/* Controlled inputs — value comes from profile state,
                onChange calls handleChange which updates only that field.
                name="" must match the key in the profile state object. */}
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                name="displayName"
                placeholder="Your profile name"
                value={profile.displayName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Your first name"
                value={profile.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Your last name"
                value={profile.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="(555) 123-4567"
                value={profile.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ── ADDRESS CARD ── */}
          <div className="form-card">
            <h2 className="form-card-title">
              <img
                src="/icons/map.svg"
                alt="Address"
                style={{ width: "1.5rem", height: "1.5rem", display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }}
              />
              Address
            </h2>
            <hr className="separator" />

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address"
                placeholder="123 Main St"
                value={profile.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-grid-2">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Los Angeles"
                  value={profile.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="California"
                  value={profile.state}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="form-group half">
              <label>ZIP Code</label>
              <input
                type="text"
                name="zip"
                placeholder="90001"
                value={profile.zip}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* ── PAYMENT INFO CARD ── */}
          {/* Static — no inputs needed, Stripe handles payment details */}
          <div className="form-card">
            <h2 className="form-card-title">
              <img
                src="/icons/credit-card.svg"
                alt="Payment"
                style={{ width: "1.5rem", height: "1.5rem", display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }}
              />
              Payment Information
            </h2>
            <hr className="separator" />
            <div className="info-box">
              <span>💳</span>
              <div>
                <p className="info-box-title">Payments handled by Stripe</p>
                <p className="text-xs text-muted">
                  Your card details are securely managed by Stripe during checkout.
                  We never store your payment information.
                </p>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON + inline confirmation
              Was: <button type="submit">💾 Save Changes</button>
                   followed by an alert() popup
              Now: button submits the form, a brief "Saved!" message
                   appears below it for 3 seconds then disappears */}
          <button type="submit" className="btn btn-primary btn-lg">
            💾 Save Changes
          </button>

          {/* {saved && (...)} only shows for 3 seconds after saving */}
          {saved && (
            <p style={{ color: "var(--accent)", marginTop: "0.75rem", fontWeight: 500 }}>
              ✓ Profile saved successfully!
            </p>
          )}
        </form>

        {/* ── PURCHASE HISTORY ── */}
        {/* Was: <div id="purchaseHistory"> with a static empty state inside
            In a real app, you'd fetch orders from your backend here with useEffect
            and map over them. For now we show the same empty state. */}
        <div className="purchase-history">
          <div className="form-card">
            <h2 className="form-card-title">
              <img
                src="/icons/box.svg"
                alt="Purchase History"
                style={{ width: "1.5rem", height: "1.5rem", display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }}
              />
              Purchase History
            </h2>
            <hr className="separator" />

            {/* Empty state — shown until real order data is connected */}
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <p className="empty-title">No purchases yet</p>
              <p className="text-muted text-xs">
                Your order history will appear here after your first purchase.
              </p>
              {/* Was: onclick="showPage('shop')" */}
              <Link
                to="/shop"
                className="btn btn-outline btn-sm"
                style={{ marginTop: "1rem" }}
                onClick={handleScrollToTop}
              >
                Browse Shop
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

export default Account;

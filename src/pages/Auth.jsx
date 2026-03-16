// ============================================================
// Auth.jsx
// Converted from #page-auth in index.html and
// toggleAuthMode(), handleAuth(), handleProfilePictureUpload()
// in script.js
// ============================================================
// Your old auth page used jQuery to swap text content across
// 5 different elements every time the mode toggled, plus a
// separate global variable to track the current mode:
//
//   var isLoginMode = true;
//
//   function toggleAuthMode() {
//     isLoginMode = !isLoginMode;
//     jQuery("#authTitle").text(isLoginMode ? "Welcome Back" : "Create Account");
//     jQuery("#authSubtitle").text(...);
//     jQuery("#authSubmitBtn").text(...);
//     jQuery("#authToggleText").text(...);
//     jQuery("#authToggleBtn").text(...);
//     jQuery("#signupFields").toggle(!isLoginMode);
//   }
//
// In React, we store ONE boolean in state: isLoginMode.
// All five text changes and the show/hide become inline
// expressions in the JSX. No function needed at all —
// flipping the boolean re-renders everything automatically.
// ============================================================

import { useState, useRef } from "react";

function Auth() {

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  // Was: var isLoginMode = true  (global variable in script.js)
  // Now: local state — true = Sign In mode, false = Sign Up mode
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Profile picture preview for signup
  // Was: jQuery("#profilePicturePreview").html('<img src="..." />')
  // Now: we store the image data URL in state and render it directly
  const [profilePreview, setProfilePreview] = useState(null);

  // Hidden file input ref — lets us click it programmatically
  // Was: onclick="document.getElementById('profilePictureInput').click()"
  // Now: fileInputRef.current.click() does the same thing
  const fileInputRef = useRef(null);

  // ----------------------------------------------------------
  // FUNCTIONS
  // ----------------------------------------------------------

  // Toggle between Sign In and Sign Up
  // Was: function toggleAuthMode() {
  //        isLoginMode = !isLoginMode;
  //        jQuery("#authTitle").text(...) × 5 times
  //        jQuery("#signupFields").toggle(!isLoginMode);
  //      }
  // Now: just flip the boolean — all the text updates happen
  //      automatically in JSX using ternary expressions below
  function toggleMode() {
    setIsLoginMode(!isLoginMode);
    setProfilePreview(null); // reset preview when switching modes
  }

  // Handle profile picture file upload (signup only)
  // Was: function handleProfilePictureUpload(event) {
  //        var reader = new FileReader();
  //        reader.onload = function(e) {
  //          jQuery("#profilePicturePreview").html('<img src="..." />')
  //        };
  //        reader.readAsDataURL(file);
  //      }
  // Now: same FileReader logic, but we save the result to state
  //      instead of injecting HTML. React renders the preview automatically.
  function handleProfilePictureUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size — same check as your original
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type — same check as your original
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Read the file and save the result as a data URL in state
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  // Handle form submission
  // Was: function handleAuth(e) {
  //        e.preventDefault();
  //        alert(isLoginMode ? "Sign in..." : "Sign up...");
  //      }
  // Same logic — just a placeholder until you add a real backend
  function handleAuth(e) {
    e.preventDefault();
    alert(
      isLoginMode
        ? "Sign in functionality requires backend integration."
        : "Sign up functionality requires backend integration."
    );
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (
    <main className="page-main center-content">
      <div className="auth-card">

        {/* TITLE
            Was: <h1 id="authTitle">Welcome Back</h1>
                 jQuery("#authTitle").text(isLoginMode ? "Welcome Back" : "Create Account")
            Now: the ternary runs right here in JSX — no jQuery, no ID needed */}
        <h1 className="auth-title">
          {isLoginMode ? "Welcome Back" : "Create Account"}
        </h1>

        {/* SUBTITLE
            Was: <p id="authSubtitle">Sign in to manage your listings</p>
                 jQuery("#authSubtitle").text(...) */}
        <p className="text-muted">
          {isLoginMode
            ? "Sign in to manage your listings"
            : "Join the marketplace and start selling"}
        </p>

        <form onSubmit={handleAuth} style={{ marginTop: "2rem" }}>

          {/* SIGNUP-ONLY FIELDS
              Was: <div id="signupFields" style="display:none;">
                   shown/hidden with jQuery("#signupFields").toggle(!isLoginMode)
              Now: {!isLoginMode && (...)} — only renders when in signup mode */}
          {!isLoginMode && (
            <div>

              {/* Profile picture upload */}
              <div className="form-group">
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Profile Picture
                </label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>

                  {/* Preview circle
                      Was: <div id="profilePicturePreview">👤</div>
                           jQuery injected an <img> tag inside it on upload
                      Now: we conditionally render either the uploaded image
                           or the default emoji — based on profilePreview state */}
                  <div style={{
                    width: "6rem", height: "6rem",
                    border: "2px solid var(--border)", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "var(--card)", fontSize: "2rem",
                    color: "var(--muted-foreground)", overflow: "hidden"
                  }}>
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      "👤"
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Upload area
                        Was: onclick="document.getElementById('profilePictureInput').click()"
                        Now: onClick={() => fileInputRef.current.click()} does the same */}
                    <div
                      className="upload-area"
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        margin: 0, padding: "1rem", textAlign: "center",
                        border: "2px dashed var(--border)",
                        borderRadius: "var(--radius)", cursor: "pointer",
                        background: "var(--card)"
                      }}
                    >
                      <span className="upload-text" style={{ fontSize: "0.875rem" }}>
                        Click to upload profile picture
                      </span>
                    </div>

                    {/* Hidden file input
                        Was: <input id="profilePictureInput" onchange="handleProfilePictureUpload(event)">
                        Now: ref={fileInputRef} + onChange={handleProfilePictureUpload} */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleProfilePictureUpload}
                    />
                    <p className="text-xs text-muted" style={{ marginTop: "0.5rem" }}>
                      JPG, PNG. Max 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Signup-only text fields */}
              <div className="form-group">
                <label>Display Name</label>
                <input type="text" name="displayName" placeholder="Your profile name" />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" name="firstName" placeholder="Your first name" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" name="lastName" placeholder="Your last name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="(555) 123-4567" />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input type="text" name="address" placeholder="123 Main St" />
              </div>
              <div className="form-grid-2">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" placeholder="Los Angeles" />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" name="state" placeholder="California" />
                </div>
              </div>
              <div className="form-group">
                <label>ZIP Code</label>
                <input type="text" name="zip" placeholder="90001" />
              </div>
            </div>
          )}

          {/* Fields shown in BOTH modes */}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" required minLength={6} placeholder="••••••••" />
          </div>

          {/* SUBMIT BUTTON
              Was: <button id="authSubmitBtn">Sign In</button>
                   jQuery("#authSubmitBtn").text(isLoginMode ? "Sign In" : "Sign Up")
              Now: text is a ternary right inside the button */}
          <button type="submit" className="btn btn-primary btn-full">
            {isLoginMode ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <hr className="separator" />

        {/* TOGGLE LINK
            Was: <span id="authToggleText">Don't have an account?</span>
                 <button onclick="toggleAuthMode()" id="authToggleBtn">Sign up</button>
                 Both updated individually with jQuery
            Now: both are ternaries, toggleMode() flips isLoginMode */}
        <p className="auth-toggle">
          <span style={{ marginRight: "25px" }}>
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button
            className="link-primary"
            onClick={toggleMode}
            style={{ fontSize: "0.65625rem" }}
          >
            {isLoginMode ? "Sign up" : "Sign in"}
          </button>
        </p>

      </div>
    </main>
  );
}

export default Auth;

// ============================================================
// Navbar.jsx
// Converted from index.html + script.js for M.Poriums
// ============================================================

// STEP 1: Import the tools we need from React
// Think of these like ingredients you pull out before cooking.
// - useState: lets us remember things (is the menu open? is dark mode on?)
// - useEffect: lets us run code when the page first loads
import { useState, useEffect } from "react";

// STEP 2: Import Link and useNavigate from React Router
// In your old HTML, you used onclick="showPage('shop')" to change pages.
// In React, we use <Link> tags and useNavigate() instead.
// Link = a clickable link that changes the page without a full reload
// useNavigate = a function that changes the page from inside your code (e.g. after a search)
import { Link, useNavigate } from "react-router-dom";

// useCart gives us the cart from CartContext — no prop needed anymore
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

// ============================================================
// The Navbar Component
// ============================================================
// In your old code, the navbar was just HTML sitting in index.html.
// Now it's a self-contained function that manages its own logic.
//
// No props needed anymore — cart comes from CartContext via useCart()
function Navbar() {

  // Get cart data from CartContext
  const { totals } = useCart();

  // Get wishlist count from WishlistContext — shows the badge on the heart icon
  const { wishlist } = useWishlist();

  // ----------------------------------------------------------
  // STATE — these replace your global JS variables in script.js
  // ----------------------------------------------------------

  // Was:  jQuery("#mobileMenu").slideToggle(200)
  // Now:  we store true/false, and the JSX shows/hides based on it
  const [menuOpen, setMenuOpen] = useState(false);

  // Was:  var searchQuery = ""  (global variable)
  // Now:  it lives inside this component and updates the input in real time
  const [searchQuery, setSearchQuery] = useState("");

  // Was:  localStorage.getItem("theme") checked in initTheme()
  // Now:  we store true/false for dark mode here
  const [isDark, setIsDark] = useState(false);

  // ----------------------------------------------------------
  // useNavigate — replaces showPage() for search redirects
  // ----------------------------------------------------------
  // Was:  function handleNavSearch(e) { showPage("shop"); }
  // Now:  navigate("/shop") does the same thing
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // useEffect — replaces your initTheme() function
  // ----------------------------------------------------------
  // Was:  jQuery(function() { initTheme(); });  ← ran on page load
  // Now:  useEffect with [] runs exactly once when the component loads
  //
  // The [] at the end means "only run this once, on first load"
  // If you left it out, it would run on EVERY re-render (bad!)
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (saved === "dark" || (!saved && prefersDark)) {
      setIsDark(true);
      document.body.classList.add("dark"); // your CSS still uses .dark on body
    }
  }, []); // ← the empty [] means "run once on load"

  // ----------------------------------------------------------
  // FUNCTIONS — these replace your jQuery functions in script.js
  // ----------------------------------------------------------

  // Was:  function toggleTheme() { jQuery("body").toggleClass("dark"); ... }
  // Now:  we flip isDark true/false, and use that to update the body class
  function handleToggleTheme() {
    const newDark = !isDark;
    setIsDark(newDark);
    document.body.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  }

  // Was:  function handleNavSearch(e) { e.preventDefault(); showPage("shop"); }
  // Now:  same idea — prevent the form from refreshing the page, then navigate
  function handleSearchSubmit(e) {
    e.preventDefault(); // stops the browser from doing a full page reload
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate("/shop"); // go to the shop page
      setSearchQuery(""); // clear the search box
      setMenuOpen(false); // close mobile menu if open
    }
  }

  // Was:  function toggleMobileMenu() { jQuery("#mobileMenu").slideToggle(200); }
  // Now:  just flip menuOpen between true and false
  function handleToggleMobileMenu() {
    setMenuOpen(!menuOpen);
  }

  // ----------------------------------------------------------
  // THE JSX — this replaces your HTML navbar block
  // ----------------------------------------------------------
  // Key differences from your HTML:
  //   class=""      →  className=""       (React uses className)
  //   onclick=""    →  onClick={}         (camelCase, curly braces)
  //   onsubmit=""   →  onSubmit={}
  //   style=""      →  style={{}}         (double curly braces, camelCase)
  //   {isDark}      →  a JS variable      (curly braces = "use JS here")
  // ----------------------------------------------------------

  return (
    <nav className="navbar" id="navbar">
      <div className="container navbar-inner">

        {/* ── LEFT: Logo + Nav Links ── */}
        <div className="navbar-left">

          {/* Was: <a href="#" onclick="showPage('home')">
              Now: <Link to="/"> navigates to the home route */}
          <Link to="/" className="logo">
            <img src="/images/mporiums-logo.png" alt="M.Poriums" style={{ height: "32px" }} />
          </Link>

          <div className="nav-links hide-mobile">
            {/* Was: <a href="#" onclick="showPage('shop')" class="nav-link">Shop</a>
                Now: <Link to="/shop"> — no onclick needed, routing is automatic */}
            <Link to="/shop" className="nav-link">Shop</Link>
            <Link to="/sell" className="nav-link">Sell</Link>
            <a href="#" className="nav-link">Deals</a>
            <a href="#" className="nav-link">Community</a>
          </div>
        </div>

        {/* ── CENTER: Search Bar ── */}
        {/* Was: <form class="search-bar" onsubmit="handleNavSearch(event)">
            Now: onSubmit calls our function above.
            The input uses value={searchQuery} + onChange to stay in sync with state.
            This is called a "controlled input" — React owns the value. */}
        <form className="search-bar hide-mobile" onSubmit={handleSearchSubmit}>
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          {/* Was: <input type="text" id="navSearchInput" />
              Now: value ties the input to our searchQuery state
                   onChange updates the state every time the user types */}
          <input
            type="text"
            placeholder="Search gear, instruments, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* ── RIGHT: Theme Toggle, Cart, Sign In, Hamburger ── */}
        <div className="navbar-right">

          {/* THEME TOGGLE BUTTON
              Was: <button onclick="toggleTheme()">
                     <svg id="sunIcon" />
                     <svg id="moonIcon" style="display:none;" />
                   </button>
              Now: we show one icon OR the other based on isDark.
                   {isDark ? <Moon /> : <Sun />} means:
                   "if isDark is true, show the moon icon, otherwise show the sun" */}
          <button
            className="btn btn-ghost icon-btn"
            onClick={handleToggleTheme}
            title="Toggle theme"
          >
            {isDark ? (
              // Moon icon — shown when dark mode is ON
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              // Sun icon — shown when dark mode is OFF
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>

          {/* WISHLIST BUTTON
              Heart icon with badge count
              Filled red when wishlist has items */}
          <Link to="/wishlist" className="btn btn-ghost icon-btn" title="Saved items">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={wishlist.length > 0 ? "var(--primary)" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            {/* Show wishlist count badge when there are saved items */}
            {wishlist.length > 0 && (
              <span className="cart-badge">{wishlist.length}</span>
            )}
          </Link>

          {/* CART BUTTON
              Was: <a href="#" onclick="showPage('cart')">
                     <span id="cartBadge" style="display:none;">0</span>
                   </a>
              Now: Link navigates to /cart automatically.
                   The badge: totals.itemCount is the total number of items.
                   {totals.itemCount > 0 && <span>} means:
                   "only show the badge if there's at least 1 item in the cart" */}
          <Link to="/cart" className="btn btn-ghost icon-btn cart-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {/* Only show the badge when cart has items */}
            {totals.itemCount > 0 && (
              <span className="cart-badge">{totals.itemCount}</span>
            )}
          </Link>

          {/* SIGN IN BUTTON (desktop only) */}
          <Link to="/auth" className="btn btn-primary hide-mobile">
            Sign In
          </Link>

          {/* HAMBURGER BUTTON (mobile only)
              Was: onclick="toggleMobileMenu()"
              Now: onClick={handleToggleMobileMenu} flips menuOpen state */}
          <button
            className="btn btn-ghost icon-btn show-mobile"
            onClick={handleToggleMobileMenu}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── MOBILE MENU ──
          Was: <div id="mobileMenu" style="display:none;">
               shown/hidden with jQuery("#mobileMenu").slideToggle(200)

          Now: {menuOpen && <div>...} means
               "only render this div if menuOpen is true"
               When menuOpen is false, the whole block disappears from the page. */}
      {menuOpen && (
        <div className="mobile-menu">

          {/* Mobile search — same controlled input pattern as desktop */}
          <form onSubmit={handleSearchSubmit} className="mobile-search">
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Search gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Mobile nav links
              Was: onclick="showPage('shop');toggleMobileMenu()"
              Now: onClick closes the menu, Link handles navigation */}
          <Link to="/shop" className="mobile-link" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/sell" className="mobile-link" onClick={() => setMenuOpen(false)}>Sell</Link>
          <a href="#" className="mobile-link">Deals</a>
          <a href="#" className="mobile-link">Community</a>
          <Link
            to="/auth"
            className="mobile-link"
            onClick={() => setMenuOpen(false)}
            style={{ color: "var(--primary)" }}
          >
            Sign In / Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}

// STEP 3: Export the component
// This is like making the component available for other files to use.
// In your App.jsx you'll do: import Navbar from "./components/Navbar";
export default Navbar;

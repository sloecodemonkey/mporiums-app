// ============================================================
// SellerProfile.jsx
// Converted from #page-seller in index.html and
// openSellerProfile() in script.js
// ============================================================
// Your old seller profile page was another empty skeleton
// populated entirely by jQuery. openSellerProfile() did:
//
//   1. Read seller info from the global currentProduct variable
//   2. Manually set text on 7 elements by ID
//   3. Toggle the verified badge and comma span with jQuery
//   4. jQuery.grep() to find all products by this seller
//   5. Built HTML strings and injected into #sellerListingsGrid
//   6. Called showPage("seller")
//
// The page had no URL of its own — you could never link to
// or bookmark a seller profile directly.
//
// In React:
//   - The seller name lives in the URL: /seller/VintageAxes
//   - useParams() reads it — no global variable needed
//   - products.filter() finds their listings in one line
//   - All seller info renders directly from the found product
//   - ProductCard renders listings — no HTML string building
// ============================================================

import { useParams, Link } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";

function SellerProfile() {

  // ----------------------------------------------------------
  // SCROLL TO TOP
  // ----------------------------------------------------------

  function handleScrollToTop() {
    window.scrollTo(0, 0);
  }

  // ----------------------------------------------------------
  // GET SELLER FROM URL
  // ----------------------------------------------------------
  // The URL is /seller/VintageAxes — useParams reads "VintageAxes"
  // Was: currentProduct held the seller info as a global variable.
  //      openSellerProfile() was called from the product page only.
  //      There was no URL — you couldn't share a seller profile link.
  // Now: the seller name is IN the URL, bookmarkable and shareable.
  const { sellerName } = useParams();

  // ----------------------------------------------------------
  // FIND SELLER DATA + LISTINGS
  // ----------------------------------------------------------
  // Was: var sellerProducts = jQuery.grep(products, function(p) {
  //        return p.seller === currentProduct.seller;
  //      });
  //      Then seller info was read off currentProduct separately.
  //
  // Now: find all products by this seller in one line.
  // The first result gives us the seller's profile details.
  const sellerProducts = products.filter((p) => p.seller === sellerName);

  // Get seller details from the first matching product.
  // If no products found, seller is null — handled below.
  const seller = sellerProducts[0] || null;

  // ----------------------------------------------------------
  // HANDLE SELLER NOT FOUND
  // ----------------------------------------------------------
  // Was: this couldn't happen in the old site because you could
  //      only reach this page by clicking from a product.
  // Now: someone could type /seller/nobody — handle it cleanly.
  if (!seller) {
    return (
      <main className="page-main center-content">
        <div className="text-center">
          <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
          <p className="text-muted" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Seller not found
          </p>
          <Link to="/shop" className="link-primary" onClick={handleScrollToTop}>← Back to Shop</Link>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (
    <main className="page-main">
      <div className="container narrow">

        {/* BREADCRUMB
            Was: <a onclick="showPage('product')">← Back to Product</a>
            Now: Link goes back — useNavigate(-1) would go to the
            previous page but a fixed link to /shop is safer */}
        <div className="breadcrumb">
          <Link to="/shop" className="link-primary" onClick={handleScrollToTop}>← Back to Shop</Link>
        </div>

        {/* ── SELLER PROFILE HEADER ── */}
        <div className="seller-profile-header" style={{ textAlign: "center", marginBottom: "3rem" }}>

          {/* Seller avatar initials
              Was: <div id="sellerProfileAvatar">VA</div>
                   jQuery("#sellerProfileAvatar").text(currentProduct.sellerAvatar)
              Now: rendered directly from the seller object */}
          <div
            className="seller-avatar"
            style={{ width: "6rem", height: "6rem", margin: "0 auto 1rem", fontSize: "2rem" }}
          >
            {seller.sellerAvatar}
          </div>

          {/* Seller name
              Was: <h1 id="sellerProfileName">Seller Name</h1>
                   jQuery("#sellerProfileName").text(currentProduct.seller) */}
          <h1 className="page-title">{seller.seller}</h1>

          {/* City, State
              Was: three separate spans with IDs, jQuery toggled
                   the comma span based on whether both values existed:
                   jQuery("#sellerProfileComma").toggle(!!(city && state))
              Now: one clean conditional — if both exist show "City, State",
                   otherwise show whichever one exists */}
          <p className="text-muted" style={{ fontSize: "1.125rem" }}>
            {seller.sellerCity && seller.sellerState
              ? `${seller.sellerCity}, ${seller.sellerState}`
              : seller.sellerCity || seller.sellerState || ""}
          </p>

          {/* Verified badge
              Was: <img id="sellerProfileVerified" style="display:none">
                   jQuery("#sellerProfileVerified").toggle(currentProduct.verified)
              Now: {seller.verified && <img />} — only renders if verified */}
          {seller.verified && (
            <img
              src="/icons/shield.svg"
              alt="Verified seller"
              style={{ width: "2rem", height: "2rem", margin: "0.5rem auto 0" }}
            />
          )}

          {/* Stats: Rating + Listings
              Was: <div id="sellerProfileRating">4.9</div>
                   <div id="sellerProfileListings">34</div>
                   jQuery set both by ID
              Now: rendered directly from seller object */}
          <div style={{ marginTop: "1.5rem" }}>
            <span style={{ display: "inline-block", marginRight: "2rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
                {seller.sellerRating}
              </div>
              <div className="text-muted text-sm">Rating</div>
            </span>
            <span style={{ display: "inline-block" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700 }}>
                {seller.sellerListings}
              </div>
              <div className="text-muted text-sm">Listings</div>
            </span>
          </div>

          {/* Member since
              Was: <p id="sellerProfileMemberSince">Member since 2023</p>
                   jQuery("#sellerProfileMemberSince").text("Member since " + year) */}
          <p className="text-muted" style={{ marginTop: "1.5rem" }}>
            Member since {seller.memberSince}
          </p>
        </div>

        {/* ── SELLER'S LISTINGS ── */}
        <h2 className="section-title">Recent Listings</h2>

        {/* Was: if (sellerProducts.length > 0) {
                  var html = jQuery.map(sellerProducts, function(product) {
                    return renderListingCard(product);
                  }).join("");
                  jQuery("#sellerListingsGrid").html(html);
                  jQuery("#sellerEmpty").hide();
                } else {
                  jQuery("#sellerEmpty").show();
                }
            Now: ternary — if listings exist, map them. Otherwise show empty state. */}
        {sellerProducts.length > 0 ? (
          <div className="listing-grid" style={{ marginTop: "2rem" }}>
            {sellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: "2rem" }}>
            <p className="empty-title">No listings available</p>
            <p className="text-muted">
              This seller doesn't have any active listings right now.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

export default SellerProfile;

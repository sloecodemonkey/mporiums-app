// ============================================================
// ProductCard.jsx
// Converted from renderListingCard() in script.js
// ============================================================
// In your old code, renderListingCard() built an HTML string
// by gluing text together with + signs, like this:
//
//   return '<a href="#" onclick="openProduct(\'' + product.id + '\')">' +
//            '<h3>' + product.title + '</h3>' +
//          '</a>';
//
// That's messy and hard to read. In React, we write the exact
// same structure as JSX — it looks like normal HTML but lives
// inside a JavaScript function. Much cleaner!
//
// Props this component receives (what gets passed IN):
//   product   → one product object from your products array
//               e.g. { id, title, price, condition, category,
//                      seller, rating, verified, images }
//   onAddToCart → optional function to add item to cart
//                 (used when showing cards with a quick-add button)
// ============================================================

// useState lets us track whether this item has been wishlisted
import { useState } from "react";

// Link lets us navigate to the product detail page on click
import { Link } from "react-router-dom";

function ProductCard({ product, onAddToCart }) {

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  // Tracks whether the heart/wishlist button is active.
  // Was: the heart button had no real state in your old code —
  //      onclick just called event.stopPropagation() and did nothing.
  // Now: we give it real toggle behaviour for free.
  const [wishlisted, setWishlisted] = useState(false);

  // ----------------------------------------------------------
  // FUNCTIONS
  // ----------------------------------------------------------

  // Handles the wishlist heart button click.
  // We stop the click from "bubbling up" to the parent <Link>,
  // which would otherwise navigate to the product page.
  // Was: onclick="event.preventDefault();event.stopPropagation();"
  function handleWishlistClick(e) {
    e.preventDefault();      // stop any default browser behaviour
    e.stopPropagation();     // stop the click reaching the parent <Link>
    setWishlisted(!wishlisted); // toggle the heart on/off
  }

  // ----------------------------------------------------------
  // JSX — replaces the HTML string from renderListingCard()
  // ----------------------------------------------------------

  return (
    // Was: <a href="#" onclick="openProduct('1')" class="card listing-card">
    // Now: <Link to="/product/1"> navigates to the product detail page.
    // The product id comes from the product prop: product.id
    <Link to={`/product/${product.id}`} className="card listing-card">

      {/* ── IMAGE SECTION ── */}
      <div className="listing-image">

        {/* Was: <img src="' + product.images[0] + '" loading="lazy" />
            Now: we use the first image from the images array.
            The /  at the end of loading="lazy" becomes just loading="lazy" — same thing */}
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
        />

        {/* Condition badge — e.g. "Like New", "Excellent", "Good"
            Was: '<span class="listing-badge">' + product.condition + '</span>' */}
        <span className="listing-badge">{product.condition}</span>

        {/* Wishlist heart button
            Was: a button with onclick that did nothing useful.
            Now: it actually toggles, and the fill changes when active.
            The style changes the heart fill colour when wishlisted is true. */}
        <button
          className="listing-heart"
          onClick={handleWishlistClick}
          aria-label="Save to wishlist"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={wishlisted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {/* ── BODY SECTION ── */}
      <div className="listing-body">

        {/* Category label — e.g. "Guitars & Basses"
            Was: '<p class="listing-category">' + product.category + '</p>' */}
        <p className="listing-category">{product.category}</p>

        {/* Product title
            Was: '<h3 class="listing-title">' + product.title + '</h3>' */}
        <h3 className="listing-title">{product.title}</h3>

        {/* Price — toLocaleString() adds commas e.g. $1,450
            Was: '<p class="listing-price">$' + product.price.toLocaleString() + '</p>' */}
        <p className="listing-price">${product.price.toLocaleString()}</p>

        {/* ── META ROW: verified badge, seller name, rating ── */}
        <div className="listing-meta">

          {/* Verified shield icon — only show if product.verified is true.
              Was: product.verified ? '<img src="icons/shield.svg" />' : ''
              Now: {product.verified && <img />}
              This means: "only render the img if verified is true" */}
          <span className="listing-verified">
            {product.verified && (
              <img
                src="/icons/shield.svg"
                alt="Verified"
                style={{ width: "30px", height: "30px", display: "inline" }}
              />
            )}
          </span>

          {/* Seller name */}
          <span className="listing-seller">{product.seller}</span>

          {/* Star rating — only show if rating is greater than 0
              Was: product.rating > 0 ? '<img src="icons/star.svg" />' + product.rating : ''
              Now: {product.rating > 0 && (...)} */}
          <span className="listing-rating">
            {product.rating > 0 && (
              <>
                <img
                  src="/icons/star.svg"
                  alt="Rating"
                  style={{
                    width: "30px",
                    height: "30px",
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: "0.25rem"
                  }}
                />
                {product.rating}
              </>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;

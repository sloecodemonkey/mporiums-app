// ============================================================
// ProductCard.jsx — updated to use WishlistContext
// ============================================================
// The heart button previously toggled a local useState(false)
// that only existed inside this one card instance.
// That meant:
//   - Refreshing the page reset all hearts to empty
//   - The Wishlist page had no way to know which items were saved
//   - Clicking heart on the Shop page didn't reflect on Home page
//
// Now:
//   - useWishlist() connects to the shared WishlistContext
//   - isWishlisted(product.id) checks if THIS product is saved
//   - toggleWishlist(product) adds or removes it from the list
//   - The heart state is consistent everywhere on the site
//   - It persists across page refreshes via localStorage
// ============================================================

import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ product }) {

  // Get wishlist functions from context
  // isWishlisted → checks if this product is already saved
  // toggleWishlist → adds or removes it
  const { isWishlisted, toggleWishlist } = useWishlist();

  // Is THIS specific product currently in the wishlist?
  const wishlisted = isWishlisted(product.id);

  // Handle heart button click
  // e.preventDefault() stops the Link from navigating
  // e.stopPropagation() stops the click bubbling to the parent Link
  function handleWishlistClick(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product); // pass the full product object
  }

  return (
    <Link to={`/product/${product.id}`} className="card listing-card">

      {/* ── IMAGE SECTION ── */}
      <div className="listing-image">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
        />

        <span className="listing-badge">{product.condition}</span>

        {/* Heart button — filled red when wishlisted, outline when not */}
        <button
          className="listing-heart"
          onClick={handleWishlistClick}
          aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
          style={{
            // Subtle scale-up when active so the user gets clear feedback
            transform: wishlisted ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.15s",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            // Filled red when wishlisted, outline when not
            fill={wishlisted ? "var(--primary)" : "none"}
            stroke={wishlisted ? "var(--primary)" : "currentColor"}
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
        <p className="listing-category">{product.category}</p>
        <h3 className="listing-title">{product.title}</h3>
        <p className="listing-price">${product.price.toLocaleString()}</p>

        <div className="listing-meta">
          <span className="listing-verified">
            {product.verified && (
              <img
                src="/icons/shield.svg"
                alt="Verified"
                style={{ width: "30px", height: "30px", display: "inline" }}
              />
            )}
          </span>
          <span className="listing-seller">{product.seller}</span>
          <span className="listing-rating">
            {product.rating > 0 && (
              <>
                <img
                  src="/icons/star.svg"
                  alt="Rating"
                  style={{
                    width: "30px", height: "30px",
                    display: "inline", verticalAlign: "middle",
                    marginRight: "0.25rem",
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

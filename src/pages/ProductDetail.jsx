// ============================================================
// ProductDetail.jsx
// ============================================================

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fetchListing } from "../utils/api";

function ProductDetail() {

  const { id } = useParams();
  const { addToCart } = useCart();

  // ── Data from API ─────────────────────────────────────────
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notify, setNotify] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const listing = await fetchListing(id);
        setProduct(listing);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── UI state ──────────────────────────────────────────────
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [offerModalOpen, setOfferModalOpen]     = useState(false);
  const [offerAmount, setOfferAmount]           = useState("");
  const [offerMessage, setOfferMessage]         = useState("");
  const [addedToCart, setAddedToCart]           = useState(false);

  function handleScrollToTop() { window.scrollTo(0, 0); }

  // ── Loading / not-found states ────────────────────────────
  if (loading) {
    return (
      <main className="page-main center-content">
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="page-main center-content">
        <div className="text-center">
          <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
          <p className="text-muted" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Product not found
          </p>
          <Link to="/shop" className="link-primary">← Back to Shop</Link>
        </div>
      </main>
    );
  }

  // ----------------------------------------------------------
  // IMAGE GALLERY FUNCTIONS
  // ----------------------------------------------------------

  // Select specific image by index
  function selectImage(i) {
    setActiveImageIndex(i);
  }
  // Go to next image (wraps around to first if at end)

  function nextImage() {
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  }

  function prevImage() {
    setActiveImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  }

  // ----------------------------------------------------------
  // ADD TO CART
  // ----------------------------------------------------------
  
  function handleAddToCart() {
    addToCart(product);
    setAddedToCart(true);
    // Reset the confirmation message after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  }

  // ----------------------------------------------------------
  // OFFER MODAL FUNCTIONS
  // ----------------------------------------------------------

  
  function openOfferModal() {
    setOfferModalOpen(true);
  }


  function closeOfferModal() {
    setOfferModalOpen(false);
    setOfferAmount("");
    setOfferMessage("");
  }

  function handleSendOffer(e) {
    e.preventDefault();
    alert("Offer sent! (Requires backend integration)");
    closeOfferModal();
  }

  // ----------------------------------------------------------
  // CONTACT SELLER (for when Stripe onboarding isn't complete)
  // ----------------------------------------------------------

  function handleMessageSeller(e) {
    alert("Messaging feature coming soon!");
  }

  // ----------------------------------------------------------
  // NOTIFY ME TO CONTACT SELLER (for when Stripe onboarding isn't complete)
  // ----------------------------------------------------------
  
  function handleNotifyMe(e) {
    setNotify(!notify);
    alert("We'll notify you when this item becomes available!");
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (
    <main className="page-main">
      <div className="container">

        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <Link to="/shop" className="link-primary">← Back to Shop</Link>
          <span>/</span>
          <span>{product.category}</span>
        </div>

        <div className="product-layout">

          {/* ── IMAGE GALLERY ── */}
          <div className="product-gallery">
            <div className="product-main-image">

              {/* Main image
                  */}
              <img
                src={product.images[activeImageIndex]}
                alt={product.title}
              />

              {/* Prev/Next buttons — only show if more than 1 image */}
              {product.images.length > 1 && (
                <>
                  <button className="gallery-nav gallery-prev" onClick={prevImage}>
                    ‹
                  </button>
                  <button className="gallery-nav gallery-next" onClick={nextImage}>
                    ›
                  </button>
                </>
              )}
            </div>

            {/* THUMBNAILS
               */}
            <div className="product-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`product-thumb${activeImageIndex === i ? " active" : ""}`}
                  onClick={() => selectImage(i)}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="product-info">

            {/* Condition badge
                 */}
            <span className="badge badge-secondary">{product.condition}</span>

            {/* Title
                */}
            <h1 className="product-title">{product.title}</h1>

            {/* Category
                 */}
            <p className="text-muted" style={{ marginLeft: "1px" }}>
              {product.category}
            </p>

            {/* Price
                 */}
            <p className="product-price">${product.price.toLocaleString()}</p>

            {/* Rating
                 */}
            {product.rating > 0 && (
              <div className="product-rating">
                <img
                  src="/icons/star.svg"
                  alt="Rating"
                  style={{ width: "32px", height: "32px", display: "inline", verticalAlign: "middle", marginRight: "0.25rem" }}
                />
                {product.rating}
              </div>
            )}

            <hr className="separator" />

            {/* Description
                 */}
            <p className="product-description">{product.description}</p>

            <hr className="separator" />

            {/* ── SELLER CARD ──
                */}
            <div className="seller-card" style={{ maxWidth: "1120px", marginTop: "calc(0.75rem + 15px)" }}>
              <h3 className="filter-title">Seller</h3>
              <div className="seller-info">

                {/* Seller avatar initials */}
                <div className="seller-avatar">{product.sellerAvatar}</div>

                <div className="seller-name">
                  {/* Seller name — plain text for now.
                      You can make this a Link to /seller/:id when you build that page */}
                    <Link to={`/seller/${product.seller}`} style={{ color: "var(--primary)", fontWeight: 600 }} onClick={handleScrollToTop}>
                      {product.username}
                    </Link>

                  {/* Verified badge — only show if verified
                      */}
                  {product.stripe_onboarding_complete && (
                    <img
                      src="/icons/shield.svg"
                      alt="Verified seller"
                      style={{ width: "2rem", height: "2rem", marginTop: "2px" }}
                    />
                  )}
                </div>

                {/* City, State
                   */}
                {/* <div className="seller-location">
                  {product.sellerCity && product.sellerState
                    ? `${product.sellerCity}, ${product.sellerState}`
                    : product.sellerCity || product.sellerState || ""}
                </div> */}
              </div>
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="product-actions">
              {/* DONT ALLOW ADD TO CART IF SELLER HASN'T COMPLETED STRIPE ONBOARDING */}
              {!product.stripe_onboarding_complete && (
                <div className="alert alert-warning" role="alert">
                  <p>The seller has not completed their payment setup yet.</p>
                  <p>Contact the seller to express your interest and encourage them to complete their setup.</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.75rem", marginBottom: "0.75rem", justifyContent: "space-around" }}>
                    <button className="btn btn-primary btn-sm" onClick={handleMessageSeller}>
                      Contact Seller
                    </button>
                    <button
                      onClick={handleNotifyMe}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{
                        display: "inline-block",
                        width: "2.5rem",
                        height: "1.4rem",
                        borderRadius: "999px",
                        background: notify ? "#0d6efd" : "#ccc",
                        position: "relative",
                        transition: "background 0.2s",
                        flexShrink: 0,
                      }}>
                        <span style={{
                          position: "absolute",
                          top: "0.15rem",
                          left: notify ? "1.2rem" : "0.15rem",
                          width: "1.1rem",
                          height: "1.1rem",
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s",
                        }} />
                      </span>
                      <span style={{ color: "inherit" }}>Notify me when item is available</span>
                    </button>
                  </div>
                </div>
              )}
              {product.stripe_onboarding_complete && (
                <>
                  {/* ADD TO CART */}
                  <button className="btn btn-primary btn-sm btn-flex"
                    onClick={handleAddToCart}
                  >
                    <img src="/icons/shopping-cart-white.svg" alt="Cart" style={{ width: "2rem", height: "2rem" }} />
                    {/* Show "Added!" briefly after clicking, then revert */}
                    {addedToCart ? "Added!" : "Add to Cart"}
                  </button>

                  {/* MAKE OFFER */}
                  <button
                    className="btn btn-outline btn-sm btn-blue-hover btn-flex"
                    onClick={openOfferModal}
                  >
                    <img src="/icons/message-square.svg" alt="Message" style={{ width: "2rem", height: "2rem" }} />
                    Make Offer
                  </button>
                </>
              )}

              <button className="btn btn-outline btn-sm btn-blue-hover btn-flex">
                <img src="/icons/heart.svg" alt="Save" style={{ width: "2rem", height: "2rem" }} />
                Save
              </button>

              <button className="btn btn-outline btn-sm btn-blue-hover">
                <img src="/icons/share-2.svg" alt="Share" style={{ width: "2rem", height: "2rem" }} />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          OFFER MODAL
          ================================================================
           */}
      {offerModalOpen && (
        <div
          className="modal-overlay"
          onClick={closeOfferModal}
        >
          {/*  */}
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="form-card-title">Make an Offer</h2>
            <p className="text-muted">
              Send an offer for <strong>{product.title}</strong>
            </p>
            <p className="text-muted">
              Listed at <strong className="text-primary">${product.price.toLocaleString()}</strong>
            </p>

            <form onSubmit={handleSendOffer}>
              <div className="form-group" style={{ marginTop: "1.25rem" }}>
                <label>Your Offer ($)</label>
                <input
                  type="number"
                  placeholder={Math.round(product.price * 0.9)}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  style={{ fontSize: "1.125rem", fontWeight: 600 }}
                />
              </div>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Add a message to the seller..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary btn-lg btn-flex">
                  Send Offer
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={closeOfferModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default ProductDetail;

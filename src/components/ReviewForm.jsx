// ============================================================
// ReviewForm.jsx
// src/components/ReviewForm.jsx
// ============================================================
// A form that lets a buyer leave a rating and review for a seller
// after viewing or purchasing a product.
//
// Used in: SellerProfile.jsx (shown to logged-in buyers)
//          Can also be linked from the order confirmation page
//
// Props:
//   sellerName  — the seller being reviewed
//   productTitle — the product the buyer purchased
//   onSubmit    — callback with the new review object when submitted
//   onCancel    — callback to close/hide the form
//
// In production:
//   POST /api/sellers/:sellerName/reviews
//   { rating, title, body, productTitle }
// ============================================================

import { useState } from "react";
import StarRating from "./StarRating";

function ReviewForm({ sellerName, productTitle, onSubmit, onCancel }) {

  // Form field state
  const [rating, setRating]   = useState(0);
  const [title, setTitle]     = useState("");
  const [body, setBody]       = useState("");
  const [error, setError]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Character limits
  const TITLE_MAX = 80;
  const BODY_MAX  = 600;

  function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!title.trim()) {
      setError("Please add a short title for your review.");
      return;
    }
    if (!body.trim()) {
      setError("Please write your review.");
      return;
    }

    setError("");

    // Build the review object
    const newReview = {
      id:           `r-${Date.now()}`,
      seller:       sellerName,
      buyerName:    "You",
      buyerAvatar:  "ME",
      rating,
      title:        title.trim(),
      body:         body.trim(),
      productTitle: productTitle || "",
      date:         new Date().toISOString().split("T")[0],
      verified:     true,
    };

    setSubmitted(true);

    // Pass the new review up to the parent
    if (onSubmit) onSubmit(newReview);
  }

  // ── Thank you state ─────────────────────────────────────
  if (submitted) {
    return (
      <div style={{
        background: "var(--card)",
        border: "0.5px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "2rem",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>⭐</div>
        <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "0.5rem" }}>
          Thanks for your review!
        </h3>
        <p className="text-muted text-sm">
          Your review of {sellerName} has been submitted and will appear shortly.
        </p>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────
  return (
    <div style={{
      background: "var(--card)",
      border: "1.5px solid var(--primary)",
      borderRadius: "var(--radius)",
      padding: "1.5rem",
    }}>
      <h3 style={{
        fontFamily: "var(--font-display)",
        fontSize: "1.1rem",
        fontWeight: 700,
        marginBottom: "0.25rem",
      }}>
        Leave a Review for {sellerName}
      </h3>
      {productTitle && (
        <p className="text-muted text-xs" style={{ marginBottom: "1.25rem" }}>
          Reviewing your purchase: {productTitle}
        </p>
      )}

      <form onSubmit={handleSubmit}>

        {/* STAR RATING — interactive */}
        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>
            Your Rating *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <StarRating
              rating={rating}
              interactive
              size={28}
              onChange={setRating}
            />
            {rating > 0 && (
              <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
              </span>
            )}
          </div>
        </div>

        {/* REVIEW TITLE */}
        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>
            Review Title *
          </label>
          <input
            type="text"
            placeholder="Summarise your experience in a few words"
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => setTitle(e.target.value)}
          />
          <p className="text-muted text-xs" style={{ textAlign: "right", marginTop: "0.25rem" }}>
            {title.length}/{TITLE_MAX}
          </p>
        </div>

        {/* REVIEW BODY */}
        <div className="form-group">
          <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 500, fontSize: "0.875rem" }}>
            Your Review *
          </label>
          <textarea
            rows={4}
            placeholder="How was the condition of the item? How was communication and shipping? Would you buy from this seller again?"
            value={body}
            maxLength={BODY_MAX}
            onChange={(e) => setBody(e.target.value)}
          />
          <p className="text-muted text-xs" style={{ textAlign: "right", marginTop: "0.25rem" }}>
            {body.length}/{BODY_MAX}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <p style={{
            color: "var(--destructive)",
            fontSize: "0.85rem",
            marginBottom: "1rem",
          }}>
            {error}
          </p>
        )}

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="btn btn-primary">
            Submit Review
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReviewForm;

// ============================================================
// SellerProfile.jsx — Route: /seller/:sellerName
// ============================================================

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchSellerProfile } from "../utils/api";
import ProductCard from "../components/ProductCard";
import StarRating from "../components/StarRating";
import ReviewForm from "../components/ReviewForm";

function SellerProfile() {
  const { sellerName } = useParams();

  // ── API data ────────────────────────────────────────────
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [notFound, setNotFound]     = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSellerProfile(sellerName);
        setSellerData(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sellerName]);

  // ── Reviews state (local — no reviews API yet) ──────────
  const [reviews, setReviews]         = useState([]);
  const [sortBy, setSortBy]           = useState("recent");
  const [activeTab, setActiveTab]     = useState("reviews");
  const [showReviewForm, setShowReviewForm] = useState(false);

  if (loading) {
    return (
      <main className="page-main center-content" style={{ paddingTop: "64px" }}>
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (notFound || !sellerData) {
    return (
      <main className="page-main center-content" style={{ paddingTop: "64px" }}>
        <div className="text-center">
          <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
          <p className="text-muted" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
            Seller not found
          </p>
          <Link to="/shop" className="link-primary">← Back to Shop</Link>
        </div>
      </main>
    );
  }

  const { user, listings, listingCount } = sellerData;

  // Build display values from API data
  const displayName  = user.displayName || user.username;
  const sellerAvatar = displayName.split(" ").filter(Boolean).slice(0, 2)
    .map((p) => p[0]).join("").toUpperCase() || "??";
  const memberSince  = user.memberSince;

  // ── Rating calculations ──────────────────────────────────
  const totalReviews  = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: totalReviews > 0
      ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100)
      : 0,
  }));

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "highest") return b.rating - a.rating;
    if (sortBy === "lowest")  return a.rating - b.rating;
    return new Date(b.date) - new Date(a.date);
  });

  function handleNewReview(newReview) {
    setReviews((prev) => [newReview, ...prev]);
    setShowReviewForm(false);
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  }

  return (
    <main className="page-main" style={{ paddingTop: "64px" }}>
      <div className="container narrow">

        <div className="breadcrumb">
          <Link to="/shop" className="link-primary">← Back to Shop</Link>
        </div>

        {/* ── PROFILE HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>

          <div
            className="seller-avatar"
            style={{ width: "6rem", height: "6rem", margin: "0 auto 1rem", fontSize: "2rem" }}
          >
            {sellerAvatar}
          </div>

          <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>
            {displayName}
          </h1>

          {/* Stats row */}
          <div style={{ display: "flex", justifyContent: "center", gap: "2.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700 }}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "—"}
                </span>
                {averageRating > 0 && <StarRating rating={averageRating} size={16} />}
              </div>
              <p className="text-muted text-sm">
                {totalReviews > 0 ? `${totalReviews} review${totalReviews !== 1 ? "s" : ""}` : "No reviews yet"}
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700 }}>
                {listingCount}
              </div>
              <p className="text-muted text-sm">Listings</p>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", fontWeight: 700 }}>
                {memberSince}
              </div>
              <p className="text-muted text-sm">Member since</p>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "2rem" }}>
          {[
            { key: "reviews",  label: `Reviews (${totalReviews})` },
            { key: "listings", label: `Listings (${listings.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "0.75rem 1.5rem", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid var(--primary)" : "2px solid transparent",
                background: "transparent",
                fontWeight: activeTab === tab.key ? 600 : 400,
                color: activeTab === tab.key ? "var(--primary)" : "var(--muted-foreground)",
                cursor: "pointer", fontSize: "0.9rem", transition: "color 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── REVIEWS TAB ── */}
        {activeTab === "reviews" && (
          <div>
            {totalReviews > 0 && (
              <div style={{
                display: "grid", gridTemplateColumns: "auto 1fr", gap: "2rem",
                background: "var(--card)", border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)", padding: "1.5rem",
                marginBottom: "1.5rem", alignItems: "center",
              }}>
                <div style={{ textAlign: "center", minWidth: "100px" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", fontWeight: 700, lineHeight: 1, color: "var(--primary)" }}>
                    {averageRating.toFixed(1)}
                  </div>
                  <StarRating rating={averageRating} size={18} />
                  <p className="text-muted text-xs" style={{ marginTop: "0.4rem" }}>
                    {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {starCounts.map(({ star, count, pct }) => (
                    <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", minWidth: "32px", textAlign: "right" }}>{star} ★</span>
                      <div style={{ flex: 1, height: "8px", background: "var(--muted)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", borderRadius: "4px", transition: "width 0.4s ease" }} />
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", minWidth: "20px" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              {!showReviewForm ? (
                <button className="btn btn-outline" onClick={() => setShowReviewForm(true)}>
                  Write a Review
                </button>
              ) : (
                <ReviewForm
                  sellerName={sellerName}
                  productTitle={listings[0]?.title}
                  onSubmit={handleNewReview}
                  onCancel={() => setShowReviewForm(false)}
                />
              )}
            </div>

            {totalReviews > 1 && !showReviewForm && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Sort by:</span>
                {[
                  { key: "recent",  label: "Most Recent" },
                  { key: "highest", label: "Highest Rated" },
                  { key: "lowest",  label: "Lowest Rated" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    className={`filter-btn${sortBy === opt.key ? " active" : ""}`}
                    onClick={() => setSortBy(opt.key)}
                    style={{ fontSize: "0.8rem" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            {totalReviews === 0 ? (
              <div className="empty-state" style={{ padding: "3rem 0" }}>
                <div className="empty-icon">⭐</div>
                <p className="empty-title">No reviews yet</p>
                <p className="text-muted">Be the first to leave a review for {displayName}.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {sortedReviews.map((review) => (
                  <div key={review.id} style={{
                    background: "var(--card)", border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius)", padding: "1.25rem",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{
                          width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                          background: "var(--secondary)", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 600,
                          color: "var(--muted-foreground)", flexShrink: 0,
                        }}>
                          {review.buyerAvatar}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{review.buyerName}</span>
                            {review.verified && (
                              <span style={{ fontSize: "0.7rem", fontWeight: 500, background: "var(--secondary)", color: "var(--muted-foreground)", padding: "1px 7px", borderRadius: "20px" }}>
                                Verified purchase
                              </span>
                            )}
                          </div>
                          {review.productTitle && (
                            <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: 0 }}>
                              Purchased: {review.productTitle}
                            </p>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{formatDate(review.date)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.5rem" }}>
                      <StarRating rating={review.rating} size={15} />
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{review.title}</span>
                    </div>
                    <p style={{ fontSize: "0.875rem", lineHeight: 1.6, color: "var(--foreground)", margin: 0 }}>
                      {review.body}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LISTINGS TAB ── */}
        {activeTab === "listings" && (
          listings.length > 0 ? (
            <div className="listing-grid">
              {listings.map((listing) => (
                <ProductCard key={listing.id} product={listing} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-title">No listings available</p>
              <p className="text-muted">This seller doesn't have any active listings right now.</p>
            </div>
          )
        )}

      </div>
    </main>
  );
}

export default SellerProfile;

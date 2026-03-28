// ============================================================
// MyListings.jsx
// Route: /my-listings
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchMyListings, deleteListing } from "../utils/api";

function MyListings() {
  const { user } = useAuth();

  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [sortBy, setSortBy]       = useState("recent");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    async function load() {
      try {
        const data = await fetchMyListings(user.id);
        setListings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  const sorted = [...listings].sort((a, b) => {
    if (sortBy === "price-asc")  return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0;
  });

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    setDeletingId(id);
    try {
      await deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <main className="page-main center-content" style={{ paddingTop: "64px" }}>
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  return (
    <main className="page-main" style={{ paddingTop: "64px" }}>
      <div className="container">

        {/* PAGE HEADER */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "2rem",
          flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <h1 className="page-title">My Listings</h1>
            <p className="text-muted">
              {listings.length} active listing{listings.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link to="/sell" className="btn btn-primary">+ Create Listing</Link>
        </div>

        {error && (
          <p style={{ color: "var(--destructive)", marginBottom: "1rem" }}>{error}</p>
        )}

        {/* EMPTY STATE */}
        {listings.length === 0 && !error && (
          <div className="empty-state" style={{ padding: "4rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
            <h2 className="empty-title">No listings yet</h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Start selling by creating your first listing.
            </p>
            <Link to="/sell" className="btn btn-primary btn-lg">Create a Listing</Link>
          </div>
        )}

        {/* SORT + LIST */}
        {listings.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Sort by:</span>
              {[
                { key: "recent",     label: "Recent" },
                { key: "price-asc",  label: "Price: Low to High" },
                { key: "price-desc", label: "Price: High to Low" },
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

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sorted.map((listing) => (
                <div
                  key={listing.id}
                  style={{
                    background: "var(--card)",
                    border: "0.5px solid var(--border)",
                    borderRadius: "var(--radius)",
                    padding: "1rem",
                    display: "flex",
                    gap: "1rem",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                  }}
                >
                  {/* IMAGE */}
                  <Link to={`/product/${listing.id}`} style={{ flexShrink: 0 }}>
                    <div style={{
                      width: "80px", height: "80px",
                      borderRadius: "calc(var(--radius) - 4px)",
                      overflow: "hidden", background: "var(--muted)",
                    }}>
                      <img
                        src={listing.images?.[0]}
                        alt={listing.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </Link>

                  {/* INFO */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="text-muted text-xs" style={{ marginBottom: "0.1rem" }}>
                      {listing.category}
                    </p>
                    <Link
                      to={`/product/${listing.id}`}
                      style={{
                        fontWeight: 600, fontSize: "0.95rem",
                        color: "var(--foreground)", textDecoration: "none",
                        display: "block", marginBottom: "0.35rem",
                      }}
                    >
                      {listing.title}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--primary)" }}>
                        ${listing.price.toLocaleString()}
                      </span>
                      <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                        {listing.condition}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignSelf: "center", flexShrink: 0 }}>
                    <Link
                      to={`/sell/edit/${listing.id}`}
                      className="btn btn-outline btn-sm"
                      style={{ minWidth: "90px" }}
                    >
                      Edit
                    </Link>
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ minWidth: "90px", color: "var(--destructive)", borderColor: "var(--destructive)" }}
                      onClick={() => handleDelete(listing.id)}
                      disabled={deletingId === listing.id}
                    >
                      {deletingId === listing.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default MyListings;

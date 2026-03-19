// ============================================================
// MyListings.jsx
// src/pages/MyListings.jsx
// ============================================================
// Seller dashboard — manage your own product listings
// Accessible at /my-listings (requires login)
//
// Features:
//   - View all your listings
//   - Edit listing details
//   - Delete a listing
//   - View performance metrics (views, offers, sales)
//   - Quick action buttons (edit, delete, promote)
//
// In production:
//   - Require authentication
//   - Load listings from /api/seller/:id/listings
//   - Save changes to /api/listings/:id (PATCH/PUT)
//   - Delete listings via /api/listings/:id (DELETE)
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import products from "../data/products";

function MyListings() {

  // In production, this would be fetched from your backend
  // GET /api/seller/:currentUserId/listings
  // For now, we'll filter products by seller (hardcoded demo)
  const demoSellerName = "VintageAxes"; // Pretend the logged-in user is this seller

  // Get all products for this seller
  const myListings = products.filter((p) => p.seller === demoSellerName);

  // Sort filter
  const [sortBy, setSortBy] = useState("recent");

  // Track which listing is being edited
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // ------ Sorting ------
  const sorted = [...myListings].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    return 0; // default "recent"
  });

  // ------ Delete listing ------
  function handleDeleteListing(id) {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      alert(`Listing ${id} deleted! (Requires backend integration)`);
      // In production: DELETE /api/listings/:id
    }
  }

  // ------ Start editing a listing ------
  function handleEditStart(product) {
    setEditingId(product.id);
    setEditForm({
      title: product.title,
      price: product.price,
      description: product.description,
    });
  }

  // ------ Cancel editing ------
  function handleEditCancel() {
    setEditingId(null);
    setEditForm({});
  }

  // ------ Save editing changes ------
  function handleEditSave(id) {
    alert(`Listing ${id} updated! (Requires backend integration)`);
    // In production: PATCH /api/listings/:id { title, price, description }
    setEditingId(null);
    setEditForm({});
  }

  // ------ JSX ------
  return (
    <main className="page-main" style={{ paddingTop: "64px" }}>
      <div className="container">

        {/* PAGE HEADER */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div>
            <h1 className="page-title">My Listings</h1>
            <p className="text-muted">
              Manage your {myListings.length} active listing{myListings.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Create new listing button */}
          <Link to="/sell" className="btn btn-primary">
            + Create Listing
          </Link>
        </div>

        {/* EMPTY STATE */}
        {myListings.length === 0 && (
          <div className="empty-state" style={{ padding: "4rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
            <h2 className="empty-title">No listings yet</h2>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Start selling by creating your first listing.
            </p>
            <Link to="/sell" className="btn btn-primary btn-lg">
              Create a Listing
            </Link>
          </div>
        )}

        {/* SORT CONTROLS */}
        {myListings.length > 0 && (
          <>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}>
              <span style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                Sort by:
              </span>
              {[
                { key: "recent", label: "Recent" },
                { key: "price-asc", label: "Price: Low to High" },
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

            {/* LISTINGS TABLE / CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {sorted.map((product) => (
                <div
                  key={product.id}
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
                  {/* PRODUCT IMAGE */}
                  <Link to={`/product/${product.id}`} style={{ flexShrink: 0 }}>
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "calc(var(--radius) - 4px)",
                        overflow: "hidden",
                        background: "var(--muted)",
                      }}
                    >
                      <img
                        src={product.images?.[0]}
                        alt={product.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  </Link>

                  {/* PRODUCT INFO */}
                  {editingId === product.id ? (
                    // EDIT MODE
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                        <label style={{ fontSize: "0.8rem", marginBottom: "0.25rem", display: "block" }}>Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                        <label style={{ fontSize: "0.8rem", marginBottom: "0.25rem", display: "block" }}>Price ($)</label>
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                        <label style={{ fontSize: "0.8rem", marginBottom: "0.25rem", display: "block" }}>Description</label>
                        <textarea
                          rows={2}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        />
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleEditSave(product.id)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={handleEditCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // VIEW MODE
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-muted text-xs" style={{ marginBottom: "0.1rem" }}>
                        {product.category}
                      </p>
                      <Link
                        to={`/product/${product.id}`}
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          color: "var(--foreground)",
                          textDecoration: "none",
                          display: "block",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {product.title}
                      </Link>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <span style={{
                          fontWeight: 700,
                          fontSize: "1rem",
                          color: "var(--primary)",
                        }}>
                          ${product.price.toLocaleString()}
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                          {product.condition}
                        </span>
                        <span className="text-muted text-xs">
                          {Math.floor(Math.random() * 200)} views
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    alignSelf: "center",
                    flexShrink: 0,
                  }}>
                    {editingId !== product.id && (
                      <>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ minWidth: "90px" }}
                          onClick={() => handleEditStart(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{
                            minWidth: "90px",
                            color: "var(--destructive)",
                            borderColor: "var(--destructive)",
                          }}
                          onClick={() => handleDeleteListing(product.id)}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    )}
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

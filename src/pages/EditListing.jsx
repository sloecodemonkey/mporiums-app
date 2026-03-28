// ============================================================
// EditListing.jsx  —  Route: /sell/edit/:id
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchListing, fetchCategories, updateListing } from "../utils/api";

const CONDITIONS = ["Like New", "Excellent", "Good", "Fair"];

// ── Fee calculator (same as Sell.jsx) ────────────────────────
function calcFees(price, type) {
  if (!price || isNaN(price) || Number(price) <= 0) return { transactionFee: 0, sellingFee: 0, totalFees: 0, youReceive: 0, orderTotal: 0, shipping: 0, tax: 0, transactionRate: 0 };
  const itemPrice = Number(price);
  const shipping  = itemPrice > 500 ? 0 : 14.99;
  const tax       = itemPrice * 0.08;
  const orderTotal = itemPrice + shipping + tax;
  const transactionRate = type === "preferred" ? 0.0299 : 0.0319;
  const transactionFee  = Math.min((orderTotal * transactionRate) + 0.49, 500);
  const sellingFee      = Math.min(Math.max((itemPrice + shipping) * 0.05, 0.50), 500);
  const totalFees       = transactionFee + sellingFee;
  const youReceive      = Math.max(itemPrice - totalFees, 0);
  return { transactionFee, sellingFee, totalFees, youReceive, orderTotal, shipping, tax, transactionRate };
}

function EditListing() {

  const { id }       = useParams();
  const navigate     = useNavigate();
  const fileInputRef = useRef(null);

  // ── Data from API ─────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [CATEGORIES, setCategories]   = useState([]);

  // ── Form state ────────────────────────────────────────────
  const [title, setTitle]             = useState("");
  const [price, setPrice]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("");
  const [condition, setCondition]     = useState("");
  const [sellerType, setSellerType]   = useState("standard");
  // existingImages: URL strings from server to keep
  // newImages: { file: File, preview: string } for new uploads
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages]           = useState([]);
  const [saving, setSaving]                 = useState(false);
  const [saveError, setSaveError]           = useState("");

  const totalImages = existingImages.length + newImages.length;

  // ── Fetch listing + categories on mount ───────────────────
  useEffect(() => {
    async function load() {
      try {
        const [listing, cats] = await Promise.all([
          fetchListing(id),
          fetchCategories(),
        ]);
        setTitle(listing.title);
        setPrice(String(listing.price));
        setDescription(listing.description || "");
        setCategory(listing.category || "");
        setCondition(listing.condition || "");
        setExistingImages(listing.images || []);
        setCategories(cats.map((c) => c.name));
      } catch {
        setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    }
    load();
  }, [id]);

  const fees = calcFees(price, sellerType);
  const showPreview = !!(title || price);

  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const remaining = 6 - totalImages;
    const added = files
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining)
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setNewImages((prev) => [...prev, ...added]);
    e.target.value = "";
  }

  function removeExistingImage(i) {
    setExistingImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  function removeNewImage(i) {
    setNewImages((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim() || !price || !category || !condition) {
      setSaveError("Please fill in all required fields.");
      return;
    }
    setSaveError("");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title",           title.trim());
      formData.append("description",     description.trim());
      formData.append("price",           price);
      formData.append("condition",       condition);
      formData.append("existing_images", JSON.stringify(existingImages));
      newImages.forEach((img) => formData.append("images", img.file));
      await updateListing(id, formData);
      navigate("/my-listings");
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Loading / not-found guards ────────────────────────────
  if (pageLoading) {
    return (
      <main className="page-main center-content" style={{ paddingTop: "64px" }}>
        <p className="text-muted">Loading...</p>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="page-main center-content" style={{ paddingTop: "64px" }}>
        <div className="text-center">
          <h1 style={{ fontSize: "4rem", fontWeight: 700 }}>404</h1>
          <p className="text-muted" style={{ marginBottom: "1rem" }}>Listing not found</p>
          <Link to="/my-listings" className="link-primary">← Back to My Listings</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-main" style={{ paddingTop: "64px" }}>
      <div className="container narrow">

        {/* ── HEADER ── */}
        <div className="breadcrumb">
          <Link to="/my-listings" className="link-primary">← My Listings</Link>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Edit Listing</h1>
          <p className="text-muted text-sm">Editing: {title}</p>
        </div>

        <div className="sell-layout">

          {/* ── LEFT: FORM ── */}
          <div className="sell-form">

            {/* Images */}
            <div className="form-card">
              <h3 className="form-card-title">Photos</h3>
              <p className="text-muted text-sm" style={{ marginBottom: "1rem" }}>
                {totalImages}/6 photos · First photo is the cover image
              </p>

              {/* Existing images from server */}
              {existingImages.length > 0 && (
                <div className="upload-thumbs" style={{ marginBottom: "1rem" }}>
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`} className="upload-thumb">
                      <img src={src} alt={`Photo ${i + 1}`} />
                      <button className="remove-thumb" onClick={() => removeExistingImage(i)}>✕</button>
                      {i === 0 && newImages.length === 0 && (
                        <span style={{
                          position: "absolute", bottom: "4px", left: "4px",
                          background: "var(--primary)", color: "#fff",
                          fontSize: "0.6rem", padding: "1px 5px", borderRadius: "3px", fontWeight: 600,
                        }}>Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Newly added images */}
              {newImages.length > 0 && (
                <div className="upload-thumbs" style={{ marginBottom: "1rem" }}>
                  {newImages.map((img, i) => (
                    <div key={`new-${i}`} className="upload-thumb">
                      <img src={img.preview} alt={`New photo ${i + 1}`} />
                      <button className="remove-thumb" onClick={() => removeNewImage(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {totalImages < 6 && (
                <>
                  <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                    <span className="upload-text">Click to add more photos</span>
                    <span className="upload-subtext">{6 - totalImages} remaining</span>
                  </div>
                  <input
                    type="file" ref={fileInputRef} accept="image/*"
                    multiple style={{ display: "none" }}
                    onChange={handleImageUpload}
                  />
                </>
              )}
            </div>

            {/* Details */}
            <div className="form-card">
              <h3 className="form-card-title">Listing Details</h3>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text" value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fender Stratocaster '62 Reissue"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={5} value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the item's history, features, and any wear or modifications..."
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <div className="pill-group">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      className={`pill-btn${category === c ? " active" : ""}`}
                      onClick={() => setCategory(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Condition *</label>
                <div className="pill-group">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      className={`pill-btn${condition === c ? " active" : ""}`}
                      onClick={() => setCondition(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="form-card">
              <h3 className="form-card-title">Pricing</h3>
              <div className="form-group">
                <label>Price *</label>
                <div className="price-input-wrap">
                  <span className="price-symbol">$</span>
                  <input
                    type="number" value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Seller type */}
            <div className="form-card">
              <h3 className="form-card-title">Selling Fees</h3>
              <div style={{ border: "0.5px solid var(--border)", borderRadius: "calc(var(--radius) - 4px)", overflow: "hidden", marginBottom: "0.75rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--muted)", borderBottom: "0.5px solid var(--border)" }}>
                  <div style={{ padding: "0.4rem 0.75rem", fontWeight: 600, color: "var(--muted-foreground)", fontSize: "0.78rem" }}>Seller type</div>
                  <div style={{ padding: "0.4rem 0.75rem", fontWeight: 600, color: "var(--muted-foreground)", fontSize: "0.78rem", borderLeft: "0.5px solid var(--border)" }}>Fee</div>
                </div>
                {[
                  { value: "standard",  label: "Standard",  fee: "3.19% + $0.49" },
                  { value: "preferred", label: "Preferred", fee: "2.99% + $0.49" },
                ].map((opt, i) => (
                  <label
                    key={opt.value}
                    htmlFor={`edit-seller-${opt.value}`}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 1fr",
                      cursor: "pointer",
                      background: sellerType === opt.value ? "var(--muted)" : "transparent",
                      borderBottom: i === 0 ? "0.5px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ padding: "0.55rem 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.78rem", fontWeight: sellerType === opt.value ? 600 : 400, color: sellerType === opt.value ? "var(--primary)" : "var(--foreground)" }}>
                      <input
                        type="radio" id={`edit-seller-${opt.value}`}
                        name="editSellerType" value={opt.value}
                        checked={sellerType === opt.value}
                        onChange={() => setSellerType(opt.value)}
                        style={{ accentColor: "var(--primary)" }}
                      />
                      {opt.label}
                    </div>
                    <div style={{ padding: "0.55rem 0.75rem", fontSize: "0.78rem", color: "var(--muted-foreground)", borderLeft: "0.5px solid var(--border)", display: "flex", alignItems: "center" }}>
                      {opt.fee}
                    </div>
                  </label>
                ))}
              </div>

              {/* Live fee breakdown */}
              {price && Number(price) > 0 && (
                <div style={{ fontSize: "0.8rem" }}>
                  {[
                    { label: "Item price", value: `$${Number(price).toLocaleString()}` },
                    { label: "Est. shipping", value: fees.shipping === 0 ? "Free" : `$${fees.shipping.toFixed(2)}` },
                    { label: `Transaction fee (${(fees.transactionRate * 100).toFixed(2)}% + $0.49)`, value: `-$${fees.transactionFee.toFixed(2)}`, red: true },
                    { label: "Selling fee (3%)", value: `-$${fees.sellingFee.toFixed(2)}`, red: true },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", color: row.red ? "var(--destructive)" : "var(--muted-foreground)", marginBottom: "0.2rem" }}>
                      <span style={{ color: "var(--muted-foreground)" }}>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.9rem", borderTop: "0.5px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.35rem" }}>
                    <span>You receive</span>
                    <span style={{ color: "var(--primary)" }}>${fees.youReceive.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {saveError && (
              <p style={{
                color: "var(--destructive)", fontSize: "0.875rem",
                marginBottom: "0.75rem", padding: "0.6rem 0.75rem",
                background: "var(--muted)", borderRadius: "var(--radius)",
                border: "0.5px solid var(--destructive)",
              }}>
                {saveError}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link to="/my-listings" className="btn btn-outline btn-lg">
                Cancel
              </Link>
            </div>
          </div>

          {/* ── RIGHT: PREVIEW ── */}
          <div className="sell-preview">
            {showPreview && (
              <div className="listing-preview">
                <h3 className="filter-title text-primary">Listing Preview</h3>
                <p className="listing-preview-title">{title}</p>
                <div className="listing-preview-meta">
                  {price && <span className="listing-preview-price">${Number(price).toLocaleString()}</span>}
                  {condition && <span className="badge badge-secondary">{condition}</span>}
                </div>
                {category && <p className="text-muted text-xs">{category}</p>}
                {(existingImages[0] || newImages[0]?.preview) && (
                  <img
                    src={existingImages[0] || newImages[0].preview}
                    alt="Preview"
                    style={{ width: "100%", borderRadius: "var(--radius)", marginTop: "0.75rem", objectFit: "cover", maxHeight: "200px" }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default EditListing;

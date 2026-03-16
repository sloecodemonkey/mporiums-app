// ============================================================
// Sell.jsx
// Converted from #page-sell in index.html and
// initSellPage(), selectSellCategory(), selectSellCondition(),
// handleImageUpload(), removeUploadedImage(), renderUploadThumbs(),
// updateListingPreview(), handlePublishListing() in script.js
// ============================================================
// Your old sell page was driven by jQuery in a roundabout way:
//
//   initSellPage() ran on every tiny change — it rebuilt the
//   entire category and condition pill buttons from scratch
//   each time a user clicked one, just to update which one
//   had the "active" class.
//
//   updateListingPreview() was called by jQuery event delegation:
//   jQuery(document).on("input", "#sellTitle, #sellPrice", ...)
//   This listened globally for any typing in those two inputs.
//
//   renderUploadThumbs() rebuilt the entire thumbnail grid as
//   an HTML string and injected it into #uploadThumbs every time
//   an image was added or removed.
//
// In React, all of this becomes straightforward state:
//   - sellTitle, sellPrice, sellCategory, sellCondition → useState
//   - images → useState array of object URLs
//   - The preview and pill buttons render directly from state
//   - No event delegation, no HTML injection, no initSellPage()
// ============================================================

import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Sell categories and conditions
// Was: defined inside initSellPage() as local var arrays
const sellCategories = [
  "Guitars & Basses",
  "Synthesizers",
  "Headphones",
  "Speakers & Monitors",
  "Microphones",
  "DJ Equipment",
];

const sellConditions = ["Like New", "Excellent", "Good", "Fair"];

function Sell() {

  // ----------------------------------------------------------
  // STATE — replaces 4 global variables in script.js
  // ----------------------------------------------------------

  // Was: var sellCategory = ""  (global)
  const [sellCategory, setSellCategory] = useState("");

  // Was: var sellCondition = ""  (global)
  const [sellCondition, setSellCondition] = useState("");

  // Was: var uploadedImages = []  (global)
  // Each entry is an object URL created from the uploaded file
  const [uploadedImages, setUploadedImages] = useState([]);

  // Was: jQuery("#sellTitle").val() read on every preview update
  // Now: controlled input — React owns the value at all times
  const [sellTitle, setSellTitle] = useState("");

  // Was: jQuery("#sellPrice").val() read on every preview update
  const [sellPrice, setSellPrice] = useState("");

  // Was: jQuery("#sellDescription") — not explicitly tracked in old JS
  const [sellDescription, setSellDescription] = useState("");

  // Ref for the hidden file input
  // Was: onclick="document.getElementById('fileInput').click()"
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  // ----------------------------------------------------------
  // LIVE PREVIEW — replaces updateListingPreview()
  // ----------------------------------------------------------
  // Was: function updateListingPreview() {
  //        var title = jQuery("#sellTitle").val();
  //        var price = jQuery("#sellPrice").val();
  //        if (title || price) {
  //          jQuery("#listingPreview").slideDown(200);
  //          jQuery("#previewTitle").text(title);
  //          ...
  //        } else {
  //          jQuery("#listingPreview").slideUp(200);
  //        }
  //      }
  //      Called via: jQuery(document).on("input", "#sellTitle, #sellPrice", ...)
  //
  // Now: we just compute showPreview from the current state values.
  // Every keystroke in the title/price inputs updates state,
  // which re-renders this component, which recalculates showPreview.
  // No event delegation needed at all.
  const showPreview = !!(sellTitle || sellPrice);

  // ----------------------------------------------------------
  // IMAGE UPLOAD — replaces handleImageUpload() + renderUploadThumbs()
  // ----------------------------------------------------------
  // Was: handleImageUpload pushed to the global uploadedImages array,
  //      then renderUploadThumbs() rebuilt the entire thumb HTML.
  // Now: we add new object URLs to the uploadedImages state array.
  //      The thumbnail grid renders directly from that array.
  function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    const remaining = 8 - uploadedImages.length; // max 8 images

    const newImages = files
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, remaining)
      .map((f) => URL.createObjectURL(f));

    setUploadedImages((prev) => [...prev, ...newImages]);

    // Reset the input so the same file can be re-selected if needed
    e.target.value = "";
  }

  // Remove one image by index
  // Was: function removeUploadedImage(i) {
  //        uploadedImages.splice(i, 1);
  //        renderUploadThumbs();
  //      }
  // Now: .filter() keeps everything except index i
  function removeUploadedImage(i) {
    setUploadedImages((prev) => prev.filter((_, index) => index !== i));
  }

  // ----------------------------------------------------------
  // PUBLISH — replaces handlePublishListing()
  // ----------------------------------------------------------
  // Was: read values from DOM with jQuery, validate, alert, showPage("shop")
  // Now: read from state, validate, navigate to /shop
  function handlePublishListing() {
    if (!sellTitle.trim() || !sellPrice || !sellCategory || !sellCondition) {
      alert("Please fill in all required fields (title, price, category, condition).");
      return;
    }
    alert("Listing published! (Requires backend integration)");
    navigate("/shop");
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------

  return (
    <main className="page-main">
      <div className="container">

        {/* Page header */}
        <div className="sell-header">
          <h1 className="page-title">List Your Gear</h1>
          <p className="text-muted">Fill out the details below to create your listing.</p>
        </div>

        {/* Sign in required notice
            Was: jQuery("#signinRequiredBox").show() inside initSellPage()
            This is always visible for now — in a real app you'd check
            if the user is logged in and hide it conditionally */}
        <div className="signin-required-box">
          <p className="signin-required-text">You need to sign in to list items.</p>
          <Link to="/auth" className="btn btn-primary">Sign In / Sign Up</Link>
        </div>

        <div className="sell-layout">

          {/* ── LEFT COLUMN: Images & Details ── */}
          <div className="sell-main">

            {/* IMAGE UPLOAD SECTION */}
            <div className="form-group">
              <label className="label-with-icon">
                <img src="/icons/camera.svg" alt="Photos" style={{ width: "1.25rem", height: "1.25rem" }} />
                Photos{" "}
                {/* Was: (0/8) hardcoded — now shows the real count */}
                <span className="text-muted text-xs">({uploadedImages.length}/8)</span>
              </label>

              {/* Upload area
                  Was: onclick="document.getElementById('fileInput').click()"
                  Now: onClick={() => fileInputRef.current.click()} */}
              {uploadedImages.length < 8 && (
                <div
                  className="upload-area"
                  onClick={() => fileInputRef.current.click()}
                  style={{ cursor: "pointer" }}
                >
                  <span className="upload-icon">📤</span>
                  <span className="upload-text">Click or drag to upload images</span>
                </div>
              )}

              {/* Hidden file input
                  Was: <input id="fileInput" onchange="handleImageUpload(event)">
                  Now: ref={fileInputRef} + onChange={handleImageUpload} */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />

              {/* THUMBNAIL GRID
                  Was: <div id="uploadThumbs"></div>
                       renderUploadThumbs() injected HTML strings here
                  Now: uploadedImages.map() renders thumbnails directly */}
              {uploadedImages.length > 0 && (
                <div className="upload-thumbs">
                  {uploadedImages.map((src, i) => (
                    <div key={i} className="upload-thumb">
                      <img src={src} alt={`Upload ${i + 1}`} />
                      {/* Was: onclick="removeUploadedImage(0)"
                          Now: onClick={() => removeUploadedImage(i) */}
                      <button
                        className="upload-thumb-remove"
                        onClick={() => removeUploadedImage(i)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="separator" />

            {/* TITLE INPUT
                Was: <input id="sellTitle"> read by jQuery("#sellTitle").val()
                     and jQuery(document).on("input", "#sellTitle", updateListingPreview)
                Now: value={sellTitle} + onChange updates state on every keystroke.
                     The preview updates automatically — no event delegation needed. */}
            <div className="form-group">
              <label className="label-with-icon">
                <img src="/icons/tag.svg" alt="Title" style={{ width: "1.25rem", height: "1.25rem" }} />
                Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Fender Stratocaster '62 Reissue"
                value={sellTitle}
                onChange={(e) => setSellTitle(e.target.value)}
              />
            </div>

            {/* DESCRIPTION INPUT */}
            <div className="form-group">
              <label className="label-with-icon">
                <img src="/icons/info.svg" alt="Description" style={{ width: "1.25rem", height: "1.25rem" }} />
                Description
              </label>
              <textarea
                rows={5}
                placeholder="Describe condition, history, what's included..."
                value={sellDescription}
                onChange={(e) => setSellDescription(e.target.value)}
              />
            </div>
          </div>

          {/* ── RIGHT SIDEBAR: Price, Category, Condition, Preview ── */}
          <div className="sell-sidebar">

            {/* PRICE INPUT
                Was: <input id="sellPrice"> read by jQuery and event delegation
                Now: controlled input — updates sellPrice state on every keystroke */}
            <div className="form-group">
              <label className="label-with-icon">
                <img src="/icons/tag.svg" alt="Price" style={{ width: "1.25rem", height: "1.25rem" }} />
                Price *
              </label>
              <div className="price-input-wrap">
                <span className="price-symbol">$</span>
                <input
                  type="number"
                  placeholder="0"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                />
              </div>
            </div>

            {/* CATEGORY PILLS
                Was: jQuery.map(sellCategories, ...) built pill HTML strings,
                     injected into #sellCategoryPills.
                     initSellPage() re-ran entirely just to update the active class.
                Now: .map() renders pills directly. Active class is a ternary.
                     onClick just calls setSellCategory() — that's it. */}
            <div className="form-group">
              <label className="label-with-icon">
                <img src="/icons/package.svg" alt="Category" style={{ width: "1.25rem", height: "1.25rem" }} />
                Category *
              </label>
              <div className="pill-group">
                {sellCategories.map((c) => (
                  <button
                    key={c}
                    className={`pill-btn${sellCategory === c ? " active" : ""}`}
                    onClick={() => setSellCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* CONDITION PILLS — same pattern as category */}
            <div className="form-group">
              <label className="label-with-icon">
                <img src="/icons/star.svg" alt="Condition" style={{ width: "1.25rem", height: "1.25rem" }} />
                Condition *
              </label>
              <div className="pill-group">
                {sellConditions.map((c) => (
                  <button
                    key={c}
                    className={`pill-btn${sellCondition === c ? " active" : ""}`}
                    onClick={() => setSellCondition(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <hr className="separator" />

            {/* SELLER PROFILE PREVIEW */}
            <div className="seller-card">
              <h3 className="filter-title">Your Seller Profile</h3>
              <div className="seller-info">
                <div className="seller-avatar">
                  <img src="/icons/user-transparent.svg" alt="User Avatar" style={{ width: "2rem", height: "2rem" }} />
                </div>
                <div>
                  <p className="seller-name">Guest</p>
                  <p className="text-muted text-xs">Sign in to build your reputation</p>
                </div>
              </div>
            </div>

            {/* LIVE LISTING PREVIEW
                Was: <div id="listingPreview" style="display:none;">
                     shown/hidden with jQuery slideDown/slideUp
                     each field populated individually by ID
                Now: {showPreview && (...)} — renders when title or price has text.
                     All values come directly from state — no IDs needed. */}
            {showPreview && (
              <div className="listing-preview">
                <h3 className="filter-title text-primary">Listing Preview</h3>
                <p className="listing-preview-title">{sellTitle}</p>
                <div className="listing-preview-meta">
                  {/* Show formatted price if entered */}
                  {sellPrice && (
                    <span className="listing-preview-price">
                      ${Number(sellPrice).toLocaleString()}
                    </span>
                  )}
                  {/* Show condition badge only if a condition is selected */}
                  {sellCondition && (
                    <span className="badge badge-secondary">{sellCondition}</span>
                  )}
                </div>
                {/* Show category if selected */}
                {sellCategory && (
                  <p className="text-muted text-xs">{sellCategory}</p>
                )}
              </div>
            )}

            {/* PUBLISH BUTTON
                Was: onclick="handlePublishListing()"
                Now: onClick={handlePublishListing} reads from state */}
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handlePublishListing}
            >
              Publish Listing
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Sell;

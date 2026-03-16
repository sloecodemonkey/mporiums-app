// ============================================================
// Shop.jsx
// Converted from #page-shop in index.html and
// renderShop(), renderFilters(), applyFilters(), clearFilters()
// in script.js
// ============================================================
// Your old shop page was one of the most jQuery-heavy parts
// of your site. Here's what it did:
//
//   renderShop()      — called renderFilters() then applyFilters()
//   renderFilters()   — built filter buttons as HTML strings and
//                       injected them into #categoryFilters,
//                       #priceFilters, #conditionFilters
//   applyFilters()    — read 4 global variables, filtered the
//                       products array, then injected result HTML
//                       strings into #shopGrid
//
// Every time ANY filter changed, ALL of this ran again from
// scratch — rebuilding and re-injecting every button and card.
//
// In React, none of that is needed. We store the 4 filter
// values in state. The filtered results are calculated directly
// from those values. React re-renders only what changed.
// No HTML strings. No injection. No global variables.
//
// BONUS: The Shop now reads ?search= and ?category= from the
// URL, so clicking a category on the Home page pre-selects
// the filter automatically.
// ============================================================

import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import products from "../data/products";

// ── Filter data ─────────────────────────────────────────────
// Was: var categories = [...] at the top of script.js
// Now: defined here, used only by this component
const categories = [
  "All",
  "Guitars & Basses",
  "Synthesizers",
  "Headphones",
  "Speakers & Monitors",
  "Microphones",
  "DJ Equipment",
];

const conditions = ["All", "Like New", "Excellent", "Good", "Fair"];

const priceRanges = [
  { label: "All",            min: 0,    max: Infinity },
  { label: "Under $250",     min: 0,    max: 250      },
  { label: "$250 – $500",    min: 250,  max: 500      },
  { label: "$500 – $1,000",  min: 500,  max: 1000     },
  { label: "$1,000 – $2,000",min: 1000, max: 2000     },
  { label: "$2,000+",        min: 2000, max: Infinity  },
];

// ============================================================
// Shop Component
// ============================================================
function Shop() {

  // ----------------------------------------------------------
  // READ URL PARAMS
  // ----------------------------------------------------------
  // useSearchParams reads the ?search= and ?category= values
  // from the URL. This is how Home.jsx passes filter values
  // to the Shop when a user clicks a category card or
  // submits the hero search.
  //
  // e.g. /shop?category=Headphones
  //      /shop?search=fender
  //
  // Was: selectedCategory and searchQuery were global variables
  //      set by filterByCategory() and handleHeroSearch()
  //      before calling showPage("shop")
  const [searchParams] = useSearchParams();

  // ----------------------------------------------------------
  // STATE — replaces the 4 global filter variables in script.js
  // ----------------------------------------------------------

  // Was: var selectedCategory = "All"
  // Read from URL if present, otherwise default to "All"
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );

  // Was: var selectedCondition = "All"
  const [selectedCondition, setSelectedCondition] = useState("All");

  // Was: var selectedPriceRange = priceRanges[0]
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);

  // Was: var searchQuery = ""
  // Read from URL if present, otherwise default to ""
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );

  // Was: var sortBy read from jQuery("#sortSelect").val()
  const [sortBy, setSortBy] = useState("Newest");

  // ----------------------------------------------------------
  // SYNC URL PARAMS IF THEY CHANGE
  // ----------------------------------------------------------
  // If the user navigates from Home → Shop with a new category,
  // this effect makes sure the filter updates to match the URL.
  // The [searchParams] means "run this whenever the URL changes".
  useEffect(() => {
    const cat    = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat)    setSelectedCategory(cat);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // ----------------------------------------------------------
  // FILTERING + SORTING — replaces applyFilters() in script.js
  // ----------------------------------------------------------
  // Was: applyFilters() used jQuery.grep() and four global
  //      variables to build a results array, then injected
  //      HTML strings into #shopGrid.
  //
  // Now: we calculate filteredProducts directly from state.
  // This runs automatically whenever any filter state changes.
  // React re-renders the grid with the new results.
  // No function call needed. No jQuery. No injection.

  const filteredProducts = products
    // Step 1: filter by category
    .filter((p) =>
      selectedCategory === "All" ? true : p.category === selectedCategory
    )
    // Step 2: filter by condition
    .filter((p) =>
      selectedCondition === "All" ? true : p.condition === selectedCondition
    )
    // Step 3: filter by price range
    .filter((p) =>
      p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max
    )
    // Step 4: filter by search query — checks title, category, and seller
    // Was: p.title.toLowerCase().indexOf(q) === -1
    // Now: .includes() does the same thing, easier to read
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q)    ||
        p.category.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
      );
    })
    // Step 5: sort
    // Was: results.sort(function(a, b) { return a.price - b.price; })
    // Now: we use .slice() first to avoid mutating the original array,
    //      then sort the copy
    .slice()
    .sort((a, b) => {
      if (sortBy === "Price: Low to High")  return a.price - b.price;
      if (sortBy === "Price: High to Low")  return b.price - a.price;
      return 0; // "Newest" — keep original order
    });

  // ----------------------------------------------------------
  // ACTIVE FILTERS CHECK — replaces hasActiveFilters()
  // ----------------------------------------------------------
  // Was: function hasActiveFilters() {
  //        return selectedCategory !== "All" || ...
  //      }
  // Now: same logic, just a variable instead of a function
  const hasActiveFilters =
    selectedCategory !== "All"           ||
    selectedCondition !== "All"          ||
    selectedPriceRange.label !== "All"   ||
    searchQuery !== "";

  // ----------------------------------------------------------
  // CLEAR FILTERS — replaces clearFilters() in script.js
  // ----------------------------------------------------------
  // Was: function clearFilters() {
  //        selectedCategory = "All";
  //        selectedCondition = "All";
  //        selectedPriceRange = priceRanges[0];
  //        searchQuery = "";
  //        renderShop();
  //      }
  // Now: reset all four state values — React re-renders automatically
  function clearFilters() {
    setSelectedCategory("All");
    setSelectedCondition("All");
    setSelectedPriceRange(priceRanges[0]);
    setSearchQuery("");
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------
  return (
    <main className="page-main">
      <div className="container">

        {/* ── SHOP HEADER: title, item count, sort dropdown ── */}
        <div className="shop-header">
          <div>
            {/* Was: jQuery("#shopTitle").text(searchQuery ? 'Results for "..."' : "Shop Gear")
                Now: we render this directly using a ternary expression.
                {searchQuery ? ... : ...} means "if searchQuery has text, show
                the first thing, otherwise show the second thing" */}
            <h1 className="page-title">
              {searchQuery ? `Results for "${searchQuery}"` : "Shop Gear"}
            </h1>

            {/* Was: jQuery("#shopCount").text(results.length + " items found") */}
            <p className="text-muted">{filteredProducts.length} items found</p>
          </div>

          <div className="shop-controls">
            {/* Sort dropdown
                Was: <select id="sortSelect" onchange="applyFilters()">
                Now: value={sortBy} keeps it controlled by state
                     onChange updates sortBy which re-triggers filtering */}
            <select
              className="select-control"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="shop-layout">

          {/* ── SIDEBAR FILTERS ── */}
          {/* Was: three empty divs populated by renderFilters() with HTML strings
              Now: each filter section is a .map() loop over its data array */}
          <aside className="shop-sidebar hide-mobile">

            {/* CATEGORY FILTER
                Was: jQuery.map(categories, function(c) {
                       return '<button class="filter-btn' + (selectedCategory === c ? ' active' : '') + '"...'
                     })
                Now: categories.map() renders a button for each.
                     The active class is added using a ternary:
                     className={`filter-btn${selectedCategory === c ? " active" : ""}`}
                     means: "always have filter-btn, add active only if selected" */}
            <div className="filter-section">
              <h4 className="filter-title">Category</h4>
              <div className="filter-options">
                {categories.map((c) => (
                  <button
                    key={c}
                    className={`filter-btn${selectedCategory === c ? " active" : ""}`}
                    onClick={() => setSelectedCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* PRICE RANGE FILTER */}
            <div className="filter-section">
              <h4 className="filter-title">Price Range</h4>
              <div className="filter-options">
                {priceRanges.map((r) => (
                  <button
                    key={r.label}
                    className={`filter-btn${selectedPriceRange.label === r.label ? " active" : ""}`}
                    onClick={() => setSelectedPriceRange(r)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CONDITION FILTER */}
            <div className="filter-section">
              <h4 className="filter-title">Condition</h4>
              <div className="filter-options">
                {conditions.map((c) => (
                  <button
                    key={c}
                    className={`filter-btn${selectedCondition === c ? " active" : ""}`}
                    onClick={() => setSelectedCondition(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* CLEAR FILTERS BUTTON
                Was: <button style="display:none" id="clearFiltersBtn">
                     shown/hidden with jQuery("#clearFiltersBtn").toggle(hasActiveFilters())
                Now: {hasActiveFilters && <button>} — only renders when a filter is active */}
            {hasActiveFilters && (
              <button
                className="btn btn-outline btn-sm btn-full"
                onClick={clearFilters}
              >
                ✕ Clear Filters
              </button>
            )}
          </aside>

          {/* ── PRODUCT GRID ── */}
          <div className="shop-grid-wrapper">

            {/* EMPTY STATE
                Was: jQuery("#shopEmpty").show() / hide()
                     with display:none by default
                Now: only renders when filteredProducts is empty */}
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">No items match your filters</p>
                <p className="text-muted">Try adjusting your criteria</p>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={clearFilters}
                  style={{ marginTop: "1rem" }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              // RESULTS GRID
              // Was: jQuery("#shopGrid").html(jQuery.map(results, function(p) {
              //        return renderListingCard(p);
              //      }).join(""))
              // Now: filteredProducts.map() renders a ProductCard for each result
              <div className="listing-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Shop;

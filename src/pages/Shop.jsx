// ============================================================
// Shop.jsx
// ============================================================

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchListings, fetchCategories } from "../utils/api";

const conditions = ["All", "Like New", "Excellent", "Good", "Fair"];

const priceRanges = [
  { label: "All",             min: 0,    max: Infinity },
  { label: "Under $250",      min: 0,    max: 250      },
  { label: "$250 – $500",     min: 250,  max: 500      },
  { label: "$500 – $1,000",   min: 500,  max: 1000     },
  { label: "$1,000 – $2,000", min: 1000, max: 2000     },
  { label: "$2,000+",         min: 2000, max: Infinity  },
];

// ============================================================
// Shop Component
// ============================================================
function Shop() {

  const [searchParams] = useSearchParams();

  // ── Data from API ─────────────────────────────────────────
  const [allListings, setAllListings]   = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ── Filters ───────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState("Newest");

  // ── Fetch listings + categories on mount ──────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [listings, cats] = await Promise.all([
          fetchListings(),
          fetchCategories(),
        ]);
        setAllListings(listings);
        setCategoryNames(["All", ...cats.map((c) => c.name)]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Sync URL params ───────────────────────────────────────
  useEffect(() => {
    const cat    = searchParams.get("category");
    const search = searchParams.get("search");
    if (cat)    setSelectedCategory(cat);
    if (search) setSearchQuery(search);
  }, [searchParams]);

  // ── Filter + sort ─────────────────────────────────────────
  const filteredProducts = allListings
    .filter((p) => selectedCategory === "All" ? true : p.category === selectedCategory)
    .filter((p) => selectedCondition === "All" ? true : p.condition === selectedCondition)
    .filter((p) => p.price >= selectedPriceRange.min && p.price <= selectedPriceRange.max)
    .filter((p) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q)
      );
    })
    .slice()
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      return 0;
    });

  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedCondition !== "All" ||
    selectedPriceRange.label !== "All" ||
    searchQuery !== "";

  function clearFilters() {
    setSelectedCategory("All");
    setSelectedCondition("All");
    setSelectedPriceRange(priceRanges[0]);
    setSearchQuery("");
  }

  // ----------------------------------------------------------
  // JSX
  // ----------------------------------------------------------
  if (error) {
    return (
      <main className="page-main center-content">
        <p className="text-muted">Failed to load listings: {error}</p>
      </main>
    );
  }

  return (
    <main className="page-main">
      <div className="container">

        {/* ── SHOP HEADER: title, item count, sort dropdown ── */}
        <div className="shop-header">
          <div>
            <h1 className="page-title">
              {searchQuery ? `Results for "${searchQuery}"` : "Shop Gear"}
            </h1>
            <p className="text-muted">
              {loading ? "Loading..." : `${filteredProducts.length} items found`}
            </p>
          </div>

          <div className="shop-controls">
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
          <aside className="shop-sidebar hide-mobile">

            {/* CATEGORY FILTER */}
            <div className="filter-section">
              <h4 className="filter-title">Category</h4>
              <div className="filter-options">
                {categoryNames.map((c) => (
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
               */}
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

            {loading ? (
              <div className="empty-state">
                <p className="text-muted">Loading listings...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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

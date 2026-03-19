// ============================================================
// PriceGuide.jsx
// src/pages/PriceGuide.jsx
// Route: /price-guide
// ============================================================
// Shows recent sold prices for gear categories so buyers
// know if a listing is fairly priced and sellers can price
// their items competitively.
//
// Sections:
//   - Search bar to find a specific instrument
//   - Category tabs
//   - Recent sales table with price range, avg, and trend
//   - Price history chart per item
// ============================================================

import { useState } from "react";
import { Link } from "react-router-dom";

// ── Seed sold prices data ─────────────────────────────────────
// In production: GET /api/price-guide?q=fender
const SOLD_DATA = [
  {
    id: "pg1", title: "Fender Stratocaster '62 Reissue",
    category: "Guitars & Basses", condition: "Excellent",
    avgPrice: 1420, lowPrice: 1100, highPrice: 1750,
    lastSold: 1450, trend: "up", trendPct: 4,
    salesCount: 12, image: "/images/fender-stratocaster.jpg",
    history: [1100, 1250, 1300, 1380, 1420, 1450],
  },
  {
    id: "pg2", title: "Roland Juno-106 Synthesizer",
    category: "Synthesizers", condition: "Good",
    avgPrice: 2650, lowPrice: 2100, highPrice: 3200,
    lastSold: 2800, trend: "up", trendPct: 8,
    salesCount: 7, image: "/images/roland-juno-106.jpg",
    history: [2100, 2300, 2450, 2550, 2650, 2800],
  },
  {
    id: "pg3", title: "Sennheiser HD 650",
    category: "Headphones", condition: "Like New",
    avgPrice: 270, lowPrice: 220, highPrice: 380,
    lastSold: 280, trend: "stable", trendPct: 1,
    salesCount: 24, image: "/images/sennheiser-hd650.jpg",
    history: [250, 260, 265, 270, 275, 280],
  },
  {
    id: "pg4", title: "Yamaha HS8 Studio Monitors (Pair)",
    category: "Speakers & Monitors", condition: "Excellent",
    avgPrice: 490, lowPrice: 380, highPrice: 650,
    lastSold: 520, trend: "down", trendPct: 3,
    salesCount: 18, image: "/images/yamaha-hs8.jpg",
    history: [560, 540, 520, 505, 495, 490],
  },
  {
    id: "pg5", title: "Shure SM7B Microphone",
    category: "Microphones", condition: "Like New",
    avgPrice: 320, lowPrice: 270, highPrice: 420,
    lastSold: 340, trend: "stable", trendPct: 2,
    salesCount: 31, image: "/images/shure-sm7b.jpg",
    history: [310, 315, 320, 318, 325, 340],
  },
  {
    id: "pg6", title: "Pioneer CDJ-2000NXS2",
    category: "DJ Equipment", condition: "Good",
    avgPrice: 1550, lowPrice: 1200, highPrice: 2100,
    lastSold: 1600, trend: "down", trendPct: 5,
    salesCount: 9, image: "/images/pioneer-cdj-2000.jpg",
    history: [1900, 1800, 1720, 1650, 1600, 1550],
  },
  {
    id: "pg7", title: "Gibson Les Paul Standard",
    category: "Guitars & Basses", condition: "Excellent",
    avgPrice: 2200, lowPrice: 1800, highPrice: 2800,
    lastSold: 2350, trend: "up", trendPct: 6,
    salesCount: 15, image: "/images/fender-stratocaster.jpg",
    history: [1900, 2000, 2100, 2150, 2200, 2350],
  },
  {
    id: "pg8", title: "Moog Subsequent 37",
    category: "Synthesizers", condition: "Like New",
    avgPrice: 1450, lowPrice: 1200, highPrice: 1800,
    lastSold: 1500, trend: "stable", trendPct: 1,
    salesCount: 5, image: "/images/roland-juno-106.jpg",
    history: [1400, 1420, 1440, 1450, 1460, 1500],
  },
];

const CATEGORIES = ["All", "Guitars & Basses", "Synthesizers", "Headphones", "Speakers & Monitors", "Microphones", "DJ Equipment"];

// ── Mini sparkline chart ──────────────────────────────────────
function Sparkline({ data, trend }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  const color = trend === "up" ? "#3B6D11" : trend === "down" ? "#A32D2D" : "var(--primary)";

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PriceGuide() {

  const [search, setSearch]         = useState("");
  const [category, setCategory]     = useState("All");
  const [expanded, setExpanded]     = useState(null);

  const filtered = SOLD_DATA.filter((item) => {
    const matchCat  = category === "All" || item.category === category;
    const matchSearch = search === "" ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const trendIcon = (trend, pct) => {
    if (trend === "up")     return { icon: "↑", color: "#3B6D11", label: `+${pct}%` };
    if (trend === "down")   return { icon: "↓", color: "#A32D2D", label: `-${pct}%` };
    return { icon: "→", color: "var(--muted-foreground)", label: `${pct}%` };
  };

  return (
    <main className="page-main" style={{ paddingTop: "64px" }}>
      <div className="container">

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", padding: "2rem 0 2.5rem" }}>
          <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>Price Guide</h1>
          <p className="text-muted" style={{ fontSize: "1.05rem", maxWidth: "480px", margin: "0 auto 1.5rem" }}>
            Real sold prices from M.Poriums transactions. Know what gear is actually worth before you buy or sell.
          </p>

          {/* Search */}
          <div className="search-bar" style={{ maxWidth: "480px", margin: "0 auto" }}>
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              placeholder="Search instruments, brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          {[
            { label: "Items tracked",   value: SOLD_DATA.length },
            { label: "Total sales",     value: SOLD_DATA.reduce((s, i) => s + i.salesCount, 0) },
            { label: "Avg price",       value: `$${Math.round(SOLD_DATA.reduce((s, i) => s + i.avgPrice, 0) / SOLD_DATA.length).toLocaleString()}` },
            { label: "Last updated",    value: "Today" },
          ].map((stat) => (
            <div key={stat.label} style={{
              flex: 1, minWidth: "120px",
              background: "var(--card)", border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)", padding: "1rem", textAlign: "center",
            }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--primary)" }}>
                {stat.value}
              </div>
              <div className="text-muted text-xs">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`filter-btn${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
              style={{ fontSize: "0.8rem" }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* ── PRICE TABLE ── */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">No results found</p>
            <p className="text-muted">Try a different search or category.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "3rem" }}>
            {filtered.map((item) => {
              const trend = trendIcon(item.trend, item.trendPct);
              const isExpanded = expanded === item.id;

              return (
                <div key={item.id} style={{
                  background: "var(--card)",
                  border: `0.5px solid ${isExpanded ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  transition: "border-color 0.15s",
                }}>
                  {/* Main row */}
                  <div
                    style={{
                      display: "flex", alignItems: "center",
                      gap: "1rem", padding: "1rem",
                      cursor: "pointer", flexWrap: "wrap",
                    }}
                    onClick={() => setExpanded(isExpanded ? null : item.id)}
                  >
                    {/* Image */}
                    <div style={{
                      width: "56px", height: "56px", borderRadius: "8px",
                      overflow: "hidden", flexShrink: 0, background: "var(--muted)",
                    }}>
                      <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>

                    {/* Title */}
                    <div style={{ flex: 1, minWidth: "140px" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", margin: "0 0 0.15rem" }}>{item.title}</p>
                      <p className="text-muted text-xs">{item.category} · {item.condition} · {item.salesCount} sales</p>
                    </div>

                    {/* Prices */}
                    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ textAlign: "center" }}>
                        <div className="text-muted text-xs" style={{ marginBottom: "0.15rem" }}>Low</div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>${item.lowPrice.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="text-muted text-xs" style={{ marginBottom: "0.15rem" }}>Average</div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--primary)" }}>${item.avgPrice.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div className="text-muted text-xs" style={{ marginBottom: "0.15rem" }}>High</div>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>${item.highPrice.toLocaleString()}</div>
                      </div>
                    </div>

                    {/* Trend + sparkline */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                      <Sparkline data={item.history} trend={item.trend} />
                      <span style={{ fontSize: "0.85rem", fontWeight: 600, color: trend.color }}>
                        {trend.icon} {trend.label}
                      </span>
                    </div>

                    {/* Expand arrow */}
                    <span style={{
                      color: "var(--muted-foreground)", fontSize: "0.75rem",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s", flexShrink: 0,
                    }}>
                      ▼
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div style={{
                      borderTop: "0.5px solid var(--border)",
                      padding: "1rem",
                      background: "var(--muted)",
                    }}>
                      <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                        <div>
                          <p className="text-muted text-xs" style={{ marginBottom: "0.25rem" }}>Last sold price</p>
                          <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--primary)" }}>
                            ${item.lastSold.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted text-xs" style={{ marginBottom: "0.25rem" }}>Price range</p>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            ${item.lowPrice.toLocaleString()} – ${item.highPrice.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted text-xs" style={{ marginBottom: "0.25rem" }}>6-month trend</p>
                          <p style={{ fontWeight: 600, fontSize: "0.9rem", color: trend.color }}>
                            {trend.icon} {trend.label} over 6 months
                          </p>
                        </div>
                      </div>
                      <Link to={`/shop?q=${encodeURIComponent(item.title)}`} className="btn btn-primary btn-sm">
                        Find listings for this item →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default PriceGuide;

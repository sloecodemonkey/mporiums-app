// ============================================================
// StarRating.jsx
// src/components/StarRating.jsx
// ============================================================
// A reusable star rating component used in two places:
//
//   1. Display mode — shows filled/half/empty stars for a score
//      Used on: SellerProfile (summary + each review card)
//
//   2. Interactive mode — lets a user click to select a rating
//      Used on: ReviewForm when a buyer leaves a review
//
// Props:
//   rating      — number 1–5 (can be a decimal e.g. 4.7)
//   max         — total stars to show (default 5)
//   size        — pixel size of each star (default 18)
//   interactive — if true, stars are clickable
//   onChange    — callback when a star is clicked: (newRating) => {}
// ============================================================

import { useState } from "react";

function StarRating({
  rating = 0,
  max = 5,
  size = 18,
  interactive = false,
  onChange,
}) {
  // hoverRating tracks which star the user is hovering over
  // Only used in interactive mode
  const [hoverRating, setHoverRating] = useState(0);

  // The displayed rating — shows hover state in interactive mode,
  // otherwise shows the actual rating
  const displayRating = interactive && hoverRating ? hoverRating : rating;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "2px",
        cursor: interactive ? "pointer" : "default",
      }}
      // Reset hover when mouse leaves the whole star row
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starNumber = i + 1;

        // Determine fill level for this star:
        //   full  — displayRating >= starNumber
        //   half  — displayRating >= starNumber - 0.5 (only in display mode)
        //   empty — otherwise
        const isFull = displayRating >= starNumber;
        const isHalf = !interactive && displayRating >= starNumber - 0.5 && !isFull;

        return (
          <span
            key={i}
            style={{
              width: size,
              height: size,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              // Scale up slightly on hover in interactive mode
              transform: interactive && hoverRating >= starNumber ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.1s",
            }}
            // Interactive mode event handlers
            onMouseEnter={() => interactive && setHoverRating(starNumber)}
            onClick={() => interactive && onChange && onChange(starNumber)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={size}
              height={size}
              viewBox="0 0 24 24"
              // Filled star uses your primary colour
              // Empty star uses a muted border colour
              fill={isFull || isHalf ? "var(--primary)" : "none"}
              stroke={isFull || isHalf ? "var(--primary)" : "var(--border)"}
              strokeWidth="1.5"
            >
              {isHalf ? (
                // Half star — uses a clipPath to fill only the left side
                <>
                  <defs>
                    <clipPath id={`half-${i}`}>
                      <rect x="0" y="0" width="12" height="24" />
                    </clipPath>
                  </defs>
                  {/* Empty star background */}
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="1.5"
                  />
                  {/* Filled left half */}
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill="var(--primary)"
                    stroke="var(--primary)"
                    strokeWidth="1.5"
                    clipPath={`url(#half-${i})`}
                  />
                </>
              ) : (
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={isFull ? "var(--primary)" : "none"}
                  stroke={isFull ? "var(--primary)" : "var(--border)"}
                  strokeWidth="1.5"
                />
              )}
            </svg>
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;

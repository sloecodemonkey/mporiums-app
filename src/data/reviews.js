// ============================================================
// src/data/reviews.js
// ============================================================
// Placeholder review data for each seller.
// In production this is replaced by:
//   GET /api/sellers/:sellerName/reviews
//
// Each review has:
//   id          — unique identifier
//   seller      — matches the seller name in products.js
//   buyerName   — display name of the reviewer
//   buyerAvatar — initials for the avatar circle
//   rating      — 1 to 5 stars
//   title       — short summary of the review
//   body        — full review text
//   productTitle — what they bought
//   date        — when they left the review
//   verified    — whether this was a verified purchase
// ============================================================

const reviews = [
  // ── VintageAxes ──────────────────────────────────────────
  {
    id: "r1",
    seller: "VintageAxes",
    buyerName: "Marcus T.",
    buyerAvatar: "MT",
    rating: 5,
    title: "Exactly as described, fast shipping",
    body: "The Stratocaster arrived in perfect condition. Packed incredibly well — double boxed with plenty of bubble wrap. The seller was responsive to all my questions before I bought. Would absolutely buy from again.",
    productTitle: "Fender Stratocaster '62 Reissue",
    date: "2024-02-14",
    verified: true,
  },
  {
    id: "r2",
    seller: "VintageAxes",
    buyerName: "Sarah K.",
    buyerAvatar: "SK",
    rating: 5,
    title: "Great seller, honest condition description",
    body: "Really happy with this purchase. The photos matched exactly what arrived. Seller communicated well throughout and shipped the same day. This is how marketplace selling should work.",
    productTitle: "Fender Stratocaster '62 Reissue",
    date: "2024-01-28",
    verified: true,
  },
  {
    id: "r3",
    seller: "VintageAxes",
    buyerName: "DJ Calloway",
    buyerAvatar: "DC",
    rating: 4,
    title: "Good experience overall",
    body: "Gear arrived in good shape, minor cosmetic mark not mentioned in listing but not a big deal. Seller was apologetic and offered a partial refund which I appreciated. Good communication throughout.",
    productTitle: "Fender Stratocaster '62 Reissue",
    date: "2023-12-10",
    verified: true,
  },

  // ── SynthWizard ──────────────────────────────────────────
  {
    id: "r4",
    seller: "SynthWizard",
    buyerName: "Leo P.",
    buyerAvatar: "LP",
    rating: 5,
    title: "Juno-106 in perfect working order",
    body: "All six voices working perfectly. Seller clearly knows their synths — included a detailed condition report and even recorded a short demo video before shipping. Shipping was fast and very well packed. A+ seller.",
    productTitle: "Roland Juno-106 Synthesizer",
    date: "2024-03-01",
    verified: true,
  },
  {
    id: "r5",
    seller: "SynthWizard",
    buyerName: "Priya N.",
    buyerAvatar: "PN",
    rating: 5,
    title: "Knowledgeable seller, great communication",
    body: "Asked a lot of questions before buying and the seller answered every single one in detail. Really knows their equipment. Gear was exactly as described. Will definitely check their listings first next time I'm buying a synth.",
    productTitle: "Roland Juno-106 Synthesizer",
    date: "2024-02-20",
    verified: true,
  },

  // ── AudioPhile99 ─────────────────────────────────────────
  {
    id: "r6",
    seller: "AudioPhile99",
    buyerName: "Tom W.",
    buyerAvatar: "TW",
    rating: 5,
    title: "Headphones like brand new",
    body: "These were genuinely like new — still had the factory film on the ear cups. Seller was honest about usage (under 20 hours) and the headphones confirmed it. Highly recommend.",
    productTitle: "Sennheiser HD 650 Headphones",
    date: "2024-03-05",
    verified: true,
  },
  {
    id: "r7",
    seller: "AudioPhile99",
    buyerName: "Rachel B.",
    buyerAvatar: "RB",
    rating: 4,
    title: "Happy with the purchase",
    body: "Good condition as described. Shipping took a few extra days but the seller kept me updated. Would buy from again.",
    productTitle: "Sennheiser HD 650 Headphones",
    date: "2024-01-15",
    verified: false,
  },

  // ── StudioGear ───────────────────────────────────────────
  {
    id: "r8",
    seller: "StudioGear",
    buyerName: "Carlos M.",
    buyerAvatar: "CM",
    rating: 5,
    title: "Monitors arrived perfectly calibrated",
    body: "Both monitors working flawlessly. Seller included the original cables, manual, and even the foam padding for the drivers. Packed on a pallet so there was zero risk of damage. Professional operation.",
    productTitle: "Yamaha HS8 Studio Monitors (Pair)",
    date: "2024-02-28",
    verified: true,
  },
  {
    id: "r9",
    seller: "StudioGear",
    buyerName: "Janelle F.",
    buyerAvatar: "JF",
    rating: 5,
    title: "Fast shipping, great gear",
    body: "Ordered Monday, arrived Wednesday. Monitors sound incredible — flat response exactly as expected from HS8s. Very well packaged, no damage whatsoever. StudioGear is a go-to seller for me.",
    productTitle: "Yamaha HS8 Studio Monitors (Pair)",
    date: "2024-01-22",
    verified: true,
  },
  {
    id: "r10",
    seller: "StudioGear",
    buyerName: "Ahmed R.",
    buyerAvatar: "AR",
    rating: 3,
    title: "Good gear, slow response",
    body: "The monitors themselves are great and in the condition described. However seller took 3 days to respond to my messages and shipping was slower than expected. Gear is fine, just wish communication was quicker.",
    productTitle: "Yamaha HS8 Studio Monitors (Pair)",
    date: "2023-11-30",
    verified: true,
  },

  // ── ProAudioDeals ─────────────────────────────────────────
  {
    id: "r11",
    seller: "ProAudioDeals",
    buyerName: "Nina O.",
    buyerAvatar: "NO",
    rating: 5,
    title: "SM7B in immaculate condition",
    body: "This mic looks and sounds brand new. Came with all original accessories including the yoke mount and close-talk filter. ProAudioDeals clearly takes care of their equipment. One of the best marketplace purchases I've made.",
    productTitle: "Shure SM7B Microphone",
    date: "2024-03-10",
    verified: true,
  },
  {
    id: "r12",
    seller: "ProAudioDeals",
    buyerName: "Brett H.",
    buyerAvatar: "BH",
    rating: 5,
    title: "Reliable seller, highly recommend",
    body: "My third purchase from ProAudioDeals and every time is the same — great gear, great packaging, fast shipping. They've earned a loyal customer.",
    productTitle: "Shure SM7B Microphone",
    date: "2024-02-05",
    verified: true,
  },

  // ── DJDepot ──────────────────────────────────────────────
  {
    id: "r13",
    seller: "DJDepot",
    buyerName: "Keanu L.",
    buyerAvatar: "KL",
    rating: 4,
    title: "CDJ works great, wear as described",
    body: "Seller was upfront about the club use wear and it matched the photos exactly. Unit works perfectly — all buttons, faders, and jog wheel feel tight. Fair price for what it is.",
    productTitle: "Pioneer CDJ-2000NXS2",
    date: "2024-02-18",
    verified: true,
  },
  {
    id: "r14",
    seller: "DJDepot",
    buyerName: "Mia C.",
    buyerAvatar: "MC",
    rating: 4,
    title: "Good seller, solid gear",
    body: "CDJ arrived well packed. There are scuffs consistent with club use but nothing that affects performance. Seller answered my questions promptly. Would buy from again.",
    productTitle: "Pioneer CDJ-2000NXS2",
    date: "2024-01-08",
    verified: false,
  },
];

export default reviews;

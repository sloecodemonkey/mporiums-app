// ============================================================
// src/utils/api.js
// ============================================================
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Strip the /api suffix to get the server root for static assets (images, uploads)
const SERVER_URL = BASE_URL.replace(/\/api$/, "");

export function getImageUrl(imagePath) {
  if (!imagePath) return "";
  // Already an absolute URL — return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  return `${SERVER_URL}${imagePath}`;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("mporiums-token");

  // Don't set Content-Type for FormData — browser sets it with the boundary
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `API error: ${response.status}`);
  }

  return data;
}

// ── Listing normalizer ────────────────────────────────────────
// Transforms the API's listing shape into what the components expect:
//   images: [{image_url}]  →  images: [string]
//   price: "1450.00"       →  price: 1450
//   username/seller_name   →  seller: string
export function normalizeListing(listing) {
  const imageUrls =
    listing.images && listing.images.length > 0
      ? listing.images.map((img) => getImageUrl(typeof img === "string" ? img : img.image_url))
      : listing.image_url
      ? [getImageUrl(listing.image_url)]
      : [];

  const categoryName =
    listing.categories && listing.categories.length > 0
      ? listing.categories[0].name
      : listing.category || "";

  const seller = listing.username || listing.seller_name || "";
  const sellerAvatar = seller
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "??";

  return {
    ...listing,
    id: String(listing.id),
    price: Number(listing.price),
    images: imageUrls,
    category: categoryName,
    seller,
    sellerAvatar,
    sellerVerified: listing.stripe_account_exists || false,
    rating: 0,
  };
}

// ── Listings ─────────────────────────────────────────────────

export async function fetchListings({ q, category } = {}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("categories", category);
  const qs = params.toString();
  const data = await apiFetch(`/listings${qs ? `?${qs}` : ""}`);
  return (Array.isArray(data) ? data : []).map(normalizeListing);
}

export async function fetchListing(id) {
  const data = await apiFetch(`/listings/${id}`);
  return normalizeListing(data);
}

export async function fetchCategories() {
  return apiFetch("/categories");
}

export async function fetchMyListings(userId) {
  const data = await apiFetch(`/my-listings/${userId}`);
  return (Array.isArray(data) ? data : []).map(normalizeListing);
}

export async function createListing(formData) {
  const data = await apiFetch("/listings", { method: "POST", body: formData });
  return normalizeListing(data);
}

export async function updateListing(id, formData) {
  const data = await apiFetch(`/listings/${id}`, { method: "PUT", body: formData });
  return normalizeListing(data);
}

export async function deleteListing(id) {
  return apiFetch(`/listings/${id}`, { method: "DELETE" });
}

// ── Auth helpers ─────────────────────────────────────────────

// Login — saves token to localStorage on success
export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("mporiums-token", data.token);
  localStorage.setItem("mporiums-user", JSON.stringify(data.user));
  return data.user;
}

// Register — creates the account and sends a verification email.
// Does NOT log the user in; call verifyEmail() after the user submits their code.
export async function register(email, password, { displayName, firstName, lastName } = {}) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, displayName, firstName, lastName }),
  });
  return data; // { user, message }
}

// Verify email — submits the 6-digit code; saves token and logs the user in on success.
export async function verifyEmail(email, code) {
  const data = await apiFetch("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  localStorage.setItem("mporiums-token", data.token);
  localStorage.setItem("mporiums-user", JSON.stringify(data.user));
  return data.user;
}

// Logout — clears token and user from localStorage
export function logout() {
  localStorage.removeItem("mporiums-token");
  localStorage.removeItem("mporiums-user");
}

// Get the currently logged-in user from localStorage
// (doesn't make an API call — just reads from storage)
export function getCurrentUser() {
  try {
    const user = localStorage.getItem("mporiums-user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Check if a user is logged in
export function isLoggedIn() {
  return !!localStorage.getItem("mporiums-token");
}

// ── Wishlist ─────────────────────────────────────────────────

export async function fetchWishlist() {
  return apiFetch("/wishlist"); // returns [listingId, ...]
}

export async function addToWishlist(listingId) {
  return apiFetch(`/wishlist/${listingId}`, { method: "POST" });
}

export async function removeFromWishlist(listingId) {
  return apiFetch(`/wishlist/${listingId}`, { method: "DELETE" });
}

// ── Seller profile ───────────────────────────────────────────

export async function fetchSellerProfile(username) {
  const data = await apiFetch(`/seller/${encodeURIComponent(username)}`);
  return {
    ...data,
    listings: (data.listings || []).map(normalizeListing),
  };
}

// ── Orders ───────────────────────────────────────────────────

export async function fetchMyOrders() {
  const orders = await apiFetch("/orders/mine");
  return (Array.isArray(orders) ? orders : []).map((o) => ({
    ...o,
    items: (o.items || []).map((item) => ({
      ...item,
      productId: String(item.listingId || item.productId || ""),
    })),
  }));
}

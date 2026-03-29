'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";
import { fetchMyListings } from "../utils/api";

export default function StripeOnboardingBanner({ className = '', forceShow = false }) {
  const { user } = useAuth();
  const [hasListings, setHasListings] = useState(false);
  const [loading, setLoading] = useState(!forceShow);

  useEffect(() => {
    if (forceShow) return;
    if (user && !user.stripe_onboarding_complete) {
      checkUserListings();
    } else {
      setLoading(false);
    }
  }, [user, forceShow]);

  const checkUserListings = async () => {
    try {
      const response = await fetchMyListings(user?.id);
      if (response.ok) {
        const listings = await response.json();
        setHasListings(listings.length > 0);
      }
    } catch (error) {
      console.error('Error checking user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show banner if:
  // - Still loading (and not forced)
  // - User not logged in
  // - User has completed Stripe onboarding
  // - User has no listings (and not forced)
  if (!user || user.stripe_onboarding_complete) {
    return null;
  }
  if (!forceShow && (loading || !hasListings)) {
    return null;
  }

  return (
    <div className={`alert alert-warning`} style={{ marginBottom: "2rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <svg
            style={{ width: "1.5rem", height: "1.5rem", flexShrink: 0 }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3>
            Complete Stripe setup to receive payments for your listings
          </h3>
        </div>
        <Link to="/seller-onboarding" className="btn btn-sm btn-primary" style={{ flexShrink: 0 }}>
          Complete Setup
        </Link>
      </div>
    </div>
  );
}

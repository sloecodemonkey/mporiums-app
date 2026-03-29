'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@/contexts';
import { apiUrl } from '@/lib/api';

export default function StripeOnboardingBanner({ className = '', forceShow = false }) {
  const { user } = useUser();
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
      const response = await fetch(`${apiUrl}/api/my-listings/${user?.id}`);
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
    <div className={`bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 px-4 py-3 rounded-lg shadow-md ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 flex-shrink-0"
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
          <p className="font-medium text-sm sm:text-base">
            Complete Stripe setup to receive payments for your listings
          </p>
        </div>
        <Link
          to="/seller-onboarding"
          className="flex-shrink-0 px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
        >
          Complete Setup
        </Link>
      </div>
    </div>
  );
}

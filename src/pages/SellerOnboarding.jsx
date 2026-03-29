// ============================================================
// SellerOnboarding.jsx
// src/pages/SellerOnboarding.jsx
// Route: /seller-onboarding
// ============================================================

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api";

export default function SellerOnboarding() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (user) checkAccountStatus();
  }, [user]);

  async function checkAccountStatus() {
    try {
      setLoading(true);
      const data = await apiFetch(`/stripe/account-status/${user.id}`);
      setStatus(data);
      if (data.onboardingComplete && !user.stripe_onboarding_complete) {
        updateUser({ stripe_onboarding_complete: true, stripe_account_id: data.accountId });
      }
      if (data.onboardingComplete && data.readyToProcessPayments) {
        setTimeout(() => navigate("/sell"), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function createConnectedAccount() {
    try {
      setCreating(true);
      setError(null);
      const data = await apiFetch("/stripe/create-connect-account", {
        method: "POST",
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          displayName: `${user.first_name} ${user.last_name}`,
        }),
      });
      updateUser({ stripe_account_id: data.accountId });
      await startOnboarding(data.accountId);
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  async function startOnboarding(accountId) {
    try {
      setCreating(true);
      setError(null);
      const id = accountId || status?.accountId;
      if (!id) throw new Error("No account ID available");
      const data = await apiFetch("/stripe/create-account-link", {
        method: "POST",
        body: JSON.stringify({
          accountId: id,
          refreshUrl: `${window.location.origin}/seller-onboarding?refresh=true`,
          returnUrl: `${window.location.origin}/seller-onboarding?onboarding=complete`,
        }),
      });
      window.location.href = data.url;
    } catch (err) {
      setError(err.message);
      setCreating(false);
    }
  }

  const cardStyle = {
    background: "var(--card)", border: "0.5px solid var(--border)",
    borderRadius: "var(--radius)", padding: "2rem",
    maxWidth: "480px", margin: "0 auto",
  };

  if (!user) {
    return (
      <main className="page-main" style={{ paddingTop: "64px" }}>
        <div className="container">
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <h2 className="page-title" style={{ marginBottom: "1rem" }}>Please log in to become a seller</h2>
            <Link to="/auth" className="btn btn-primary">Log In</Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="page-main" style={{ paddingTop: "64px" }}>
        <div className="container">
          <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
            <p className="text-muted">Checking your seller status...</p>
          </div>
        </div>
      </main>
    );
  }

  // Onboarding complete
  if (status?.onboardingComplete && status?.readyToProcessPayments) {
    return (
      <main className="page-main" style={{ paddingTop: "64px" }}>
        <div className="container">
          <div style={{ ...cardStyle, textAlign: "center" }}>
            <div style={{
              width: "5rem", height: "5rem", borderRadius: "50%",
              background: "#EAF3DE", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "2rem", margin: "0 auto 1.5rem",
            }}>✓</div>
            <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>You're All Set!</h1>
            <p className="text-muted" style={{ marginBottom: "2rem" }}>
              Your seller account is ready to receive payments. Redirecting you now...
            </p>
            <Link to="/sell" className="btn btn-primary btn-full">Start Selling</Link>
          </div>
        </div>
      </main>
    );
  }

  // Account exists, onboarding incomplete
  if (status?.hasAccount) {
    const row = (label, complete) => (
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0.6rem 0", borderBottom: "0.5px solid var(--border)",
      }}>
        <span className="text-muted" style={{ fontSize: "0.9rem" }}>{label}</span>
        <span style={{ fontWeight: 600, fontSize: "0.85rem", color: complete ? "#3B6D11" : "#633806" }}>
          {complete ? "✓ Complete" : "⏳ Pending"}
        </span>
      </div>
    );
    return (
      <main className="page-main" style={{ paddingTop: "64px" }}>
        <div className="container">
          <div style={cardStyle}>
            <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Complete Your Seller Setup</h1>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>Finish setting up your payment account to start selling</p>

            <div style={{ marginBottom: "1.5rem" }}>
              {row("Account Created", true)}
              {row("Identity Verification", status.onboardingComplete)}
              {row("Payment Processing", status.readyToProcessPayments)}
            </div>

            {error && <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>{error}</div>}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn btn-primary btn-full" onClick={() => startOnboarding()} disabled={creating}>
                {creating ? "Loading..." : "Continue Setup"}
              </button>
              <button className="btn btn-outline btn-full" onClick={checkAccountStatus} disabled={creating}>
                Refresh Status
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // No account yet
  const STEPS = [
    { num: 1, title: "Create Stripe Account", desc: "We'll create a secure payment account for you" },
    { num: 2, title: "Verify Your Identity",  desc: "Provide basic business information (required by law)" },
    { num: 3, title: "Start Selling",          desc: "List your equipment and receive payments securely" },
  ];
  return (
    <main className="page-main" style={{ paddingTop: "64px" }}>
      <div className="container">
        <div style={cardStyle}>
          <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Become a Seller</h1>
          <p className="text-muted" style={{ marginBottom: "2rem" }}>Set up your payment account to start selling on Mporiums</p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
            {STEPS.map((step) => (
              <div key={step.num} style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{
                  width: "2.25rem", height: "2.25rem", borderRadius: "50%",
                  background: "var(--primary)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, flexShrink: 0, fontSize: "0.95rem",
                }}>{step.num}</div>
                <div>
                  <p style={{ fontWeight: 600, margin: "0 0 0.15rem" }}>{step.title}</p>
                  <p className="text-muted" style={{ fontSize: "0.85rem", margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {error && <div className="alert alert-warning" style={{ marginBottom: "1rem" }}>{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button className="btn btn-primary btn-full" onClick={createConnectedAccount} disabled={creating}>
              {creating ? "Setting up..." : "Continue to Setup"}
            </button>
            <Link to="/" className="btn btn-outline btn-full" style={{ textAlign: "center" }}>Cancel</Link>
          </div>

          <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", textAlign: "center", marginTop: "1.5rem" }}>
            <strong>Note:</strong> Payments are powered by Stripe. Your banking information is never shared with Mporiums.
          </p>
        </div>
      </div>
    </main>
  );
}

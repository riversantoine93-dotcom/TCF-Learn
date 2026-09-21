"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { ORGANIZATION_PLANS, ORGANIZATION_PLAN_KEYS } from "@/lib/organization-plans";
import "./login.css";

type LoginKind = "user" | "admin";

export default function Login() {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [busy, setBusy] = useState<LoginKind | null>(null);
  const [userMessage, setUserMessage] = useState("");
  const [adminMessage, setAdminMessage] = useState("");

  async function userLogin(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setUserMessage("Supabase environment variables are missing.");
      return;
    }

    setBusy("user");
    setUserMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });

    if (error) {
      setUserMessage(error.message);
      setBusy(null);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function adminLogin(event: FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setAdminMessage("Supabase environment variables are missing.");
      return;
    }

    setBusy("admin");
    setAdminMessage("");

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (error || !signInData.user) {
      setAdminMessage(error?.message || "Unable to sign in.");
      setBusy(null);
      return;
    }

    const { data: membership, error: membershipError } = await supabase
      .from("organization_memberships")
      .select("role,status")
      .eq("user_id", signInData.user.id)
      .eq("status", "active")
      .in("role", ["admin", "co_admin"])
      .maybeSingle();

    if (membershipError || !membership) {
      await supabase.auth.signOut();
      setAdminMessage("This account does not have active organization administrator access.");
      setBusy(null);
      return;
    }

    window.location.href = "/organization/admin";
  }

  return (
    <main>
      <Header />

      <section className="login-page">
        <div className="login-intro">
          <span className="eyebrow">TCF LEARN ACCESS</span>
          <h1>Choose how you enter TCF Learn.</h1>
          <p>
            Learners enter through User Login. Organization purchasers and approved co-admins
            enter through Admin Login.
          </p>
        </div>

        {!isSupabaseConfigured && (
          <div className="notice error login-config-notice">Supabase is not configured.</div>
        )}

        <div className="login-panels">
          <form className="login-panel" onSubmit={userLogin}>
            <span className="login-panel-kicker">LEARNER ACCESS</span>
            <h2>User Login</h2>
            <p>For learners assigned a seat by their organization.</p>

            {userMessage && <div className="notice" role="status">{userMessage}</div>}

            <label>
              Email
              <input
                type="email"
                required
                autoComplete="email"
                value={userEmail}
                onChange={(event) => setUserEmail(event.target.value)}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={userPassword}
                onChange={(event) => setUserPassword(event.target.value)}
              />
            </label>

            <div className="login-help">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button className="button full" disabled={busy !== null}>
              {busy === "user" ? "Signing in…" : "User Login"}
            </button>

            <small>
              Have an invitation? Open the organization invitation link you received to activate your account.
            </small>
          </form>

          <form className="login-panel admin-panel" onSubmit={adminLogin}>
            <span className="login-panel-kicker">ORGANIZATION ACCESS</span>
            <h2>Admin Login</h2>
            <p>For primary purchasers and approved organization co-admins.</p>

            {adminMessage && <div className="notice" role="status">{adminMessage}</div>}

            <label>
              Admin email
              <input
                type="email"
                required
                autoComplete="email"
                value={adminEmail}
                onChange={(event) => setAdminEmail(event.target.value)}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={adminPassword}
                onChange={(event) => setAdminPassword(event.target.value)}
              />
            </label>

            <div className="login-help">
              <Link href="/forgot-password">Forgot password?</Link>
            </div>

            <button className="button full" disabled={busy !== null}>
              {busy === "admin" ? "Opening admin console…" : "Admin Login"}
            </button>

            <small>
              Need an organization license? Choose a seat package below.
            </small>
          </form>
        </div>

        <section className="login-seat-section" aria-labelledby="seat-options-title">
          <div className="login-seat-heading">
            <span className="eyebrow">ORGANIZATION SEAT PACKAGES</span>
            <h2 id="seat-options-title">Both courses. One organization license.</h2>
            <p>
              Every learner seat includes Turning Forward and Thought to Freedom:
              Correcting Criminal Thinking Errors.
            </p>
          </div>

          <div className="login-seat-grid">
            {ORGANIZATION_PLAN_KEYS.map((key) => {
              const plan = ORGANIZATION_PLANS[key];
              return (
                <article className="login-seat-card" key={key}>
                  <span>{plan.badge}</span>
                  <h3>{plan.displayPrice}</h3>
                  <strong>{plan.label}</strong>
                  <p>{plan.description}</p>
                  <div className="seat-card-detail">
                    <b>Both courses included</b>
                    <small>{plan.perSeatLabel}</small>
                  </div>
                  {plan.coAdminLimit > 0 && (
                    <div className="seat-card-detail">
                      <b>Co-admin access</b>
                      <small>Up to {plan.coAdminLimit} co-admins</small>
                    </div>
                  )}
                  <Link className="button full" href="/organizations">
                    Choose {plan.seats} Seats
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export default function EnrollButton({ className = "button" }: { className?: string }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function enroll() {
    setError("");
    if (!user || !supabase) { router.push("/register?next=/"); return; }
    setBusy(true);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Please sign in again before enrolling.");
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await response.json();
      if (!response.ok || !payload.url) throw new Error(payload.error || "Checkout could not be started.");
      window.location.assign(payload.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout could not be started.");
      setBusy(false);
    }
  }

  return <div><button className={className} disabled={busy || loading} onClick={enroll}>{busy ? "Opening secure checkout…" : "Enroll for $97"}</button>{error && <p className="checkout-error">{error}</p>}</div>;
}

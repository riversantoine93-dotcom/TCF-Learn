"use client";

import { useState } from "react";
import type { PurchaseKey } from "@/lib/course-purchases";

export default function CoursePurchaseOptions({ course }: { course: Exclude<PurchaseKey, "bundle"> }) {
  const [buying, setBuying] = useState<PurchaseKey | null>(null);
  async function checkout(purchase: PurchaseKey) {
    setBuying(purchase);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ purchase }) });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout unavailable.");
      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout unavailable.");
      setBuying(null);
    }
  }

  return <section className="purchase-options" aria-label="Purchase options">
    <article className="purchase-card">
      <span className="eyebrow">SINGLE COURSE</span>
      <h3>{course === "turning-forward" ? "Turning Forward" : "Thought to Freedom"}</h3>
      <strong className="purchase-price">$97</strong>
      <p>One-time payment. Full access to this course.</p>
      <button className="button" onClick={() => checkout(course)} disabled={Boolean(buying)}>{buying === course ? "Opening secure checkout…" : "Buy This Course — $97"}</button>
    </article>
    <article className="purchase-card featured">
      <span className="eyebrow">BEST VALUE · SAVE $48.50</span>
      <h3>Buy One, Get One Half Off</h3>
      <strong className="purchase-price">$145.50</strong>
      <p><strong>Get the second course for half price.</strong> Unlock Turning Forward and Thought to Freedom together. That is 25% off the $194 combined price.</p>
      <button className="button" onClick={() => checkout("bundle")} disabled={Boolean(buying)}>{buying === "bundle" ? "Opening secure checkout…" : "Get Both Courses — $145.50"}</button>
    </article>
  </section>;
}

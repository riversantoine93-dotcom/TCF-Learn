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

  return <>
    <section className="purchase-options" aria-label="Purchase options">
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
    </section>
    <style jsx>{`
      .purchase-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin:28px auto 0;max-width:980px;text-align:left}
      .purchase-card{background:#fff;border:1px solid #d6cfc2;padding:28px;display:flex;flex-direction:column;min-height:330px}
      .purchase-card.featured{background:#0b0b0b;color:#fbf8f2;border:4px solid #b79a67;box-shadow:12px 12px 0 #d9c7a5}
      .purchase-card h3{font-size:clamp(1.7rem,3vw,2.5rem);margin:12px 0 8px;text-transform:uppercase}
      .purchase-price{display:block;font-size:clamp(2.8rem,5vw,4.3rem);line-height:1;color:#8c7249;margin:8px 0 16px}
      .featured .purchase-price,.featured .eyebrow{color:#d9c7a5}
      .purchase-card p{line-height:1.65;flex:1;margin:0 0 24px}
      .purchase-card button{width:100%}
      .featured button{background:#b79a67;color:#0b0b0b;border-color:#b79a67}
      @media(max-width:760px){.purchase-options{grid-template-columns:1fr}.purchase-card{min-height:0}.purchase-card.featured{box-shadow:7px 7px 0 #d9c7a5}}
    `}</style>
  </>;
}

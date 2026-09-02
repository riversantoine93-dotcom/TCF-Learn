"use client";

import { useState } from "react";
import Image from "next/image";
import { DASHBOARD_PURCHASE_PRODUCTS } from "@/lib/dashboard-purchase-products";
import type { PurchaseKey } from "@/lib/course-purchases";
import "./dashboard-purchase-center.css";

export default function DashboardPurchaseCenter() {
  const [buying, setBuying] = useState<PurchaseKey | null>(null);

  async function checkout(purchase: PurchaseKey) {
    setBuying(purchase);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchase }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || "Checkout unavailable.");
      window.location.href = data.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : "Checkout unavailable.");
      setBuying(null);
    }
  }

  return <section className="purchase-center" id="purchase-center" aria-labelledby="purchase-center-title">
    <div className="purchase-center-heading">
      <span className="eyebrow">TCF LEARN COURSE STORE</span>
      <h2 id="purchase-center-title">Choose Your Course Access</h2>
      <p>One central checkout location. Purchase either course separately, or save $48.50 when you get both together.</p>
    </div>
    <div className="purchase-product-grid">
      {DASHBOARD_PURCHASE_PRODUCTS.map((product) => <article className={`purchase-product-card ${product.purchase === "bundle" ? "bundle" : ""}`} key={product.purchase}>
        <div className={`purchase-product-art ${product.images.length > 1 ? "dual" : "single"}`}>
          {product.images.map((src, index) => <div className="purchase-product-image" key={src}><Image src={src} alt={`${product.title} course thumbnail${product.images.length > 1 ? ` ${index + 1}` : ""}`} fill sizes="(max-width: 900px) 100vw, 33vw"/></div>)}
          <span className="purchase-badge">{product.badge}</span>
        </div>
        <div className="purchase-product-body">
          <div className="purchase-product-title"><div><h3>{product.title}</h3><h4>{product.subtitle}</h4></div><strong>{product.displayPrice}</strong></div>
          <p>{product.description}</p>
          <button className="purchase-button" type="button" disabled={Boolean(buying)} onClick={() => checkout(product.purchase)}>{buying === product.purchase ? "Opening secure checkout…" : product.cta}</button>
        </div>
      </article>)}
    </div>
  </section>;
}

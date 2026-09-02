import { NextRequest, NextResponse } from "next/server";
import { requireStripeSecret } from "@/lib/server-payments";
import { configuredPriceId, isPurchaseKey, PURCHASE_OPTIONS } from "@/lib/course-purchases";

export async function POST(request: NextRequest) {
  try {
    const secret = requireStripeSecret();
    const origin = request.nextUrl.origin;
    let purchase: unknown = "turning-forward";
    try {
      const json = await request.json();
      purchase = json?.purchase ?? purchase;
    } catch {}
    if (!isPurchaseKey(purchase)) return NextResponse.json({ error: "Invalid course selection." }, { status: 400 });

    const option = PURCHASE_OPTIONS[purchase];
    const priceId = configuredPriceId(purchase);
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${origin}/register?paid=1&session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", `${origin}/${purchase === "turning-forward" ? "course/turning-forward" : "course/thought-to-freedom"}?checkout=cancelled`);
    body.set("customer_creation", "always");
    body.set("billing_address_collection", "auto");
    body.set("allow_promotion_codes", "true");
    body.set("line_items[0][quantity]", "1");
    if (priceId) {
      body.set("line_items[0][price]", priceId);
    } else {
      body.set("line_items[0][price_data][currency]", "usd");
      body.set("line_items[0][price_data][unit_amount]", String(option.amountCents));
      body.set("line_items[0][price_data][product_data][name]", option.label);
      if (purchase === "bundle") body.set("line_items[0][price_data][product_data][description]", "Buy One, Get One Half Off — Get the second course for half price.");
    }
    body.set("metadata[purchase_key]", purchase);
    body.set("metadata[course_slug]", purchase === "bundle" ? "bundle" : purchase);

    const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const session = await stripe.json();
    if (!stripe.ok || !session.url) return NextResponse.json({ error: session?.error?.message || "Unable to start checkout." }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout unavailable." }, { status: 500 });
  }
}

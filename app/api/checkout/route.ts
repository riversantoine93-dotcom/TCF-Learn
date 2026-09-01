import { NextRequest, NextResponse } from "next/server";
import { COURSE_SLUG, requireStripeSecret } from "@/lib/server-payments";

const TURNING_FORWARD_PRICE_ID = "price_1UArD3D9JGdKoOvukMYQKkjS";

export async function POST(request: NextRequest) {
  try {
    const secret = requireStripeSecret();
    const origin = request.nextUrl.origin;
    const body = new URLSearchParams();
    body.set("mode", "payment");
    body.set("success_url", `${origin}/register?paid=1&session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", `${origin}/course/turning-forward?checkout=cancelled`);
    body.set("customer_creation", "always");
    body.set("billing_address_collection", "auto");
    body.set("allow_promotion_codes", "true");
    body.set("line_items[0][quantity]", "1");
    body.set("line_items[0][price]", TURNING_FORWARD_PRICE_ID);
    body.set("metadata[course_slug]", COURSE_SLUG);

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

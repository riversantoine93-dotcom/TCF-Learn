import { NextRequest, NextResponse } from "next/server";
import { requireStripeSecret } from "@/lib/server-payments";
import { configuredOrganizationPriceId, isOrganizationPlanKey, ORGANIZATION_PLANS } from "@/lib/organization-plans";

export async function POST(request: NextRequest) {
  try {
    const { plan, organizationName } = await request.json();
    if (!isOrganizationPlanKey(plan)) return NextResponse.json({ error: "Choose a valid organization plan." }, { status: 400 });
    if (!organizationName?.trim()) return NextResponse.json({ error: "Organization name is required." }, { status: 400 });

    const option = ORGANIZATION_PLANS[plan];
    if (option.salesMode === "contact" || option.amountCents === null) {
      return NextResponse.json({ error: "This organization package requires contact for pricing." }, { status: 400 });
    }

    const secret = requireStripeSecret();
    const priceId = configuredOrganizationPriceId(plan);
    const origin = request.nextUrl.origin;
    const body = new URLSearchParams();

    body.set("mode", "payment");
    body.set("success_url", `${origin}/organization/register?session_id={CHECKOUT_SESSION_ID}`);
    body.set("cancel_url", `${origin}/organizations?checkout=cancelled`);
    body.set("customer_creation", "always");
    body.set("billing_address_collection", "auto");
    body.set("allow_promotion_codes", "true");
    body.set("line_items[0][quantity]", "1");

    if (priceId) {
      body.set("line_items[0][price]", priceId);
    } else {
      body.set("line_items[0][price_data][currency]", "usd");
      body.set("line_items[0][price_data][unit_amount]", String(option.amountCents));
      body.set("line_items[0][price_data][product_data][name]", `TCF Learn Organization Bundle — ${option.seats} learner seats`);
      body.set("line_items[0][price_data][product_data][description]", "Includes Turning Forward and Thought to Freedom: Correcting Criminal Thinking Errors for every learner seat.");
    }

    body.set("metadata[purchase_type]", "organization");
    body.set("metadata[organization_plan]", plan);
    body.set("metadata[organization_name]", organizationName.trim());
    body.set("metadata[course_bundle]", "turning-forward,thought-to-freedom");
    body.set("metadata[learner_seats]", String(option.seats));

    const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const session = await stripe.json();
    if (!stripe.ok || !session.url) return NextResponse.json({ error: session?.error?.message || "Unable to start organization checkout." }, { status: 502 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Organization checkout unavailable." }, { status: 500 });
  }
}

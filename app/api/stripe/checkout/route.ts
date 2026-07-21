import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_TURNING_FORWARD_PRICE_ID;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!token) return NextResponse.json({ error: "Sign in before enrolling." }, { status: 401 });
    if (!supabaseUrl || !publishableKey || !stripeKey || !priceId || !siteUrl) throw new Error("Server configuration is incomplete.");

    const supabase = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });

    const form = new URLSearchParams();
    form.set("mode", "payment");
    form.set("line_items[0][price]", priceId);
    form.set("line_items[0][quantity]", "1");
    form.set("customer_email", data.user.email);
    form.set("client_reference_id", data.user.id);
    form.set("metadata[user_id]", data.user.id);
    form.set("metadata[course_slug]", "turning-forward");
    form.set("success_url", `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
    form.set("cancel_url", `${siteUrl}/#enroll`);
    form.set("allow_promotion_codes", "true");

    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${stripeKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString()
    });
    const session = await stripeResponse.json();
    if (!stripeResponse.ok) throw new Error(session?.error?.message || "Stripe Checkout could not be created.");
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout could not be started." }, { status: 500 });
  }
}

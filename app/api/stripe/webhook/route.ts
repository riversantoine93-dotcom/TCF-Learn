import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(",").map(v => v.split("="));
  const timestamp = parts.find(([k]) => k === "t")?.[1];
  const signatures = parts.filter(([k]) => k === "v1").map(([,v]) => v);
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`, "utf8").digest("hex");
  return signatures.some(sig => {
    try { return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(sig, "hex")); } catch { return false; }
  });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret || !verifyStripeSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }
  try {
    const event = JSON.parse(rawBody);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id || session.client_reference_id;
      const courseSlug = session.metadata?.course_slug || "turning-forward";
      if (!userId || session.payment_status !== "paid") throw new Error("Completed session is missing a paid user enrollment.");
      const admin = getSupabaseAdmin();
      const { error } = await admin.from("enrollments").upsert({
        user_id: userId,
        course_slug: courseSlug,
        active: true,
        stripe_checkout_session_id: session.id,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        purchased_at: new Date().toISOString()
      }, { onConflict: "user_id,course_slug" });
      if (error) throw error;
    }
    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

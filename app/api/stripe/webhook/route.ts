import { NextRequest, NextResponse } from "next/server";
import { recordStripeEnrollment, verifyStripeSignature } from "@/lib/server-payments";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature") || "";
  if (!secret) return NextResponse.json({ error: "Webhook configuration missing." }, { status: 500 });
  const rawBody = await request.text();
  if (!(await verifyStripeSignature(rawBody, signature, secret))) return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  try {
    const event = JSON.parse(rawBody);
    if (event.type === "checkout.session.completed") await recordStripeEnrollment(event.data.object);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}

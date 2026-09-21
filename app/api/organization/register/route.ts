import { NextRequest, NextResponse } from "next/server";
import { activateOrganizationOwner, organizationPlanFromSession, recordOrganizationPurchase } from "@/lib/server-organization";
import { createSupabaseUser, deleteSupabaseUser, normalizeEmail, requireStripeSecret } from "@/lib/server-payments";
import { saveSecurityQuestions, validateSecurityAnswers } from "@/lib/server-security";

async function organizationSession(sessionId: string) {
  if (!sessionId.startsWith("cs_")) return null;
  const secret = requireStripeSecret();
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const session = await res.json().catch(() => ({}));
  if (!res.ok || session?.payment_status !== "paid" || session?.metadata?.purchase_type !== "organization") return null;
  return organizationPlanFromSession(session) ? session : null;
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, fullName, email, password, securityAnswers } = await request.json();
    if (!sessionId || !fullName?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Name, purchaser email, checkout session, and a password of at least 8 characters are required." }, { status: 400 });
    }

    const session = await organizationSession(sessionId);
    if (!session) return NextResponse.json({ error: "We could not verify this paid organization checkout." }, { status: 403 });

    const paidEmail = normalizeEmail(session?.customer_details?.email || session?.customer_email || "");
    if (!paidEmail || paidEmail !== normalizeEmail(email)) {
      return NextResponse.json({ error: `Use the same email used for the organization purchase: ${paidEmail}` }, { status: 400 });
    }

    let answers;
    try {
      answers = validateSecurityAnswers(securityAnswers);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Choose and answer all three security questions." }, { status: 400 });
    }

    const organization = await recordOrganizationPurchase(session);
    if (!organization) return NextResponse.json({ error: "Organization license could not be created." }, { status: 409 });

    if (organization.owner_user_id) {
      return NextResponse.json({ ok: true, existingAccount: true, organizationId: organization.id });
    }

    const user = await createSupabaseUser(paidEmail, password, fullName.trim());
    try {
      await saveSecurityQuestions(user.id, answers);
      await activateOrganizationOwner(organization.id, user.id, paidEmail, fullName.trim());
    } catch (error) {
      await deleteSupabaseUser(user.id).catch(() => {});
      throw error;
    }

    return NextResponse.json({ ok: true, existingAccount: false, organizationId: organization.id });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create organization administrator account." }, { status: 500 });
  }
}

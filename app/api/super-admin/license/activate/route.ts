import { NextRequest, NextResponse } from "next/server";
import { isOrganizationPlanKey } from "@/lib/organization-plans";
import { createManagedOrganization, requireSuperAdmin } from "@/lib/server-super-admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSuperAdmin(request);
    const { organizationName, purchaserEmail, planKey, amountPaid, paymentSource, paymentReference, notes } = await request.json();
    if (!isOrganizationPlanKey(planKey) || !["org-10","org-50","org-100"].includes(planKey)) {
      return NextResponse.json({ error: "Choose a valid organization license." }, { status: 400 });
    }
    const cents = Math.max(0, Math.round(Number(amountPaid || 0) * 100));
    const result = await createManagedOrganization({
      actorUserId: user.id,
      organizationName,
      purchaserEmail,
      planKey,
      status: "active",
      amountPaid: cents,
      paymentSource: String(paymentSource || "manual"),
      externalPaymentReference: paymentReference ? String(paymentReference) : null,
      notes: notes ? String(notes) : null,
    });
    return NextResponse.json({
      ok: true,
      organization: result.organization,
      adminActivationUrl: new URL("/organization/accept?token=" + result.inviteToken, request.nextUrl.origin).toString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to activate organization license." }, { status: 400 });
  }
}

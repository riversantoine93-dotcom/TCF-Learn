import { NextRequest, NextResponse } from "next/server";
import { createOrganizationInvite } from "@/lib/server-organization";
import { requireAuthenticatedUser } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request);
    const { organizationId, email, fullName, role } = await request.json();
    if (!organizationId || !email?.trim() || !["learner", "co_admin"].includes(role)) {
      return NextResponse.json({ error: "Organization, email, and valid role are required." }, { status: 400 });
    }
    const invite = await createOrganizationInvite({
      organizationId,
      inviterUserId: user.id,
      email,
      fullName,
      role,
    });
    const origin = request.nextUrl.origin;
    return NextResponse.json({
      ok: true,
      invite,
      inviteUrl: `${origin}/organization/accept?token=${invite.invite_token}`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create invitation." }, { status: 400 });
  }
}

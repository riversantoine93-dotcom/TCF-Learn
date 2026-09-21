import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { auditLicenseAction, requireSuperAdmin } from "@/lib/server-super-admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSuperAdmin(request);
    const { organizationId } = await request.json();
    if (!organizationId) return NextResponse.json({ error: "Organization is required." }, { status: 400 });

    const admin: any = getSupabaseAdmin();
    const { data: membership, error } = await admin
      .from("organization_memberships")
      .select("id,email,status,user_id")
      .eq("organization_id", organizationId)
      .eq("role", "admin")
      .neq("status","removed")
      .single();
    if (error) throw error;
    if (membership.status === "active" && membership.user_id) {
      return NextResponse.json({ error: "The primary admin account is already active. Use Password Reset instead." }, { status: 409 });
    }

    const inviteToken = crypto.randomUUID();
    const { error: updateError } = await admin.from("organization_memberships").update({
      status: "invited",
      invite_token: inviteToken,
      invited_by: user.id,
      invited_at: new Date().toISOString(),
      accepted_at: null,
    }).eq("id", membership.id);
    if (updateError) throw updateError;

    await auditLicenseAction({ actorUserId: user.id, organizationId, action: "primary_admin_activation_link_regenerated", details: { email: membership.email } });
    return NextResponse.json({
      ok: true,
      email: membership.email,
      adminActivationUrl: new URL("/organization/accept?token=" + inviteToken, request.nextUrl.origin).toString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to regenerate admin activation link." }, { status: 400 });
  }
}

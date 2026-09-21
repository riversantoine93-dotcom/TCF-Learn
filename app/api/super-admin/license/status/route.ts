import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { auditLicenseAction, requireSuperAdmin } from "@/lib/server-super-admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSuperAdmin(request);
    const { organizationId, status } = await request.json();
    if (!organizationId || !["active","paused","cancelled"].includes(status)) {
      return NextResponse.json({ error: "Organization and a valid status are required." }, { status: 400 });
    }
    const admin = getSupabaseAdmin();
    const { data: organization, error } = await admin.from("organizations").update({ status }).eq("id", organizationId).select("*").single();
    if (error) throw error;

    const enrollmentActive = status === "active";
    const { error: enrollmentError } = await admin.from("enrollments").update({ active: enrollmentActive }).eq("organization_id", organizationId);
    if (enrollmentError) throw enrollmentError;

    await auditLicenseAction({ actorUserId: user.id, organizationId, action: "license_status_changed", details: { status } });
    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update license status." }, { status: 400 });
  }
}

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

    const admin: any = getSupabaseAdmin();
    const { data: organization, error } = await admin
      .from("organizations")
      .update({ status })
      .eq("id", organizationId)
      .select("*")
      .single();
    if (error) throw error;

    if (status !== "active") {
      const { error: enrollmentError } = await admin
        .from("enrollments")
        .update({ active: false })
        .eq("organization_id", organizationId);
      if (enrollmentError) throw enrollmentError;
    } else {
      const { data: activeMembers, error: memberError } = await admin
        .from("organization_memberships")
        .select("user_id")
        .eq("organization_id", organizationId)
        .eq("status", "active")
        .not("user_id", "is", null);
      if (memberError) throw memberError;

      const activeUserIds = (activeMembers || []).map((row:any) => row.user_id).filter(Boolean);
      await admin.from("enrollments").update({ active: false }).eq("organization_id", organizationId);
      if (activeUserIds.length) {
        const { error: enrollmentError } = await admin
          .from("enrollments")
          .update({ active: true })
          .eq("organization_id", organizationId)
          .in("user_id", activeUserIds);
        if (enrollmentError) throw enrollmentError;
      }
    }

    await auditLicenseAction({
      actorUserId: user.id,
      organizationId,
      action: "license_status_changed",
      details: { status },
    });
    return NextResponse.json({ ok: true, organization });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update license status." }, { status: 400 });
  }
}

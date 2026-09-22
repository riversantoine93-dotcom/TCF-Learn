import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request);
    const admin = getSupabaseAdmin();

    const { data, error } = await admin
      .from("organization_memberships")
      .select("organization_id,role,status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", ["admin", "co_admin"])
      .limit(1);

    if (error) throw error;

    const membership = data?.[0] || null;

    return NextResponse.json({
      canAccessAdmin: Boolean(membership),
      role: membership?.role || null,
      adminUrl: membership ? "/organization/admin" : null,
    });
  } catch {
    return NextResponse.json({
      canAccessAdmin: false,
      role: null,
      adminUrl: null,
    });
  }
}

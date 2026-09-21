import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireSuperAdmin } from "@/lib/server-super-admin";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin(request);
    const admin = getSupabaseAdmin();

    const [{ data: organizations, error: orgError }, { data: memberships, error: memberError }, { data: events, error: eventError }] = await Promise.all([
      admin.from("organizations").select("*").order("created_at", { ascending: false }),
      admin.from("organization_memberships").select("id,organization_id,user_id,email,full_name,role,status,invite_token,invited_at,accepted_at").neq("status","removed").order("created_at",{ascending:false}),
      admin.from("organization_license_events").select("id,organization_id,actor_user_id,action,details,created_at").order("created_at",{ascending:false}).limit(250),
    ]);
    if (orgError) throw orgError;
    if (memberError) throw memberError;
    if (eventError) throw eventError;

    return NextResponse.json({ organizations: organizations || [], memberships: memberships || [], events: events || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load Super Admin dashboard." }, { status: 403 });
  }
}

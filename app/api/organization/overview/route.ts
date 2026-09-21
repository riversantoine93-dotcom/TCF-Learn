import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { summarizeLearnerProgress } from "@/lib/organization-progress";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthenticatedUser(request);
    const admin = getSupabaseAdmin();
    const { data: membership, error: membershipError } = await admin
      .from("organization_memberships")
      .select("organization_id,role,status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .in("role", ["admin","co_admin"])
      .maybeSingle();
    if (membershipError) throw membershipError;
    if (!membership) return NextResponse.json({ error: "Organization administrator access is required." }, { status: 403 });

    const [{ data: organization, error: orgError }, { data: members, error: memberError }] = await Promise.all([
      admin.from("organizations").select("*").eq("id", membership.organization_id).single(),
      admin.from("organization_memberships").select("id,user_id,email,full_name,role,status,invited_at,accepted_at").eq("organization_id", membership.organization_id).neq("status","removed").order("created_at"),
    ]);
    if (orgError) throw orgError;
    if (memberError) throw memberError;

    const learnerUserIds=(members||[]).filter((m:any)=>m.role==="learner"&&m.status==="active"&&m.user_id).map((m:any)=>m.user_id);
    let rawProgress:any[]=[];
    if(learnerUserIds.length){
      const result=await admin.from("course_progress").select("user_id,course_slug,progress,updated_at").in("user_id",learnerUserIds);
      if(result.error) throw result.error;
      rawProgress=result.data||[];
    }

    const progressSummaries=learnerUserIds.map((userId:string)=>
      summarizeLearnerProgress(userId, rawProgress.filter((row:any)=>row.user_id===userId))
    );

    return NextResponse.json({
      organization,
      adminRole: membership.role,
      members: members||[],
      progressSummaries,
      refreshedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load organization." }, { status: 400 });
  }
}

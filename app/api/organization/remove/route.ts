import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const user=await requireAuthenticatedUser(request);
    const { organizationId, membershipId }=await request.json();
    const admin=getSupabaseAdmin();

    const { data: actor, error: actorError }=await admin.from("organization_memberships")
      .select("role").eq("organization_id",organizationId).eq("user_id",user.id).eq("status","active").maybeSingle();
    if(actorError) throw actorError;
    if(!actor||!["admin","co_admin"].includes(actor.role)) return NextResponse.json({error:"Administrator access is required."},{status:403});

    const { data: target, error: targetError }=await admin.from("organization_memberships")
      .select("id,user_id,role").eq("id",membershipId).eq("organization_id",organizationId).single();
    if(targetError) throw targetError;
    if(target.role==="admin") return NextResponse.json({error:"The primary administrator cannot be removed."},{status:400});
    if(target.role==="co_admin"&&actor.role!=="admin") return NextResponse.json({error:"Only the primary administrator can remove co-admins."},{status:403});

    const { error:updateError }=await admin.from("organization_memberships").update({status:"removed",invite_token:null}).eq("id",membershipId);
    if(updateError) throw updateError;
    if(target.user_id){
      const { error:enrollmentError }=await admin.from("enrollments").update({active:false}).eq("organization_id",organizationId).eq("user_id",target.user_id);
      if(enrollmentError) throw enrollmentError;
    }
    return NextResponse.json({ok:true});
  } catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Unable to remove member."},{status:400});
  }
}

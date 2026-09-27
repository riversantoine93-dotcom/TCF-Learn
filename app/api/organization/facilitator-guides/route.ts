import { NextRequest, NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/lib/server-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getFacilitatorGuides } from "@/lib/facilitator-guides";

const VALID_COURSES=new Set(["turning-forward","thought-to-freedom"]);

export async function GET(request:NextRequest){
  try{
    const user=await requireAuthenticatedUser(request);
    const admin=getSupabaseAdmin();

    const {data:membership,error}=await admin
      .from("organization_memberships")
      .select("organization_id,role,status")
      .eq("user_id",user.id)
      .eq("status","active")
      .in("role",["admin","co_admin"])
      .limit(1)
      .maybeSingle();

    if(error)throw error;
    if(!membership){
      return NextResponse.json({error:"Organization administrator access is required."},{status:403});
    }

    const course=request.nextUrl.searchParams.get("course")||"turning-forward";
    if(!VALID_COURSES.has(course)){
      return NextResponse.json({error:"Unknown course."},{status:400});
    }

    return NextResponse.json({
      adminRole:membership.role,
      course,
      guides:getFacilitatorGuides(course as "turning-forward"|"thought-to-freedom"),
    });
  }catch(error){
    return NextResponse.json(
      {error:error instanceof Error?error.message:"Unable to load facilitator guides."},
      {status:403}
    );
  }
}

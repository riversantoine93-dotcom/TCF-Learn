import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ORGANIZATION_COURSE_SLUGS } from "@/lib/organization";
import { grantOrganizationCourseAccess } from "@/lib/server-organization";

const EXPECTED_TOKEN_HASH = "368a0a3cb6d2c974255d290e53bdcf7f971846a8116c27fa29deab93b56d9934";
const ORG_NAME = "HAB Justice QA - 10 Seats";
const ADMIN_EMAIL = "j.carroll@habjustice.com";
const LEARNER_EMAIL = "j.carroll+learner@habjustice.com";

function hash(value:string){
  return createHash("sha256").update(value).digest("hex");
}

async function findUserByEmail(admin:any,email:string){
  const target=email.toLowerCase();
  for(let page=1;page<=10;page+=1){
    const {data,error}=await admin.auth.admin.listUsers({page,perPage:1000});
    if(error)throw error;
    const found=(data?.users||[]).find((user:any)=>String(user.email||"").toLowerCase()===target);
    if(found)return found;
    if((data?.users||[]).length<1000)break;
  }
  return null;
}

function temporaryPassword(label:string){
  return "HABQA!"+label+"#"+crypto.randomUUID().replaceAll("-","").slice(0,18);
}

export async function GET(request:NextRequest){
  const token=request.nextUrl.searchParams.get("token")||"";
  if(hash(token)!==EXPECTED_TOKEN_HASH){
    return NextResponse.json({error:"Invalid seed token."},{status:403});
  }

  const admin:any=getSupabaseAdmin();
  const createdUserIds:string[]=[];
  let organizationId:string|null=null;

  try{
    const [existingAdmin,existingLearner]=await Promise.all([
      findUserByEmail(admin,ADMIN_EMAIL),
      findUserByEmail(admin,LEARNER_EMAIL),
    ]);
    if(existingAdmin||existingLearner){
      return NextResponse.json({
        error:"A HAB Justice QA email already exists in Supabase Auth.",
        existing:{
          admin:Boolean(existingAdmin),
          learner:Boolean(existingLearner),
        },
      },{status:409});
    }

    const {data:existingOrg,error:orgLookupError}=await admin
      .from("organizations")
      .select("id,name")
      .eq("name",ORG_NAME)
      .maybeSingle();
    if(orgLookupError)throw orgLookupError;
    if(existingOrg){
      return NextResponse.json({error:"The HAB Justice QA organization already exists.",organizationId:existingOrg.id},{status:409});
    }

    const {data:organization,error:orgError}=await admin
      .from("organizations")
      .insert({
        name:ORG_NAME,
        purchaser_email:ADMIN_EMAIL,
        plan_key:"org-10",
        seat_limit:10,
        admin_license_limit:1,
        co_admin_limit:0,
        status:"active",
        amount_paid:0,
        currency:"usd",
        payment_source:"qa_seed",
        external_payment_reference:"hab-justice-qa",
        license_notes:"Synthetic 10-seat HAB Justice QA organization for product testing.",
        purchased_at:new Date().toISOString(),
      })
      .select("*")
      .single();
    if(orgError)throw orgError;
    organizationId=organization.id;

    const {error:courseError}=await admin
      .from("organization_course_access")
      .upsert(
        ORGANIZATION_COURSE_SLUGS.map(course_slug=>({
          organization_id:organization.id,
          course_slug,
          active:true,
        })),
        {onConflict:"organization_id,course_slug"}
      );
    if(courseError)throw courseError;

    const now=new Date().toISOString();
    const {error:memberError}=await admin
      .from("organization_memberships")
      .insert([
        {
          organization_id:organization.id,
          email:ADMIN_EMAIL,
          full_name:"Jessica Carroll",
          role:"admin",
          status:"invited",
          invite_token:crypto.randomUUID(),
          invited_at:now,
        },
        {
          organization_id:organization.id,
          email:LEARNER_EMAIL,
          full_name:"Jessica Carroll - Learner Test",
          role:"learner",
          status:"invited",
          invite_token:crypto.randomUUID(),
          invited_at:now,
        },
      ]);
    if(memberError)throw memberError;

    const adminPassword=temporaryPassword("Admin10");
    const learnerPassword=temporaryPassword("Learner10");

    const {data:adminUser,error:adminCreateError}=await admin.auth.admin.createUser({
      email:ADMIN_EMAIL,
      password:adminPassword,
      email_confirm:true,
      user_metadata:{
        full_name:"Jessica Carroll",
        qa_test_account:true,
        organization:ORG_NAME,
      },
    });
    if(adminCreateError||!adminUser?.user)throw adminCreateError||new Error("Unable to create HAB Justice admin user.");
    createdUserIds.push(adminUser.user.id);

    const {data:learnerUser,error:learnerCreateError}=await admin.auth.admin.createUser({
      email:LEARNER_EMAIL,
      password:learnerPassword,
      email_confirm:true,
      user_metadata:{
        full_name:"Jessica Carroll - Learner Test",
        qa_test_account:true,
        organization:ORG_NAME,
      },
    });
    if(learnerCreateError||!learnerUser?.user)throw learnerCreateError||new Error("Unable to create HAB Justice learner user.");
    createdUserIds.push(learnerUser.user.id);

    const {error:adminMembershipError}=await admin
      .from("organization_memberships")
      .update({
        user_id:adminUser.user.id,
        status:"active",
        accepted_at:new Date().toISOString(),
        invite_token:null,
      })
      .eq("organization_id",organization.id)
      .eq("email",ADMIN_EMAIL);
    if(adminMembershipError)throw adminMembershipError;

    const {error:learnerMembershipError}=await admin
      .from("organization_memberships")
      .update({
        user_id:learnerUser.user.id,
        status:"active",
        accepted_at:new Date().toISOString(),
        invite_token:null,
      })
      .eq("organization_id",organization.id)
      .eq("email",LEARNER_EMAIL);
    if(learnerMembershipError)throw learnerMembershipError;

    const {error:ownerError}=await admin
      .from("organizations")
      .update({owner_user_id:adminUser.user.id})
      .eq("id",organization.id);
    if(ownerError)throw ownerError;

    await grantOrganizationCourseAccess(organization.id,adminUser.user.id);
    await grantOrganizationCourseAccess(organization.id,learnerUser.user.id);

    const {error:auditError}=await admin.from("organization_license_events").insert({
      organization_id:organization.id,
      actor_user_id:null,
      action:"hab_justice_qa_accounts_created",
      details:{
        plan_key:"org-10",
        learner_license_limit:10,
        learner_accounts_created:1,
        primary_admin_accounts_created:1,
        admin_email:ADMIN_EMAIL,
        learner_email:LEARNER_EMAIL,
      },
    });
    if(auditError)throw auditError;

    return NextResponse.json({
      ok:true,
      organization:{
        id:organization.id,
        name:ORG_NAME,
        learnerLicenseLimit:10,
        learnerLicensesUsed:1,
        primaryAdminLicensesUsed:1,
      },
      admin:{
        email:ADMIN_EMAIL,
        password:adminPassword,
        loginUrl:new URL("/login?mode=admin",request.nextUrl.origin).toString(),
      },
      learner:{
        email:LEARNER_EMAIL,
        password:learnerPassword,
        loginUrl:new URL("/login?mode=user",request.nextUrl.origin).toString(),
      },
      courses:ORGANIZATION_COURSE_SLUGS,
    });
  }catch(error){
    for(const userId of createdUserIds.reverse()){
      await admin.auth.admin.deleteUser(userId).catch(()=>{});
    }
    if(organizationId){
      await admin.from("enrollments").delete().eq("organization_id",organizationId).catch(()=>{});
      await admin.from("organization_license_events").delete().eq("organization_id",organizationId).catch(()=>{});
      await admin.from("organization_memberships").delete().eq("organization_id",organizationId).catch(()=>{});
      await admin.from("organization_course_access").delete().eq("organization_id",organizationId).catch(()=>{});
      await admin.from("organizations").delete().eq("id",organizationId).catch(()=>{});
    }
    return NextResponse.json({
      error:error instanceof Error?error.message:"Unable to create HAB Justice QA accounts.",
    },{status:500});
  }
}

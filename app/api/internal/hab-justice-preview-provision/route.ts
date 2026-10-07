import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ORGANIZATION_COURSE_SLUGS } from "@/lib/organization";

const ORG_NAME = "HAB Justice QA - 10 Seats";
const ADMIN_EMAIL = "j.carroll@habjustice.com";
const LEARNER_EMAIL = "j.carroll1@habjustice.com";

function makePassword(label: string) {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 18);
  return `HABQA!${label}#${suffix}9a`;
}

async function findUserByEmail(admin: any, email: string) {
  const target = email.toLowerCase();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const found = (data?.users || []).find(
      (user: any) => String(user.email || "").toLowerCase() === target
    );
    if (found) return found;
    if ((data?.users || []).length < 1000) break;
  }
  return null;
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") {
    return NextResponse.json({ error: "Preview only." }, { status: 403 });
  }

  const admin: any = getSupabaseAdmin();
  const createdUserIds: string[] = [];
  let organizationId: string | null = null;

  try {
    const [existingAdmin, existingLearner] = await Promise.all([
      findUserByEmail(admin, ADMIN_EMAIL),
      findUserByEmail(admin, LEARNER_EMAIL),
    ]);

    const { data: existingOrg, error: orgLookupError } = await admin
      .from("organizations")
      .select("id,name")
      .eq("name", ORG_NAME)
      .maybeSingle();
    if (orgLookupError) throw orgLookupError;

    if (existingAdmin || existingLearner || existingOrg) {
      return NextResponse.json({
        error: "HAB Justice QA provisioning already exists or is partially present.",
        existing: {
          admin: Boolean(existingAdmin),
          learner: Boolean(existingLearner),
          organization: Boolean(existingOrg),
        },
      }, { status: 409 });
    }

    const now = new Date().toISOString();
    const { data: organization, error: orgError } = await admin
      .from("organizations")
      .insert({
        name: ORG_NAME,
        purchaser_email: ADMIN_EMAIL,
        plan_key: "org-10",
        seat_limit: 10,
        admin_license_limit: 1,
        co_admin_limit: 0,
        status: "active",
        amount_paid: 0,
        currency: "usd",
        payment_source: "qa_seed",
        external_payment_reference: "hab-justice-qa",
        license_notes: "Synthetic HAB Justice QA organization for login, admin, and learner testing.",
        purchased_at: now,
      })
      .select("*")
      .single();
    if (orgError) throw orgError;
    organizationId = organization.id;

    const { error: courseAccessError } = await admin
      .from("organization_course_access")
      .insert(
        ORGANIZATION_COURSE_SLUGS.map((course_slug) => ({
          organization_id: organization.id,
          course_slug,
          active: true,
        }))
      );
    if (courseAccessError) throw courseAccessError;

    const { error: membershipSeedError } = await admin
      .from("organization_memberships")
      .insert([
        {
          organization_id: organization.id,
          email: ADMIN_EMAIL,
          full_name: "Jessica Carroll",
          role: "admin",
          status: "invited",
          invite_token: crypto.randomUUID(),
          invited_at: now,
        },
        {
          organization_id: organization.id,
          email: LEARNER_EMAIL,
          full_name: "Jessica Carroll - Learner Test",
          role: "learner",
          status: "invited",
          invite_token: crypto.randomUUID(),
          invited_at: now,
        },
      ]);
    if (membershipSeedError) throw membershipSeedError;

    const adminPassword = makePassword("Admin10");
    const learnerPassword = makePassword("Learner10");

    const { data: adminCreated, error: adminCreateError } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Jessica Carroll",
        qa_test_account: true,
        organization: ORG_NAME,
      },
    });
    if (adminCreateError || !adminCreated?.user) {
      throw adminCreateError || new Error("Unable to create admin user.");
    }
    createdUserIds.push(adminCreated.user.id);

    const { data: learnerCreated, error: learnerCreateError } = await admin.auth.admin.createUser({
      email: LEARNER_EMAIL,
      password: learnerPassword,
      email_confirm: true,
      user_metadata: {
        full_name: "Jessica Carroll - Learner Test",
        qa_test_account: true,
        organization: ORG_NAME,
      },
    });
    if (learnerCreateError || !learnerCreated?.user) {
      throw learnerCreateError || new Error("Unable to create learner user.");
    }
    createdUserIds.push(learnerCreated.user.id);

    const { error: adminMembershipError } = await admin
      .from("organization_memberships")
      .update({
        user_id: adminCreated.user.id,
        status: "active",
        accepted_at: new Date().toISOString(),
        invite_token: null,
      })
      .eq("organization_id", organization.id)
      .eq("email", ADMIN_EMAIL);
    if (adminMembershipError) throw adminMembershipError;

    const { error: learnerMembershipError } = await admin
      .from("organization_memberships")
      .update({
        user_id: learnerCreated.user.id,
        status: "active",
        accepted_at: new Date().toISOString(),
        invite_token: null,
      })
      .eq("organization_id", organization.id)
      .eq("email", LEARNER_EMAIL);
    if (learnerMembershipError) throw learnerMembershipError;

    const { error: ownerError } = await admin
      .from("organizations")
      .update({ owner_user_id: adminCreated.user.id })
      .eq("id", organization.id);
    if (ownerError) throw ownerError;

    const enrollmentRows = [
      adminCreated.user.id,
      learnerCreated.user.id,
    ].flatMap((user_id) =>
      ORGANIZATION_COURSE_SLUGS.map((course_slug) => ({
        user_id,
        organization_id: organization.id,
        purchaser_email: null,
        course_slug,
        active: true,
        payment_status: "organization",
        amount_paid: 0,
        currency: "usd",
      }))
    );

    const { error: enrollmentError } = await admin
      .from("enrollments")
      .insert(enrollmentRows);
    if (enrollmentError) throw enrollmentError;

    await admin.from("organization_license_events").insert({
      organization_id: organization.id,
      actor_user_id: null,
      action: "hab_justice_qa_accounts_created",
      details: {
        learner_license_limit: 10,
        learner_licenses_used: 1,
        primary_admin_licenses_used: 1,
        admin_email: ADMIN_EMAIL,
        learner_email: LEARNER_EMAIL,
      },
    });

    return NextResponse.json({
      ok: true,
      organization: {
        id: organization.id,
        name: organization.name,
        learnerLicenseLimit: 10,
        learnerLicensesUsed: 1,
        primaryAdminLicensesUsed: 1,
      },
      admin: {
        email: ADMIN_EMAIL,
        password: adminPassword,
        loginUrl: new URL("/login?mode=admin", request.nextUrl.origin).toString(),
      },
      learner: {
        email: LEARNER_EMAIL,
        password: learnerPassword,
        loginUrl: new URL("/login?mode=user", request.nextUrl.origin).toString(),
      },
      courses: ORGANIZATION_COURSE_SLUGS,
    });
  } catch (error) {
    for (const userId of createdUserIds.reverse()) {
      try {
        await admin.auth.admin.deleteUser(userId);
      } catch {}
    }

    if (organizationId) {
      await admin.from("enrollments").delete().eq("organization_id", organizationId);
      await admin.from("organization_license_events").delete().eq("organization_id", organizationId);
      await admin.from("organization_memberships").delete().eq("organization_id", organizationId);
      await admin.from("organization_course_access").delete().eq("organization_id", organizationId);
      await admin.from("organizations").delete().eq("id", organizationId);
    }

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Provisioning failed.",
    }, { status: 500 });
  }
}

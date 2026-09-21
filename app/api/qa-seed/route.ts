import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ORGANIZATION_COURSE_SLUGS } from "@/lib/organization";

const EXPECTED_TOKEN_HASH = "82e8cbf9fbb41940ae8770ffc0b8df98f4558ad07bf2e9c4988435b2cee570dd";

type OrgConfig = {
  key: "qa10" | "qa47" | "qa96";
  name: string;
  planKey: "org-10" | "org-50" | "org-100";
  seatLimit: 10 | 50 | 100;
  coAdminLimit: number;
  purchaserEmail: string;
  learnerPad: number;
};

const ORGS: Record<OrgConfig["key"], OrgConfig> = {
  qa10: {
    key: "qa10",
    name: "TCF QA 10 Learners",
    planKey: "org-10",
    seatLimit: 10,
    coAdminLimit: 0,
    purchaserEmail: "qa10-admin@example.com",
    learnerPad: 2,
  },
  qa47: {
    key: "qa47",
    name: "TCF QA 47 of 50 Learners",
    planKey: "org-50",
    seatLimit: 50,
    coAdminLimit: 0,
    purchaserEmail: "qa47-admin@example.com",
    learnerPad: 2,
  },
  qa96: {
    key: "qa96",
    name: "TCF QA 96 of 100 Learners",
    planKey: "org-100",
    seatLimit: 100,
    coAdminLimit: 5,
    purchaserEmail: "qa96-admin01@example.com",
    learnerPad: 3,
  },
};

const BATCHES: Record<string, { org: OrgConfig["key"]; start: number; end: number }> = {
  qa10: { org: "qa10", start: 1, end: 10 },
  qa47a: { org: "qa47", start: 1, end: 24 },
  qa47b: { org: "qa47", start: 25, end: 47 },
  qa96a: { org: "qa96", start: 1, end: 24 },
  qa96b: { org: "qa96", start: 25, end: 48 },
  qa96c: { org: "qa96", start: 49, end: 72 },
  qa96d: { org: "qa96", start: 73, end: 96 },
};

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function passwordFor(seed: string, label: string) {
  const digest = createHash("sha256").update(seed + ":" + label).digest("base64url");
  return "TcfQA!" + digest.slice(0, 20) + "9a";
}

async function ensureOrganization(admin: any, config: OrgConfig) {
  const { data: existing, error: lookupError } = await admin
    .from("organizations")
    .select("*")
    .eq("name", config.name)
    .maybeSingle();
  if (lookupError) throw lookupError;

  let organization = existing;
  if (!organization) {
    const { data, error } = await admin
      .from("organizations")
      .insert({
        name: config.name,
        purchaser_email: config.purchaserEmail,
        plan_key: config.planKey,
        seat_limit: config.seatLimit,
        admin_license_limit: 1,
        co_admin_limit: config.coAdminLimit,
        status: "active",
        amount_paid: 0,
        currency: "usd",
        payment_source: "qa_seed",
        external_payment_reference: "qa-seed-2026-09-21",
        license_notes: "Synthetic QA organization created for capacity and login testing only.",
        purchased_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    organization = data;
  }

  const accessRows = ORGANIZATION_COURSE_SLUGS.map((course_slug) => ({
    organization_id: organization.id,
    course_slug,
    active: true,
  }));
  const { error: accessError } = await admin
    .from("organization_course_access")
    .upsert(accessRows, { onConflict: "organization_id,course_slug" });
  if (accessError) throw accessError;

  return organization;
}

async function ensureMember(admin: any, args: {
  organizationId: string;
  email: string;
  fullName: string;
  role: "admin" | "co_admin" | "learner";
  password: string;
  owner?: boolean;
}) {
  const normalized = args.email.toLowerCase();

  let { data: membership, error: memberLookupError } = await admin
    .from("organization_memberships")
    .select("*")
    .eq("organization_id", args.organizationId)
    .eq("email", normalized)
    .maybeSingle();
  if (memberLookupError) throw memberLookupError;

  if (!membership) {
    const { data, error } = await admin
      .from("organization_memberships")
      .insert({
        organization_id: args.organizationId,
        email: normalized,
        full_name: args.fullName,
        role: args.role,
        status: "invited",
        invite_token: crypto.randomUUID(),
        invited_at: new Date().toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    membership = data;
  }

  let userId = membership.user_id as string | null;

  if (!userId) {
    const parts = args.fullName.split(" ");
    const firstName = parts[0] || "QA";
    const lastName = parts.slice(1).join(" ") || "User";

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalized,
      password: args.password,
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: args.fullName,
        qa_test_account: true,
      },
    });
    if (createError || !created.user) throw createError || new Error("Unable to create QA auth user.");
    userId = created.user.id;

    const { error: updateError } = await admin
      .from("organization_memberships")
      .update({
        user_id: userId,
        full_name: args.fullName,
        role: args.role,
        status: "active",
        accepted_at: new Date().toISOString(),
        invite_token: null,
      })
      .eq("id", membership.id);
    if (updateError) throw updateError;
  }

  if (args.owner) {
    const { error: ownerError } = await admin
      .from("organizations")
      .update({ owner_user_id: userId })
      .eq("id", args.organizationId);
    if (ownerError) throw ownerError;
  }

  const enrollments = ORGANIZATION_COURSE_SLUGS.map((course_slug) => ({
    user_id: userId,
    organization_id: args.organizationId,
    purchaser_email: null,
    course_slug,
    active: true,
    payment_status: "organization",
    amount_paid: 0,
    currency: "usd",
  }));

  const { error: enrollmentError } = await admin
    .from("enrollments")
    .upsert(enrollments, { onConflict: "user_id,course_slug" });
  if (enrollmentError) throw enrollmentError;

  return userId;
}

export async function GET(request: NextRequest) {
  try {
    if (process.env.VERCEL_ENV !== "preview") {
      return NextResponse.json({ error: "QA seed endpoint is preview-only." }, { status: 403 });
    }

    const token = request.nextUrl.searchParams.get("token") || "";
    const batchKey = request.nextUrl.searchParams.get("batch") || "";

    if (tokenHash(token) !== EXPECTED_TOKEN_HASH) {
      return NextResponse.json({ error: "Invalid QA seed token." }, { status: 403 });
    }

    const batch = BATCHES[batchKey];
    if (!batch) {
      return NextResponse.json({ error: "Unknown QA seed batch." }, { status: 400 });
    }

    const admin: any = getSupabaseAdmin();
    const config = ORGS[batch.org];

    const { data: completed, error: completedError } = await admin
      .from("organization_license_events")
      .select("id")
      .eq("action", "qa_seed_batch_completed")
      .contains("details", { batch: batchKey, token_hash: EXPECTED_TOKEN_HASH })
      .maybeSingle();
    if (completedError) throw completedError;

    const learnerPassword = passwordFor(token, config.key + ":learner");
    const adminPassword = passwordFor(token, config.key + ":admin");

    if (completed) {
      return NextResponse.json({
        ok: true,
        alreadyCompleted: true,
        batch: batchKey,
        organization: config.name,
        learnerPassword,
        adminPassword,
      });
    }

    const organization = await ensureOrganization(admin, config);

    if (config.key === "qa10") {
      await ensureMember(admin, {
        organizationId: organization.id,
        email: "qa10-admin@example.com",
        fullName: "QA 10 Primary Admin",
        role: "admin",
        password: adminPassword,
        owner: true,
      });
    }

    if (config.key === "qa47") {
      await ensureMember(admin, {
        organizationId: organization.id,
        email: "qa47-admin@example.com",
        fullName: "QA 47 Primary Admin",
        role: "admin",
        password: adminPassword,
        owner: true,
      });
    }

    if (config.key === "qa96") {
      await ensureMember(admin, {
        organizationId: organization.id,
        email: "qa96-admin01@example.com",
        fullName: "QA 96 Primary Admin",
        role: "admin",
        password: adminPassword,
        owner: true,
      });
      await ensureMember(admin, {
        organizationId: organization.id,
        email: "qa96-admin02@example.com",
        fullName: "QA 96 Co Admin 2",
        role: "co_admin",
        password: adminPassword,
      });
      await ensureMember(admin, {
        organizationId: organization.id,
        email: "qa96-admin03@example.com",
        fullName: "QA 96 Co Admin 3",
        role: "co_admin",
        password: adminPassword,
      });
    }

    let createdLearners = 0;
    for (let index = batch.start; index <= batch.end; index += 1) {
      const number = String(index).padStart(config.learnerPad, "0");
      const email = config.key + "-learner" + number + "@example.com";
      await ensureMember(admin, {
        organizationId: organization.id,
        email,
        fullName: "QA " + config.key.slice(2) + " Learner " + number,
        role: "learner",
        password: learnerPassword,
      });
      createdLearners += 1;
    }

    const { error: auditError } = await admin.from("organization_license_events").insert({
      organization_id: organization.id,
      actor_user_id: null,
      action: "qa_seed_batch_completed",
      details: {
        batch: batchKey,
        token_hash: EXPECTED_TOKEN_HASH,
        learner_start: batch.start,
        learner_end: batch.end,
      },
    });
    if (auditError) throw auditError;

    return NextResponse.json({
      ok: true,
      batch: batchKey,
      organization: config.name,
      learnerRange: [batch.start, batch.end],
      createdLearners,
      learnerPassword,
      adminPassword,
      primaryAdmin: config.purchaserEmail,
      coAdmins: config.key === "qa96"
        ? ["qa96-admin02@example.com", "qa96-admin03@example.com"]
        : [],
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "QA seed failed.",
    }, { status: 500 });
  }
}

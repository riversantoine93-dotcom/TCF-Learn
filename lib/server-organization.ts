import { getSupabaseAdmin } from "./supabase-admin";
import { ORGANIZATION_COURSE_SLUGS } from "./organization";
import { isOrganizationPlanKey, ORGANIZATION_PLANS, type OrganizationPlanKey } from "./organization-plans";
import { createSupabaseUser, deleteSupabaseUser, normalizeEmail } from "./server-payments";
import { saveSecurityQuestions, validateSecurityAnswers } from "./server-security";

export function organizationPlanFromSession(session: any): OrganizationPlanKey | null {
  const plan = session?.metadata?.organization_plan;
  return isOrganizationPlanKey(plan) ? plan : null;
}

export async function recordOrganizationPurchase(session: any) {
  const planKey = organizationPlanFromSession(session);
  if (!planKey || session?.payment_status !== "paid") return null;

  const admin = getSupabaseAdmin();
  const purchaserEmail = normalizeEmail(session?.customer_details?.email || session?.customer_email || "");
  const organizationName = String(session?.metadata?.organization_name || "").trim();
  if (!purchaserEmail || !organizationName) throw new Error("Organization checkout is missing purchaser details.");

  const plan = ORGANIZATION_PLANS[planKey];
  const { data: existing, error: existingError } = await admin
    .from("organizations")
    .select("*")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) return existing;

  const { data, error } = await admin
    .from("organizations")
    .insert({
      name: organizationName,
      purchaser_email: purchaserEmail,
      plan_key: planKey,
      seat_limit: plan.seats,
      co_admin_limit: plan.coAdminLimit,
      status: "active",
      amount_paid: Number(session.amount_total || plan.amountCents),
      currency: session.currency || "usd",
      stripe_checkout_session_id: session.id,
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      purchased_at: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;

  const accessRows = ORGANIZATION_COURSE_SLUGS.map((courseSlug) => ({ organization_id: data.id, course_slug: courseSlug, active: true }));
  const { error: accessError } = await admin.from("organization_course_access").upsert(accessRows, { onConflict: "organization_id,course_slug" });
  if (accessError) throw accessError;
  return data;
}

export async function activateOrganizationOwner(organizationId: string, userId: string, email: string, fullName: string) {
  const admin = getSupabaseAdmin();
  const normalized = normalizeEmail(email);

  const { error: orgError } = await admin.from("organizations").update({ owner_user_id: userId }).eq("id", organizationId);
  if (orgError) throw orgError;

  const { error: memberError } = await admin.from("organization_memberships").upsert({
    organization_id: organizationId,
    user_id: userId,
    email: normalized,
    full_name: fullName,
    role: "admin",
    status: "active",
    accepted_at: new Date().toISOString(),
  }, { onConflict: "organization_id,email" });
  if (memberError) throw memberError;

  await grantOrganizationCourseAccess(organizationId, userId);
}

export async function grantOrganizationCourseAccess(organizationId: string, userId: string) {
  const admin = getSupabaseAdmin();
  const { data: courseRows, error: courseError } = await admin
    .from("organization_course_access")
    .select("course_slug")
    .eq("organization_id", organizationId)
    .eq("active", true);
  if (courseError) throw courseError;

  const courseSlugs = (courseRows || []).map((row: any) => row.course_slug);
  if (!courseSlugs.length) return;
  const { data: existing, error: existingError } = await admin
    .from("enrollments")
    .select("course_slug,active")
    .eq("user_id", userId)
    .in("course_slug", courseSlugs);
  if (existingError) throw existingError;
  const existingSlugs = new Set((existing || []).map((row: any) => row.course_slug));
  const rows = courseSlugs.filter((courseSlug: string) => !existingSlugs.has(courseSlug)).map((courseSlug: string) => ({
    user_id: userId,
    organization_id: organizationId,
    purchaser_email: null,
    course_slug: courseSlug,
    active: true,
    payment_status: "organization",
    amount_paid: 0,
    currency: "usd",
  }));
  if (!rows.length) return;
  const { error } = await admin.from("enrollments").insert(rows);
  if (error) throw error;
}

export async function createOrganizationInvite(args: {
  organizationId: string;
  inviterUserId: string;
  email: string;
  fullName?: string;
  role: "learner" | "co_admin";
}) {
  const admin = getSupabaseAdmin();
  const normalized = normalizeEmail(args.email);
  const { data: inviter, error: inviterError } = await admin
    .from("organization_memberships")
    .select("role,status")
    .eq("organization_id", args.organizationId)
    .eq("user_id", args.inviterUserId)
    .eq("status", "active")
    .maybeSingle();
  if (inviterError) throw inviterError;
  if (!inviter || !["admin", "co_admin"].includes(inviter.role)) throw new Error("Organization administrator access is required.");
  if (inviter.role === "co_admin" && args.role === "co_admin") throw new Error("Only the primary administrator can add co-admins.");

  const { data: org, error: orgError } = await admin
    .from("organizations")
    .select("seat_limit,co_admin_limit,status")
    .eq("id", args.organizationId)
    .single();
  if (orgError) throw orgError;
  if (org.status !== "active") throw new Error("This organization license is not active.");

  const { data: members, error: memberError } = await admin
    .from("organization_memberships")
    .select("id,email,role,status")
    .eq("organization_id", args.organizationId)
    .neq("status", "removed");
  if (memberError) throw memberError;

  if (args.role === "learner") {
    const used = (members || []).filter((m: any) => m.role === "learner").length;
    if (used >= org.seat_limit) throw new Error(`All ${org.seat_limit} learner seats are currently assigned.`);
  }
  if (args.role === "co_admin") {
    if (!org.co_admin_limit) throw new Error("Co-admin access is not included with this plan.");
    const used = (members || []).filter((m: any) => m.role === "co_admin").length;
    if (used >= org.co_admin_limit) throw new Error(`This plan allows ${org.co_admin_limit} co-admin account${org.co_admin_limit === 1 ? "" : "s"}.`);
  }

  const existing = (members || []).find((m: any) => normalizeEmail(m.email) === normalized);
  const inviteToken = crypto.randomUUID();
  if (existing) {
    const { data, error } = await admin
      .from("organization_memberships")
      .update({ full_name: args.fullName?.trim() || null, role: args.role, status: "invited", user_id: null, invite_token: inviteToken, invited_by: args.inviterUserId, invited_at: new Date().toISOString(), accepted_at: null })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await admin.from("organization_memberships").insert({
    organization_id: args.organizationId,
    email: normalized,
    full_name: args.fullName?.trim() || null,
    role: args.role,
    status: "invited",
    invite_token: inviteToken,
    invited_by: args.inviterUserId,
    invited_at: new Date().toISOString(),
  }).select("*").single();
  if (error) throw error;
  return data;
}

export async function acceptOrganizationInvite(args: { inviteToken: string; fullName: string; password: string; securityAnswers: unknown }) {
  const admin = getSupabaseAdmin();
  const answers = validateSecurityAnswers(args.securityAnswers);
  const { data: membership, error } = await admin
    .from("organization_memberships")
    .select("id,organization_id,email,role,status")
    .eq("invite_token", args.inviteToken)
    .eq("status", "invited")
    .maybeSingle();
  if (error) throw error;
  if (!membership) throw new Error("This invitation is invalid or has already been used.");

  const user = await createSupabaseUser(membership.email, args.password, args.fullName.trim());
  try {
    await saveSecurityQuestions(user.id, answers);
    const { error: updateError } = await admin.from("organization_memberships").update({
      user_id: user.id,
      full_name: args.fullName.trim(),
      status: "active",
      accepted_at: new Date().toISOString(),
      invite_token: null,
    }).eq("id", membership.id);
    if (updateError) throw updateError;
    await grantOrganizationCourseAccess(membership.organization_id, user.id);
    return { userId: user.id, email: membership.email, organizationId: membership.organization_id };
  } catch (error) {
    await admin.from("organization_memberships").update({ user_id: null, status: "invited", accepted_at: null, invite_token: args.inviteToken }).eq("id", membership.id);
    await deleteSupabaseUser(user.id).catch(() => {});
    throw error;
  }
}

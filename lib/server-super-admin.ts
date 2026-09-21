import { NextRequest } from "next/server";
import { requireAuthenticatedUser } from "./server-auth";
import { getSupabaseAdmin } from "./supabase-admin";
import { normalizeEmail } from "./server-payments";
import { ORGANIZATION_COURSE_SLUGS } from "./organization";
import { ORGANIZATION_PLANS, isOrganizationPlanKey, type OrganizationPlanKey } from "./organization-plans";

export async function requireSuperAdmin(request: NextRequest) {
  const user = await requireAuthenticatedUser(request);
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("platform_super_admins")
    .select("user_id,email,active")
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("TCF Super Admin access is required.");
  return user;
}

export async function auditLicenseAction(args: {
  actorUserId: string;
  organizationId?: string | null;
  action: string;
  details?: Record<string, unknown>;
}) {
  const admin = getSupabaseAdmin();
  const { error } = await admin.from("organization_license_events").insert({
    organization_id: args.organizationId || null,
    actor_user_id: args.actorUserId,
    action: args.action,
    details: args.details || {},
  });
  if (error) throw error;
}

export async function createManagedOrganization(args: {
  actorUserId: string;
  organizationName: string;
  purchaserEmail: string;
  planKey: OrganizationPlanKey;
  status: "pending" | "active";
  amountPaid?: number | null;
  paymentSource: string;
  externalPaymentReference?: string | null;
  stripeInvoiceId?: string | null;
  notes?: string | null;
}) {
  if (!isOrganizationPlanKey(args.planKey)) throw new Error("Choose a valid organization plan.");
  const plan = ORGANIZATION_PLANS[args.planKey];
  const admin = getSupabaseAdmin();
  const purchaserEmail = normalizeEmail(args.purchaserEmail);
  if (!purchaserEmail) throw new Error("Purchaser email is required.");
  if (!args.organizationName.trim()) throw new Error("Organization name is required.");

  const { data: organization, error } = await admin
    .from("organizations")
    .insert({
      name: args.organizationName.trim(),
      purchaser_email: purchaserEmail,
      plan_key: args.planKey,
      seat_limit: plan.seats,
      admin_license_limit: plan.adminLicenses,
      co_admin_limit: plan.coAdminLimit,
      status: args.status,
      amount_paid: args.amountPaid ?? 0,
      currency: "usd",
      payment_source: args.paymentSource,
      external_payment_reference: args.externalPaymentReference || null,
      stripe_invoice_id: args.stripeInvoiceId || null,
      license_notes: args.notes || null,
      purchased_at: args.status === "active" ? new Date().toISOString() : new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) throw error;

  const { error: courseError } = await admin.from("organization_course_access").insert(
    ORGANIZATION_COURSE_SLUGS.map((course_slug) => ({
      organization_id: organization.id,
      course_slug,
      active: true,
    }))
  );
  if (courseError) throw courseError;

  const inviteToken = crypto.randomUUID();
  const { error: memberError } = await admin.from("organization_memberships").insert({
    organization_id: organization.id,
    email: purchaserEmail,
    full_name: null,
    role: "admin",
    status: "invited",
    invite_token: inviteToken,
    invited_by: args.actorUserId,
    invited_at: new Date().toISOString(),
  });
  if (memberError) throw memberError;

  await auditLicenseAction({
    actorUserId: args.actorUserId,
    organizationId: organization.id,
    action: args.status === "active" ? "license_activated_manually" : "license_created_pending_payment",
    details: {
      plan_key: args.planKey,
      learner_licenses: plan.seats,
      primary_admin_licenses: plan.adminLicenses,
      co_admin_limit: plan.coAdminLimit,
      amount_paid: args.amountPaid ?? 0,
      payment_source: args.paymentSource,
      payment_reference: args.externalPaymentReference || null,
    },
  });

  return { organization, inviteToken };
}

export async function activateStripeInvoiceOrganization(invoice: any) {
  const organizationId = String(invoice?.metadata?.organization_id || "");
  if (!organizationId || invoice?.metadata?.purchase_type !== "tcf_org_invoice") return null;

  const admin = getSupabaseAdmin();
  const amountPaid = Number(invoice?.amount_paid || invoice?.total || 0);
  const { data: organization, error } = await admin
    .from("organizations")
    .update({
      status: "active",
      amount_paid: amountPaid,
      currency: invoice?.currency || "usd",
      stripe_invoice_id: invoice.id,
      stripe_customer_id: typeof invoice.customer === "string" ? invoice.customer : null,
      payment_source: "stripe_invoice",
      external_payment_reference: invoice.number || invoice.id,
      purchased_at: new Date().toISOString(),
    })
    .eq("id", organizationId)
    .select("*")
    .single();
  if (error) throw error;

  const { error: auditError } = await admin.from("organization_license_events").insert({
    organization_id: organization.id,
    actor_user_id: null,
    action: "stripe_invoice_paid_license_activated",
    details: {
      stripe_invoice_id: invoice.id,
      invoice_number: invoice.number || null,
      amount_paid: amountPaid,
    },
  });
  if (auditError) throw auditError;
  return organization;
}

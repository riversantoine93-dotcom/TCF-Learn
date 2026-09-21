import { NextRequest, NextResponse } from "next/server";
import { requireStripeSecret } from "@/lib/server-payments";
import { isOrganizationPlanKey } from "@/lib/organization-plans";
import { createManagedOrganization, auditLicenseAction, requireSuperAdmin } from "@/lib/server-super-admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function stripePost(path: string, body: URLSearchParams, secret: string) {
  const response = await fetch("https://api.stripe.com" + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + secret,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || "Stripe request failed.");
  return data;
}

export async function POST(request: NextRequest) {
  let organizationId: string | null = null;
  try {
    const user = await requireSuperAdmin(request);
    const { organizationName, purchaserEmail, planKey, amount, dueDays, notes } = await request.json();
    if (!isOrganizationPlanKey(planKey) || !["org-50","org-100"].includes(planKey)) {
      return NextResponse.json({ error: "Stripe negotiated invoices are for the 50- or 100-seat organization plans." }, { status: 400 });
    }

    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return NextResponse.json({ error: "Enter the negotiated invoice amount." }, { status: 400 });
    }
    const days = Math.min(90, Math.max(1, Number(dueDays || 30)));

    const managed = await createManagedOrganization({
      actorUserId: user.id,
      organizationName,
      purchaserEmail,
      planKey,
      status: "pending",
      amountPaid: 0,
      paymentSource: "stripe_invoice",
      notes: notes ? String(notes) : null,
    });
    organizationId = managed.organization.id;

    const secret = requireStripeSecret();

    const customerBody = new URLSearchParams();
    customerBody.set("email", purchaserEmail.trim().toLowerCase());
    customerBody.set("name", organizationName.trim());
    customerBody.set("metadata[tcf_organization_id]", organizationId);
    const customer = await stripePost("/v1/customers", customerBody, secret);

    const invoiceBody = new URLSearchParams();
    invoiceBody.set("customer", customer.id);
    invoiceBody.set("collection_method", "send_invoice");
    invoiceBody.set("days_until_due", String(days));
    invoiceBody.set("auto_advance", "false");
    invoiceBody.set("description", "TCF Learn organization license");
    invoiceBody.set("metadata[purchase_type]", "tcf_org_invoice");
    invoiceBody.set("metadata[organization_id]", organizationId);
    invoiceBody.set("metadata[organization_plan]", planKey);
    invoiceBody.set("metadata[learner_login_licenses]", String(managed.organization.seat_limit));
    invoiceBody.set("metadata[primary_admin_login_licenses]", "1");
    invoiceBody.set("metadata[co_admin_limit]", String(managed.organization.co_admin_limit));
    const invoice = await stripePost("/v1/invoices", invoiceBody, secret);

    const itemBody = new URLSearchParams();
    itemBody.set("customer", customer.id);
    itemBody.set("invoice", invoice.id);
    itemBody.set("amount", String(amountCents));
    itemBody.set("currency", "usd");
    itemBody.set("description", "TCF Learn " + managed.organization.seat_limit + "-seat organization license — both courses included");
    await stripePost("/v1/invoiceitems", itemBody, secret);

    const finalized = await stripePost("/v1/invoices/" + encodeURIComponent(invoice.id) + "/finalize", new URLSearchParams(), secret);
    const sent = await stripePost("/v1/invoices/" + encodeURIComponent(invoice.id) + "/send", new URLSearchParams(), secret);

    const admin = getSupabaseAdmin();
    const { error: updateError } = await admin.from("organizations").update({
      stripe_invoice_id: invoice.id,
      stripe_customer_id: customer.id,
      external_payment_reference: finalized.number || invoice.id,
    }).eq("id", organizationId);
    if (updateError) throw updateError;

    await auditLicenseAction({
      actorUserId: user.id,
      organizationId,
      action: "stripe_invoice_created_and_sent",
      details: {
        stripe_invoice_id: invoice.id,
        invoice_number: finalized.number || null,
        amount_cents: amountCents,
        due_days: days,
      },
    });

    return NextResponse.json({
      ok: true,
      organizationId,
      stripeInvoiceId: invoice.id,
      invoiceNumber: finalized.number || null,
      hostedInvoiceUrl: sent.hosted_invoice_url || finalized.hosted_invoice_url || null,
      adminActivationUrl: new URL("/organization/accept?token=" + managed.inviteToken, request.nextUrl.origin).toString(),
    });
  } catch (error) {
    if (organizationId) {
      const admin = getSupabaseAdmin();
      await admin.from("organizations").update({ status: "cancelled", license_notes: "Invoice creation failed before activation." }).eq("id", organizationId);
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create Stripe invoice." }, { status: 400 });
  }
}

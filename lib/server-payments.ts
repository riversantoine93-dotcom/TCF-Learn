const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const COURSE_SLUG = "turning-forward";
export const COURSE_PRICE_CENTS = 9700;

export function requireServerConfig() {
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase server configuration is missing.");
  return { supabaseUrl, serviceRoleKey };
}

export function requireStripeSecret() {
  if (!stripeSecretKey) throw new Error("Stripe server configuration is missing.");
  return stripeSecretKey;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function supabaseAdmin(path: string, init: RequestInit = {}) {
  const cfg = requireServerConfig();
  return fetch(`${cfg.supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: cfg.serviceRoleKey,
      Authorization: `Bearer ${cfg.serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

export async function findPaidEnrollment(email: string) {
  const normalized = normalizeEmail(email);
  const params = new URLSearchParams({
    purchaser_email: `eq.${normalized}`,
    course_slug: `eq.${COURSE_SLUG}`,
    active: "eq.true",
    payment_status: "eq.paid",
    select: "id,user_id,purchaser_email,course_slug,active",
    limit: "1",
  });
  const res = await supabaseAdmin(`/rest/v1/enrollments?${params}`);
  if (!res.ok) throw new Error("Unable to verify paid enrollment.");
  const rows = await res.json();
  return rows[0] || null;
}

export async function createSupabaseUser(email: string, password: string, fullName: string) {
  const res = await supabaseAdmin("/auth/v1/admin/users", {
    method: "POST",
    body: JSON.stringify({ email: normalizeEmail(email), password, email_confirm: true, user_metadata: { full_name: fullName } }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.msg || body?.message || "Unable to create user account.");
  return body;
}

export async function deleteSupabaseUser(userId: string) {
  await supabaseAdmin(`/auth/v1/admin/users/${userId}`, { method: "DELETE" });
}

export async function attachEnrollment(enrollmentId: number, userId: string) {
  const res = await supabaseAdmin(`/rest/v1/enrollments?id=eq.${enrollmentId}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error("Unable to attach course enrollment to user.");
}

export async function recordStripeEnrollment(session: any) {
  const email = normalizeEmail(session?.customer_details?.email || session?.customer_email || "");
  if (!email || session?.payment_status !== "paid") return;
  const payload = {
    purchaser_email: email,
    course_slug: COURSE_SLUG,
    active: true,
    payment_status: "paid",
    amount_paid: session.amount_total || COURSE_PRICE_CENTS,
    currency: session.currency || "usd",
    stripe_checkout_session_id: session.id,
    stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
    stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
    purchased_at: new Date((session.created || Math.floor(Date.now()/1000)) * 1000).toISOString(),
  };
  const res = await supabaseAdmin("/rest/v1/enrollments?on_conflict=stripe_checkout_session_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Unable to record Stripe enrollment: ${await res.text()}`);
}

export async function verifyStripeSignature(rawBody: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(signatureHeader.split(",").map(part => part.split("=", 2)));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return mismatch === 0;
}

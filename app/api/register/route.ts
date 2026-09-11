import { NextRequest, NextResponse } from "next/server";
import { attachEnrollments, createSupabaseUser, deleteSupabaseUser, findPaidEnrollments, normalizeEmail, recordStripeEnrollment, requireStripeSecret } from "@/lib/server-payments";
import { isPurchaseKey } from "@/lib/course-purchases";
import { saveSecurityQuestions, validateSecurityAnswers } from "@/lib/server-security";

async function paidSessionFromId(sessionId: string) {
  if (!sessionId.startsWith("cs_")) return null;
  const secret = requireStripeSecret();
  const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${secret}` },
    cache: "no-store",
  });
  const session = await res.json().catch(() => ({}));
  if (!res.ok || session?.payment_status !== "paid") return null;
  const purchase = session?.metadata?.purchase_key || session?.metadata?.course_slug;
  if (!isPurchaseKey(purchase)) return null;
  const email = session?.customer_details?.email || session?.customer_email || "";
  return email ? session : null;
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, securityAnswers, sessionId } = await request.json();
    if (!fullName?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Name, paid email, and a password of at least 8 characters are required." }, { status: 400 });
    }

    let answers;
    try {
      answers = validateSecurityAnswers(securityAnswers);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Choose and answer all three security questions." }, { status: 400 });
    }

    const enteredEmail = normalizeEmail(email);
    const verifiedSession = typeof sessionId === "string" && sessionId ? await paidSessionFromId(sessionId) : null;
    const verifiedPaidEmail = verifiedSession
      ? normalizeEmail(verifiedSession?.customer_details?.email || verifiedSession?.customer_email || "")
      : null;

    if (sessionId && !verifiedPaidEmail) {
      return NextResponse.json({ error: "We could not verify this paid TCF Learn checkout. Please return from your Stripe confirmation page and try again." }, { status: 403 });
    }
    if (verifiedPaidEmail && verifiedPaidEmail !== enteredEmail) {
      return NextResponse.json({ error: `Use the same email used at checkout: ${verifiedPaidEmail}` }, { status: 400 });
    }

    const normalized = verifiedPaidEmail || enteredEmail;
    let enrollments = await findPaidEnrollments(normalized);
    if (!enrollments.length && verifiedSession) {
      await recordStripeEnrollment(verifiedSession);
      enrollments = await findPaidEnrollments(normalized);
    }
    if (!enrollments.length) {
      return NextResponse.json({ error: "Your payment was verified, but course access could not be created yet. Please try again or contact TCF Learn support." }, { status: 409 });
    }

    const claimedUserIds = [...new Set(enrollments.map((enrollment: any) => enrollment.user_id).filter(Boolean))];
    const unclaimed = enrollments.filter((enrollment: any) => !enrollment.user_id);

    if (claimedUserIds.length > 1) {
      return NextResponse.json({ error: "This purchase email is connected to more than one account. Please contact TCF Learn support." }, { status: 409 });
    }

    if (claimedUserIds.length === 1) {
      if (unclaimed.length) await attachEnrollments(unclaimed.map((enrollment: any) => enrollment.id), claimedUserIds[0] as string);
      return NextResponse.json({ ok: true, existingAccount: true });
    }

    const user = await createSupabaseUser(normalized, password, fullName.trim());
    try {
      await saveSecurityQuestions(user.id, answers);
      await attachEnrollments(enrollments.map((enrollment: any) => enrollment.id), user.id);
    } catch (error) {
      await deleteSupabaseUser(user.id);
      throw error;
    }
    return NextResponse.json({ ok: true, existingAccount: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 500 });
  }
}

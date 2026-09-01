import { NextRequest, NextResponse } from "next/server";
import { attachEnrollment, createSupabaseUser, findPaidEnrollment, normalizeEmail } from "@/lib/server-payments";

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password } = await request.json();
    if (!fullName?.trim() || !email?.trim() || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Name, paid email, and a password of at least 8 characters are required." }, { status: 400 });
    }
    const normalized = normalizeEmail(email);
    const enrollment = await findPaidEnrollment(normalized);
    if (!enrollment) return NextResponse.json({ error: "No paid Turning Forward enrollment was found for this email. Use the same email used at checkout." }, { status: 403 });
    if (enrollment.user_id) return NextResponse.json({ error: "This purchase is already connected to an account. Please use User Login." }, { status: 409 });
    const user = await createSupabaseUser(normalized, password, fullName.trim());
    await attachEnrollment(enrollment.id, user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create account." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeEmail } from "@/lib/server-payments";
import { auditLicenseAction, requireSuperAdmin } from "@/lib/server-super-admin";

export async function POST(request: NextRequest) {
  try {
    const user = await requireSuperAdmin(request);
    const { email, organizationId } = await request.json();
    const normalized = normalizeEmail(String(email || ""));
    if (!normalized) return NextResponse.json({ error: "Email is required." }, { status: 400 });

    const admin: any = getSupabaseAdmin();
    const redirectTo = new URL("/reset-password", request.nextUrl.origin).toString();
    const { error } = await admin.auth.resetPasswordForEmail(normalized, { redirectTo });
    if (error) throw error;

    await auditLicenseAction({
      actorUserId: user.id,
      organizationId: organizationId || null,
      action: "password_reset_sent",
      details: { email: normalized },
    });

    return NextResponse.json({ ok: true, message: "Password reset email sent." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to send password reset." }, { status: 400 });
  }
}

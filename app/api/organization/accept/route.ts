import { NextRequest, NextResponse } from "next/server";
import { acceptOrganizationInvite } from "@/lib/server-organization";

export async function POST(request: NextRequest) {
  try {
    const { inviteToken, fullName, password, securityAnswers } = await request.json();
    if (!inviteToken || !fullName?.trim() || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Invitation, name, and a password of at least 8 characters are required." }, { status: 400 });
    }
    const result = await acceptOrganizationInvite({ inviteToken, fullName, password, securityAnswers });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to accept invitation." }, { status: 400 });
  }
}

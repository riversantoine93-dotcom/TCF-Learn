import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "This temporary provisioning route has been disabled." }, { status: 410 });
}

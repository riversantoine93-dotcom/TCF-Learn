import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Individual course checkout has been retired. TCF Learn is now licensed to organizations in 10, 50, and 100 learner-seat packages, with both courses included.",
      organizationPlansUrl: "/organizations",
    },
    { status: 410 }
  );
}

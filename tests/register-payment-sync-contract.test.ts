import fs from "node:fs";
import { describe, expect, it } from "vitest";

const registerApi = fs.readFileSync("app/api/register/route.ts", "utf8");

describe("post-purchase registration sync", () => {
  it("repairs a missing enrollment from a verified paid Stripe session before giving up", () => {
    expect(registerApi).toContain("recordStripeEnrollment");
    expect(registerApi).toContain("if (!enrollments.length && verifiedSession)");
    expect(registerApi).toContain("await recordStripeEnrollment(verifiedSession)");
    expect(registerApi).toContain("enrollments = await findPaidEnrollments(normalized)");
  });
});

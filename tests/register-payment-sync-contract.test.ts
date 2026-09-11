import fs from "node:fs";
import { describe, expect, it } from "vitest";

const registerApi = fs.readFileSync("app/api/register/route.ts", "utf8");

describe("post-purchase registration sync", () => {
  it("repairs a missing enrollment from the verified paid Stripe session before giving up", () => {
    expect(registerApi).toMatch(/recordStripeEnrollment/);
    expect(registerApi).toMatch(/if\s*\(!enrollments\.length\)[\s\S]*recordStripeEnrollment[\s\S]*findPaidEnrollments/);
  });
});

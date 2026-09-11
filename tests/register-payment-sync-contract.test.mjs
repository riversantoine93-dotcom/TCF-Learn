import fs from "node:fs";
import assert from "node:assert/strict";

const registerApi = fs.readFileSync("app/api/register/route.ts", "utf8");

assert.match(
  registerApi,
  /recordStripeEnrollment/,
  "Registration must be able to repair a missing enrollment from the verified paid Stripe session"
);
assert.match(
  registerApi,
  /if\s*\(!enrollments\.length\)[\s\S]*recordStripeEnrollment[\s\S]*findPaidEnrollments/,
  "Registration must record the verified checkout and re-check enrollments before returning a sync error"
);

console.log("register payment sync contract passed");

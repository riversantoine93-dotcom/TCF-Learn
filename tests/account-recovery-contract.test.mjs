import fs from "node:fs";
import assert from "node:assert/strict";

const registerPage = fs.readFileSync("app/register/page.tsx", "utf8");
const registerApi = fs.readFileSync("app/api/register/route.ts", "utf8");
const loginPage = fs.readFileSync("app/login/page.tsx", "utf8");

assert.match(registerPage, /securityQuestion1/, "Registration must collect security question 1");
assert.match(registerPage, /securityQuestion2/, "Registration must collect security question 2");
assert.match(registerPage, /securityQuestion3/, "Registration must collect security question 3");
assert.match(registerApi, /saveSecurityQuestions/, "Registration API must persist hashed security answers");
assert.match(loginPage, /\/forgot-password/, "Login must provide a forgot-password link");
assert.ok(fs.existsSync("app/forgot-password/page.tsx"), "Forgot-password page must exist");
assert.ok(fs.existsSync("app/reset-password/page.tsx"), "Reset-password page must exist");
console.log("account recovery contract passed");

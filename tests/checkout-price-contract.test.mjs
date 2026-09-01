import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("app/api/checkout/route.ts", "utf8");
assert.match(source, /price_1UArD3D9JGdKoOvukMYQKkjS/, "Checkout must use the permanent live $97 Turning Forward Stripe Price ID");
assert.doesNotMatch(source, /price_data/, "Checkout should not dynamically create price_data once a permanent Stripe Price exists");
console.log("checkout price contract passed");

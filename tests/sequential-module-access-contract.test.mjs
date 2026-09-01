import fs from "node:fs";
import assert from "node:assert/strict";

const overview = fs.readFileSync("app/course/turning-forward/page.tsx", "utf8");
const gate = fs.readFileSync("components/PaidCourseGate.tsx", "utf8");
const layout = fs.readFileSync("app/course/turning-forward/[module]/layout.tsx", "utf8");

assert.match(overview, /moduleIsComplete/, "Course overview must determine whether prior modules are complete");
assert.match(overview, /Complete Module/, "Locked module cards must explain which prior module must be completed");
assert.match(gate, /moduleSlug/, "Paid course gate must receive the requested module slug");
assert.match(gate, /previousModuleComplete/, "Direct module URLs must enforce prior-module completion");
assert.match(gate, /Complete Module/, "Direct URL lock must explain the prerequisite module");
assert.match(layout, /useParams|params/, "Module layout must identify the requested module before granting access");
console.log("sequential module access contract passed");

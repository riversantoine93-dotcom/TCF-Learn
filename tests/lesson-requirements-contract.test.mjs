import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("app/course/turning-forward/[module]/page.tsx", "utf8");

assert.match(source, /characters? (remaining|minimum|required)/i, "Written responses should show a live character requirement message");
assert.match(source, /Requirement met/i, "Written responses should confirm when their requirement is met");
assert.match(source, /Complete all required written responses/i, "Lesson completion area should explain why the button is disabled");
assert.match(source, /answer all Knowledge Check questions/i, "Lesson completion area should explain the quiz requirement");

console.log("lesson requirement guidance contract passed");

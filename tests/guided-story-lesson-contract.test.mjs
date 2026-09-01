import fs from "node:fs";
import assert from "node:assert/strict";

const model=fs.readFileSync("lib/course-content.ts","utf8");
const moduleOne=fs.readFileSync("lib/module-one-content.ts","utf8");
const page=fs.readFileSync("app/course/turning-forward/[module]/page.tsx","utf8");

for(const field of ["hook","scenario","teachingCards","coachVoice","applyPrompt"]){
  assert.match(model,new RegExp(field),`Lesson content model must support ${field}`);
}
assert.match(moduleOne,/YOU ARE NOT STARTING OVER/i,"Module 1 Lesson 1 needs a strong guided-story hook");
assert.match(moduleOne,/reputation/i,"Lesson 1 must teach reputation versus identity");
assert.match(moduleOne,/responsibility/i,"Lesson 1 must teach responsibility without shame");
assert.match(page,/WHAT WOULD YOU DO\?/i,"Renderer must present the scenario decision");
assert.match(page,/COACH['’]S VOICE/i,"Renderer must include Coach's Voice");
assert.match(page,/STOP & APPLY/i,"Renderer must include Stop & Apply");
console.log("guided story lesson contract passed");

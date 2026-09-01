import fs from "node:fs";
import assert from "node:assert/strict";

const stories=fs.readFileSync("lib/guided-story-content.ts","utf8");
const component=fs.readFileSync("components/GuidedStoryLesson.tsx","utf8");
const page=fs.readFileSync("app/course/turning-forward/[module]/page.tsx","utf8");

assert.match(stories,/YOU ARE NOT STARTING OVER/i,"Module 1 Lesson 1 needs a strong guided-story hook");
assert.match(stories,/reputation/i,"Lesson 1 must teach reputation versus identity");
assert.match(stories,/responsibility/i,"Lesson 1 must teach responsibility without shame");
assert.match(component,/WHAT WOULD YOU DO\?/i,"Renderer must present the scenario decision");
assert.match(component,/COACH['’]S VOICE/i,"Renderer must include Coach's Voice");
assert.match(component,/STOP &amp; APPLY/i,"Renderer must include Stop & Apply");
assert.match(page,/getGuidedStory/,"Lesson renderer must load guided story content");
assert.doesNotMatch(page,/LessonVideo/,"Guided lessons should not require a video at the beginning");
console.log("guided story lesson contract passed");

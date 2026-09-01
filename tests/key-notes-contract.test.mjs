import assert from "node:assert/strict";
import fs from "node:fs";

const renderer=fs.readFileSync(new URL("../components/GuidedStoryLesson.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../components/GuidedStoryLesson.module.css",import.meta.url),"utf8");

assert.match(renderer,/KEY NOTES/i);
assert.match(renderer,/<details/);
assert.match(renderer,/<summary/);
assert.match(renderer,/story\.teachingCards\.map/,"key notes should use each lesson's topic-specific teaching concepts");
assert.match(renderer,/Why it matters/i);
assert.match(css,/\.keyNotes/);
assert.match(css,/\.keyNoteItem/);
console.log("key notes contract passed");

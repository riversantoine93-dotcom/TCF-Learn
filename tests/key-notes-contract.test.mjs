import assert from "node:assert/strict";
import fs from "node:fs";

const content=fs.readFileSync(new URL("../lib/guided-story-content.ts",import.meta.url),"utf8");
const renderer=fs.readFileSync(new URL("../components/GuidedStoryLesson.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../components/GuidedStoryLesson.module.css",import.meta.url),"utf8");

assert.match(content,/keyNotes:/,"guided stories need key notes data");
assert.match(content,/term:/,"key notes need terms");
assert.match(content,/definition:/,"key notes need definitions");
assert.match(content,/whyItMatters:/,"key notes need why-it-matters guidance");
assert.match(renderer,/KEY NOTES/i);
assert.match(renderer,/<details/);
assert.match(renderer,/<summary/);
assert.match(renderer,/story\.keyNotes\.map/);
assert.match(css,/\.keyNotes/);
assert.match(css,/\.keyNoteItem/);
console.log("key notes contract passed");

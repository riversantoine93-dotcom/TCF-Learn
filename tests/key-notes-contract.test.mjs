import assert from "node:assert/strict";
import fs from "node:fs";

const renderer=fs.readFileSync(new URL("../components/GuidedStoryLesson.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../components/GuidedStoryLesson.module.css",import.meta.url),"utf8");

assert.match(renderer,/KEY NOTES/i);
assert.match(renderer,/notesOpen/);
assert.match(renderer,/setNotesOpen/);
assert.match(renderer,/aria-modal="true"/);
assert.match(renderer,/role="dialog"/);
assert.match(renderer,/Close key notes/i);
assert.match(renderer,/story\.teachingCards\.map/,"key notes should use each lesson's topic-specific teaching concepts");
assert.match(renderer,/Why it matters/i);
assert.doesNotMatch(renderer,/<details/);
assert.match(css,/\.keyNotesTrigger/);
assert.match(css,/\.keyNotesOverlay/);
assert.match(css,/\.keyNotesDrawer/);
assert.match(css,/position:fixed/);
assert.match(css,/right:0/);
console.log("key notes drawer contract passed");

import fs from "node:fs";
import assert from "node:assert/strict";

const source=fs.readFileSync("lib/guided-story-content.ts","utf8");
for(let moduleNumber=1;moduleNumber<=8;moduleNumber++){
  for(let lessonNumber=1;lessonNumber<=3;lessonNumber++){
    assert.match(source,new RegExp(`\\"module-${moduleNumber}:${lessonNumber}\\"`),`Missing guided story for module ${moduleNumber} lesson ${lessonNumber}`);
  }
}
assert.equal((source.match(/teachingCards:/g)||[]).length,24,"Every lesson must define teaching cards");
assert.equal((source.match(/coachVoice:/g)||[]).length,24,"Every lesson must define Coach's Voice guidance");
assert.equal((source.match(/applyPrompt:/g)||[]).length,24,"Every lesson must define Stop & Apply guidance");
console.log("guided story content coverage passed");

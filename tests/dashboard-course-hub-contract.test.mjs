import assert from "node:assert/strict";
import fs from "node:fs";

const dashboard=fs.readFileSync(new URL("../app/dashboard/page.tsx",import.meta.url),"utf8");
assert.match(dashboard,/TCF LEARN COURSE HUB/i);
assert.match(dashboard,/MY COURSES|COURSE LIBRARY/i);
assert.match(dashboard,/Turning Forward: The Work Beyond Fear/);
assert.match(dashboard,/From Thought to Freedom/);
assert.match(dashboard,/Correcting Criminal Thinking Errors/);
assert.match(dashboard,/COMING SOON/i);
assert.match(dashboard,/DECEMBER 2026/i);
assert.match(dashboard,/courseCatalog/,"dashboard should be structured for future course cards");
console.log("dashboard course hub contract passed");

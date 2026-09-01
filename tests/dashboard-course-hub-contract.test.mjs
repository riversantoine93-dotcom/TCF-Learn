import assert from "node:assert/strict";
import fs from "node:fs";

const dashboard=fs.readFileSync(new URL("../app/dashboard/page.tsx",import.meta.url),"utf8");
const css=fs.readFileSync(new URL("../app/dashboard/dashboard.css",import.meta.url),"utf8");
assert.match(dashboard,/dashboard-shell/);
assert.match(dashboard,/dashboard-sidebar/);
assert.match(dashboard,/course-thumbnails\/turning-forward\.png/);
assert.match(dashboard,/course-thumbnails\/from-thought-to-freedom\.png/);
assert.match(css,/\.course-thumb img\{[^}]*object-fit:contain/);
assert.match(css,/\.course-thumb\{[^}]*padding:/);
assert.match(css,/\.course-thumb\{[^}]*background:/);
console.log("dashboard contained thumbnail contract passed");

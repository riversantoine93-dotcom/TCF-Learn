import assert from "node:assert/strict";
import fs from "node:fs";

const page = fs.readFileSync(new URL("../app/course/turning-forward/[module]/page.tsx", import.meta.url), "utf8");

const playbackIds = [
  "NV5Dudc13gqQfDXMX4miR7kYYlMrd4lZhRuUlqHZUrY",
  "2bwbixKQCmfLfvrFvvwoOc824fqZMcMYYl01PGMQbogE",
  "00CJGoE8rSkT8kLHKE02v62G00zVb730201XxyhtB00iYD9DA",
  "iWgQj00l901AqBM42MH63ykM00hxfMchz45n8T00O85hDvs",
  "9hJRiLUzG3q9YZy01POlEtc4Ja00QOUhBnBOsSiAHMyzU",
  "Tr2Omgh02bFQKZSkYfxfQ9N7czTt029otobWkm1AZ7ZT4",
  "RzGH2gaxhU01CJQ9HvA1PMmwQxVU902AXuwjHnh9zRddM",
  "00v6chrDJ6VAEZWMslXC1Q7VKxuw8tFJ7iyv5Rrt3aVA"
];

for (const id of playbackIds) assert.ok(page.includes(id), `missing Mux playback id ${id}`);
assert.match(page, /moduleOpenerDoneKey/);
assert.match(page, /Continue to Lesson 1/i);
assert.match(page, /postMessage/);
assert.match(page, /ended/);
console.log("module opener contract passed");

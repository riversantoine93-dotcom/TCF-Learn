import assert from "node:assert/strict";
import fs from "node:fs";

const gate = fs.readFileSync(new URL("../components/ModuleOpenerGate.tsx", import.meta.url), "utf8");
const layout = fs.readFileSync(new URL("../app/course/turning-forward/[module]/layout.tsx", import.meta.url), "utf8");

const mapping = [
  ["module-1", "00CJGoE8rSkT8kLHKE02v62G00zVb730201XxyhtB00iYD9DA", "16 / 9"],
  ["module-2", "2bwbixKQCmfLfvrFvvwoOc824fqZMcMYYl01PGMQbogE", "16 / 9"],
  ["module-3", "NV5Dudc13gqQfDXMX4miR7kYYlMrd4lZhRuUlqHZUrY", "256 / 135"],
  ["module-4", "iWgQj00l901AqBM42MH63ykM00hxfMchz45n8T00O85hDvs", "256 / 135"],
  ["module-5", "RzGH2gaxhU01CJQ9HvA1PMmwQxVU902AXuwjHnh9zRddM", "16 / 9"],
  ["module-6", "9hJRiLUzG3q9YZy01POlEtc4Ja00QOUhBnBOsSiAHMyzU", "16 / 9"],
  ["module-7", "00v6chrDJ6VAEZWMslXC1Q7VKxuw8tFJ7iyv5Rrt3aVA", "16 / 9"],
  ["module-8", "Tr2Omgh02bFQKZSkYfxfQ9N7czTt029otobWkm1AZ7ZT4", "16 / 9"]
];

for (const [slug, id, ratio] of mapping) {
  const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedRatio = ratio.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  assert.match(gate, new RegExp(`"${escapedSlug}"[^\\n]+playbackId: "${escapedId}"[^\\n]+ratio: "${escapedRatio}"`), `wrong opener mapping for ${slug}`);
}
assert.match(gate, /moduleOpenerDoneKey/);
assert.match(gate, /Continue to Lesson 1/i);
assert.match(gate, /Replay Module Introduction/i);
assert.match(gate, /showReplay/);
assert.match(gate, /player\.js/);
assert.match(gate, /player\.on\("ended"/);
assert.match(gate, /setCurrentTime/);
assert.match(gate, /window\.location\.reload\(\)/, "continue should reload cleanly after persisting opener completion");
assert.match(layout, /ModuleOpenerGate/);
console.log("module opener contract passed");

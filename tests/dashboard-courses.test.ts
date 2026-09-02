import { expect, it } from "vitest";
import { courseProgressSummary } from "../lib/courses/dashboard";

it("calculates progress independently for a 30-lesson course", () => {
  const progress = { m1lesson1: true, m1lesson2: true, m1lesson3: true };
  expect(courseProgressSummary(progress, 30)).toEqual({ complete: 3, percent: 10 });
});

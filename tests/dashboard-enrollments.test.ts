import { describe, expect, it } from "vitest";
import { activeCourseSlugs } from "../lib/dashboard-enrollments";

describe("dashboard enrollments", () => {
  it("returns only active supported course slugs", () => {
    expect(activeCourseSlugs([
      { course_slug: "turning-forward", active: true },
      { course_slug: "thought-to-freedom", active: false },
      { course_slug: "unknown-course", active: true },
    ])).toEqual(["turning-forward"]);
  });

  it("deduplicates bundle-created enrollment rows", () => {
    expect(activeCourseSlugs([
      { course_slug: "turning-forward", active: true },
      { course_slug: "turning-forward", active: true },
      { course_slug: "thought-to-freedom", active: true },
    ])).toEqual(["turning-forward", "thought-to-freedom"]);
  });

  it("returns no courses when there are no active purchases", () => {
    expect(activeCourseSlugs([])).toEqual([]);
  });
});

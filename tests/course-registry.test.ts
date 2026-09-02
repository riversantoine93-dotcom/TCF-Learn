import { describe, expect, it } from "vitest";
import { COURSE_SLUGS, getCourseDefinition } from "../lib/courses/registry";

describe("course registry", () => {
  it("contains stable slugs for both TCF Learn courses", () => {
    expect(COURSE_SLUGS).toEqual(["turning-forward", "thought-to-freedom"]);
  });

  it("returns no course for an unknown slug", () => {
    expect(getCourseDefinition("does-not-exist")).toBeUndefined();
  });
});

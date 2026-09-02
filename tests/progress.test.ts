import { describe, expect, it } from "vitest";
import { progressStorageKey } from "../lib/progress";

describe("course progress isolation", () => {
  it("keeps the legacy Turning Forward key", () => {
    expect(progressStorageKey("turning-forward")).toBe("turning-forward-progress");
  });

  it("uses a distinct Thought to Freedom key", () => {
    expect(progressStorageKey("thought-to-freedom")).toBe("thought-to-freedom-progress");
  });
});

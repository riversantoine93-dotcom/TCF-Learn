import { describe, expect, it } from "vitest";
import { thoughtToFreedomCourse } from "../lib/courses/thought-to-freedom";

const expectedTitles = [
  "The Closed Channel",
  "Viewing Self as a Good Person",
  "Victimstance",
  "Lack of Effort",
  "Lack of Interest in Responsible Performance",
  "Ownership Attitude",
  "Fear of Fear",
  "Lack of Time Perspective",
  "Power Thrust",
  "Uniqueness",
];

describe("Thought to Freedom curriculum", () => {
  it("contains one orientation, ten modules, and thirty lessons", () => {
    expect(thoughtToFreedomCourse.orientation?.title).toBe("Before the Action Comes the Thought");
    expect(thoughtToFreedomCourse.modules).toHaveLength(10);
    expect(thoughtToFreedomCourse.modules.flatMap((m) => m.lessons)).toHaveLength(30);
  });

  it("preserves workbook chapter order", () => {
    expect(thoughtToFreedomCourse.modules.map((m) => m.title)).toEqual(expectedTitles);
  });

  it("gives every module three lessons and a core question", () => {
    for (const module of thoughtToFreedomCourse.modules) {
      expect(module.lessons).toHaveLength(3);
      expect(module.coreQuestion.length).toBeGreaterThan(10);
    }
  });

  it("requires reflection and one-answer knowledge checks in every lesson", () => {
    for (const lesson of thoughtToFreedomCourse.modules.flatMap((m) => m.lessons)) {
      const reflections = lesson.blocks.filter((block) => block.type === "reflection");
      const checks = lesson.blocks.filter((block) => block.type === "knowledge-check");
      expect(reflections.length).toBeGreaterThan(0);
      expect(reflections.every((block) => block.type === "reflection" && block.minChars === 50)).toBe(true);
      expect(checks.length).toBeGreaterThan(0);
      for (const block of checks) {
        if (block.type !== "knowledge-check") continue;
        expect(block.question.options.filter((option) => option.correct)).toHaveLength(1);
        expect(block.question.options.every((option) => option.feedback.length > 0)).toBe(true);
      }
    }
  });
});

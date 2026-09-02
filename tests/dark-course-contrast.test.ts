import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("dark mode course contrast", () => {
  const css = readFileSync("app/page-theme.css", "utf8");

  it("uses gold for the course hero label, title, and subtitle in dark mode", () => {
    expect(css).toContain('html[data-tcf-theme="dark"] .course-hero .eyebrow');
    expect(css).toContain('html[data-tcf-theme="dark"] .course-hero h1');
    expect(css).toContain('html[data-tcf-theme="dark"] .course-hero p');
    expect(css).toContain("color:#d9c7a5");
  });

  it("uses gold for module banner headings and readable supporting text", () => {
    expect(css).toContain('html[data-tcf-theme="dark"] .module-banner h1');
    expect(css).toContain('html[data-tcf-theme="dark"] .module-banner>span');
    expect(css).toContain('html[data-tcf-theme="dark"] .module-banner p');
  });

  it("keeps lesson content on a light surface with black text in dark mode", () => {
    expect(css).toContain('html[data-tcf-theme="dark"] .lesson-content{background:#fbf8f2;color:#0b0b0b');
    expect(css).toContain('html[data-tcf-theme="dark"] .lesson-content>p{color:#403c35');
    expect(css).toContain('html[data-tcf-theme="dark"] .lesson-kicker{color:#8c7249');
  });
});

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PAGE_THEME_ATTRIBUTE } from "../lib/header-theme";

describe("full-page light and dark theme", () => {
  it("uses a root data attribute so the theme can style the whole page", () => {
    expect(PAGE_THEME_ATTRIBUTE).toBe("data-tcf-theme");
    const header = readFileSync("components/Header.tsx", "utf8");
    const courses = readFileSync("app/courses/page.tsx", "utf8");
    expect(header).toContain("document.documentElement.dataset.tcfTheme");
    expect(courses).toContain("document.documentElement.dataset.tcfTheme");
  });

  it("defines whole-page dark and light theme tokens", () => {
    const css = readFileSync("app/page-theme.css", "utf8");
    expect(css).toContain('html[data-tcf-theme="dark"]');
    expect(css).toContain('html[data-tcf-theme="light"]');
    expect(css).toContain('html[data-tcf-theme="dark"] body');
    expect(css).toContain(".auth-shell");
    expect(css).toContain(".lesson-card");
    expect(css).toContain(".module-list .module-card");
  });

  it("reduces the dashboard podcast lockup image from 110px to 55px", () => {
    const css = readFileSync("app/dashboard-scale.css", "utf8");
    expect(css).toContain(".podcast-lockup img{display:block;width:55px!important;height:55px!important");
  });
});

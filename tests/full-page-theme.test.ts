import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { PAGE_THEME_ATTRIBUTE } from "../lib/header-theme";

describe("full-page light and dark theme", () => {
  it("uses a root data attribute so the theme can style the whole page", () => {
    expect(PAGE_THEME_ATTRIBUTE).toBe("data-tcf-theme");
    const header = readFileSync("components/Header.tsx", "utf8");
    expect(header).toContain("document.documentElement.dataset.tcfTheme");
  });

  it("defines whole-page dark and light theme tokens", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toContain('html[data-tcf-theme="dark"]');
    expect(css).toContain('html[data-tcf-theme="light"]');
    expect(css).toContain('html[data-tcf-theme="dark"] body');
  });

  it("reduces the dashboard podcast lockup image from 110px to 55px", () => {
    const css = readFileSync("app/dashboard/dashboard.css", "utf8");
    expect(css).toContain(".podcast-lockup img{display:block;width:55px;height:55px");
  });
});

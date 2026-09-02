import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("dark course inputs and module banners", () => {
  const css = readFileSync("app/page-theme.css", "utf8");

  it("keeps typed lesson interaction answers readable in dark mode", () => {
    expect(css).toContain('html[data-tcf-theme="dark"] .interaction textarea{background:#fff;color:#0b0b0b');
  });

  it("uses a solid dark module banner instead of a gradient", () => {
    expect(css).toContain('html[data-tcf-theme="dark"] .module-banner{background:#111');
  });

  it("keeps dark-mode module banner headings gold", () => {
    expect(css).toContain('html[data-tcf-theme="dark"] .module-banner>span,html[data-tcf-theme="dark"] .module-banner h1{color:#d9c7a5}');
  });
});
